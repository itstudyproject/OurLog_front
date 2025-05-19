import React, { useState, useEffect } from "react";
import "../styles/BulletinBoard.css";
import { Link } from "react-router-dom";

type CategoryKey = "news" | "free" | "promotion" | "request";

interface PostItem {
  id: number;
  title: string;
  description: string;
  date: string;
  category: CategoryKey;
}

const categoryLabels: Record<CategoryKey, string> = {
  news: "새소식",
  free: "자유",
  promotion: "홍보",
  request: "요청",
};

const boardIdMap: Record<CategoryKey, number> = {
  news: 1,
  free: 2,
  promotion: 3,
  request: 4,
};

const BulletinBoard: React.FC = () => {
  const [categories, setCategories] = useState<Record<CategoryKey, PostItem[]>>(
    {
      news: [],
      free: [],
      promotion: [],
      request: [],
    }
  );

  const formatDate = (item: any): string => {
    return item.regDate?.split("T")[0] || item.createdAt?.split("T")[0] || "";
  };

  const renderPostItem = (item: PostItem) => (
    <li key={`${item.category}-${item.id}`} className="category-item">
      <div className="category-thumbnail" />
      <div className="category-text">
        <Link to={`/post/${item.id}`} className="category-title-link">
          <p className="category-title">{item.title}</p>
        </Link>
        <p className="category-description">{item.description}</p>
        <p className="category-date">{item.date}</p>
      </div>
    </li>
  );

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        // 1) 모든 카테고리별로 게시물 가져오기
        const results = await Promise.all(
          (Object.keys(boardIdMap) as CategoryKey[]).map(async (category) => {
            const boardNo = boardIdMap[category];
            const url = `http://localhost:8080/ourlog/post/list?boardNo=${boardNo}&size=10&type=t&keyword=`;
            // size를 충분히 크게 잡아서 많이 받아오기
            const res = await fetch(url);
            if (!res.ok) throw new Error("데이터 로딩 실패: " + res.status);
            const data = await res.json();
            const posts: PostItem[] = (data.pageResultDTO?.dtoList || []).map(
              (item: any) => ({
                id: item.postId || item.id,
                title: item.title,
                description: item.content || "설명 없음",
                date: formatDate(item),
                category,
              })
            );
            return { category, posts };
          })
        );

        // 2) 전역 중복 제거를 위한 Map (id -> PostItem)
        const uniquePostsMap = new Map<number, PostItem>();

        // 3) 각 카테고리별로 중복 안되는 게시물 2개씩 선별
        const grouped: Record<CategoryKey, PostItem[]> = {
          news: [],
          free: [],
          promotion: [],
          request: [],
        };

        for (const { category, posts } of results) {
          for (const post of posts) {
            if (grouped[category].length >= 2) break; // 2개 이상이면 멈춤

            if (!uniquePostsMap.has(post.id)) {
              uniquePostsMap.set(post.id, post);
              grouped[category].push(post);
            }
            // 중복이면 해당 카테고리에는 추가 안함
          }
        }

        setCategories(grouped);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };

    fetchAllCategories();
  }, []);

  return (
    <section className="bulletin-board-section">
      <div className="bulletin-left">
        <img
          src="/images/bulletinboard.png"
          alt="카테고리 관련 썸네일 이미지"
          className="bulletin-thumbnail"
        />
      </div>

      <div className="category-container">
        {Object.entries(categories).map(([key, items]) => {
          const typedKey = key as CategoryKey;
          return (
            <div key={typedKey}>
              <h3 className="category-header">{categoryLabels[typedKey]}</h3>
              <ul className="category-list">
                {items.length === 0 ? (
                  <li className="no-post">게시글이 없습니다.</li>
                ) : (
                  items.map(renderPostItem)
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BulletinBoard;
