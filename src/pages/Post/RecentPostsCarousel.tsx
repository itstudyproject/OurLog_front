import React, { useRef } from 'react';
import '../../styles/RecentPostsCarousel.css';
import '../../styles/BidHistory.css';
import Arrow from '../../components/Arrow'; // 화살표 컴포넌트
import { useNavigate } from 'react-router-dom';

type Post = {
  id: number;
  title: string;
  price: number;
  thumbnailUrl: string;
};

interface Props {
  posts: Post[];
}

const RecentPostsCarousel: React.FC<Props> = ({ posts }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft - 300,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft + 300,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bid-list">
      {posts.map((post) => (
        <div 
          className="bid-item" 
          key={post.id}
          onClick={() => navigate(`/art/${post.id}`)}
        >
          <div className="bid-artwork">
            <img src={post.thumbnailUrl} alt={post.title} />
          </div>
          <div className="bid-details">
            <h3>{post.title}</h3>
            <p className="bid-amount">₩{post.price.toLocaleString()}</p>
            <p>최근 본 게시물</p>
          </div>
          <div className="bid-actions">
            <button className="bid-now-button" onClick={(e) => {
              e.stopPropagation();
              navigate(`/art/${post.id}`);
            }}>
              자세히 보기
            </button>
          </div>
        </div>
      ))}
      
      {posts.length === 0 && (
        <div className="bid-item" style={{ justifyContent: "center", padding: "30px" }}>
          <p>최근 본 게시물이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default RecentPostsCarousel;
