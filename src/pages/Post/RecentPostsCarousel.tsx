import React, { useRef } from 'react';
import '../../styles/RecentPostsCarousel.css';
import Arrow from '../../components/Arrow'; // 화살표 컴포넌트

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
    <div className="carousel-container relative">
      {/* 왼쪽 화살표 */}
      <div className="arrow-container left" onClick={scrollLeft}>
        <Arrow direction="left" />
      </div>

      {/* 콘텐츠 */}
      <div className="carousel-content" ref={scrollRef}>
        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <img src={post.thumbnailUrl} alt={post.title} className="post-image" />
            <div>{post.title}</div>
            <div>₩{post.price.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* 오른쪽 화살표 */}
      <div className="arrow-container right" onClick={scrollRight}>
        <Arrow direction="right" />
      </div>
    </div>
  );
};

export default RecentPostsCarousel;
