import React, { useState, useEffect } from "react";
import "../styles/BulletinBoard.css";
import { getAuthHeaders } from "../utils/auth";
import { Link } from "react-router-dom";

type CategoryKey = "news" | "free" | "promotion" | "request";

interface PostItem {
  id: number;
  title: string;
  description: string;
  date: string;
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

const isLoggedIn = () => {
  const token = localStorage.getItem("accessToken");
  return !!token;
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

  useEffect(() => {
    const fetchCategoryPosts = async (category: CategoryKey) => {
      try {
        const boardNo = boardIdMap[category];
        const url = `http://localhost:8080/ourlog/post/list?boardNo=${boardNo}&page=1&size=2&type=t&keyword=`;
        console.log(`Fetching ${category} posts from:`, url);
        const res = await fetch(url);
        if (!res.ok) throw new Error("데이터 로딩 실패: " + res.status);
        const data = await res.json();
        console.log(`${category} 데이터:`, data);

        const posts: PostItem[] = (data.pageResultDTO?.dtoList || []).map(
          (item: any) => ({
            id: item.postId || item.id,
            title: item.title,
            description: item.content || "설명 없음",
            date:
              item.regDate?.split("T")[0] ||
              item.createdAt?.split("T")[0] ||
              "",
          })
        );

        setCategories((prev) => ({ ...prev, [category]: posts }));
      } catch (error) {
        console.error(`${category} 데이터 불러오기 실패:`, error);
      }
    };

    (async () => {
      await Promise.all(
        (Object.keys(boardIdMap) as CategoryKey[]).map(fetchCategoryPosts)
      );
    })();
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
                {items.length === 0 && (
                  <li>
                    {isLoggedIn()
                      ? "게시글이 없습니다."
                      : "로그인이 필요합니다."}
                  </li>
                )}
                {items.map((item) => (
                  <li key={item.id} className="category-item">
                    <div className="category-thumbnail" />
                    <div className="category-text">
                      <Link
                        to={`/post/${item.id}`}
                        className="category-title-link"
                      >
                        <p className="category-title">{item.title}</p>
                      </Link>
                      <p className="category-description">{item.description}</p>
                      <p className="category-date">{item.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BulletinBoard;
