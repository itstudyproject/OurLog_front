import React from 'react';

const MyPage = () => {
  return (
    <div className="bg-base-200 text-base-content flex">
      {/* Sidebar */}
      <aside className="w-72 bg-base-100 p-4 text-base-content shadow-md flex-shrink-0">
        <div className="flex flex-col items-center mb-6">
          <img src="/src/images/99.jpg" alt="profile" className="w-24 h-24 rounded-full mb-2" />
          <h2 className="text-xl font-semibold">만수</h2>
          <p className="text-sm">minsu@example.com</p>
          <div className="mt-2 text-sm space-x-2">
            <span>찜한 ⓘ 150</span>
            <span>찜받은 ⓘ 30</span>
          </div>
        </div>
        <ul className="menu flex flex-col items-center text-center">
  <li><a>프로필 수정</a></li>
  <li><a>계정 설정</a></li>
  <li><a>로그아웃</a></li>
  <li><a className="text-error">계정 삭제</a></li>
</ul>

        <button className="btn btn-outline mt-4 w-full">내 글 등록하기</button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">마이 페이지</h1>

        {/* 최근 본 게시물 */}
        <Section title="최근 본 게시물">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentPosts.map(post => (
              <PostCard key={post.title} {...post} />
            ))}
          </div>
        </Section>

        {/* 내 입찰/구매 내역 */}
        <Section title="내 입찰/구매 내역">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchaseHistory.map(post => (
              <PostCard key={post.title} {...post} badge={post.badge} />
            ))}
          </div>
        </Section>

        {/* 북마크한 작품들 */}
        <Section title="북마크한 작품들">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
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
  <div className="card bg-base-100 shadow-md">
    <figure>
      <img src={image} alt={title} className="h-40 w-full object-cover" />
    </figure>
    <div className="card-body p-4">
      <h3 className="card-title text-sm">{title}</h3>
      <p className="text-sm">{price}</p>
      {badge && <div className="badge badge-success mt-2">{badge}</div>}
    </div>
  </div>
);

// 임시 데이터
const recentPosts = [
  { image: '/src/images/11.jpg', title: 'Suntowers', price: '₩1,000,000' },
  { image: '/src/images/22.jpg', title: 'Blue Landscape', price: '₩800,000' },
  { image: '/src/images/33.jpg', title: 'Portrait of Woman', price: '₩730,000' },
  { image: '/src/images/44.jpg', title: 'Abstract Forms', price: '₩3,000,000' },
];

const purchaseHistory = [
  { image: '/src/images/55.jpg', title: 'Sitting', price: '₩1,000,000', badge: '복원 중' },
  { image: '/src/images/66.jpg', title: 'Red Abstraction', price: '₩500,000', badge: '보관 중' },
];

const bookmarked = [
  { image: '/src/images/77.jpg', title: 'Cityscape', price: '₩400,000' },
  { image: '/src/images/88.jpg', title: 'Green Fields', price: '₩400,000' },
];

export default MyPage;
