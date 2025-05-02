// src/pages/MyPage.tsx
import React from 'react';

import "../styles/MyPage.css";


const MyPage = () => {
  return (
    <div className="mypage-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="profile">
          <img src="/images/99.jpg" alt="profile" className="profile-img" />
          <h2 className="nickname">만수</h2>
          <p className="email">minsu@example.com</p>
          <div className="follow-stats">
            <span>찜한 ⓘ 150</span>
            <span>찜받은 ⓘ 30</span>
          </div>
        </div>
        <ul className="sidebar-menu">
          <li><a href="#">프로필 수정</a></li>
          <li><a href="#">계정 설정</a></li>
          <li><a href="#">로그아웃</a></li>
          <li><a href="#" className="danger">계정 삭제</a></li>
        </ul>
        <button className="write-btn">내 글 등록하기</button>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="page-title">마이 페이지</h1>

        <Section title="최근 본 게시물">
          <div className="grid grid-cols-4">
            {recentPosts.map(post => (
              <PostCard key={post.title} {...post} />
            ))}
          </div>
        </Section>

        <Section title="내 입찰/구매 내역">
          <div className="grid grid-cols-2">
            {purchaseHistory.map(post => (
              <PostCard key={post.title} {...post} badge={post.badge} />
            ))}
          </div>
        </Section>

        <Section title="북마크한 작품들">
          <div className="grid grid-cols-3">
            {bookmarked.map(post => (
              <PostCard key={post.title} {...post} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="section">
    <h2 className="section-title">{title}</h2>
    {children}
  </div>
);

const PostCard = ({
  image,
  title,
  price,
  badge,
}: {
  image: string;
  title: string;
  price: string;
  badge?: string;
}) => (
  <div className="card">
    <figure>
      <img src={image} alt={title} />
    </figure>
    <div className="card-body">
      <h3 className="card-title">{title}</h3>
      <p>{price}</p>
      {badge && <div className="badge">{badge}</div>}
    </div>
  </div>
);

// 임시 데이터
const recentPosts = [
  { image: '/images/11.jpg', title: 'Suntowers', price: '₩1,000,000' },
  { image: '/images/22.jpg', title: 'Blue Landscape', price: '₩800,000' },
  { image: '/images/33.jpg', title: 'Portrait of Woman', price: '₩730,000' },
  { image: '/images/44.jpg', title: 'Abstract Forms', price: '₩3,000,000' },
];

const purchaseHistory = [
  { image: '/images/55.jpg', title: 'Sitting', price: '₩1,000,000', badge: '복원 중' },
  { image: '/images/66.jpg', title: 'Red Abstraction', price: '₩500,000', badge: '보관 중' },
];

const bookmarked = [
  { image: '/images/77.jpg', title: 'Cityscape', price: '₩400,000' },
  { image: '/images/88.jpg', title: 'Green Fields', price: '₩400,000' },
];

export default MyPage;
