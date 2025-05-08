import React from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import ProfileEditPage from "./ProfileEditPage";
import AccountEdit from "./AccountEdit";
import AccountDelete from "./AccountDelete";
import PurchaseBidPage from "./PurchaseBidPage/PurchaseBidPage";
import SalePage from "./SalePage/SalePage";
import BookmarkPage from "./BookmarkPage";
import RecentPostsCarousel from "./Post/RecentPostsCarousel";

const MyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-base-200 text-base-content flex">
      {/* Sidebar */}
      <aside className="w-72 bg-base-100 p-4 text-base-content shadow-md flex-shrink-0">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/images/mypage/Mari.jpg"
            alt="profile"
            className="w-24 h-24 rounded-full mb-2"
          />
          <h2 className="text-xl font-semibold">만수</h2>
          <p className="text-sm">minsu@example.com</p>
          <div className="mt-2 text-sm space-x-2">
            <span>팔로워 30</span>
            <span>팔로잉 30</span>
          </div>
        </div>
        <ul className="menu flex flex-col items-center text-center">
          <li>
            <a onClick={() => navigate("/mypage/edit")}>프로필수정</a>
          </li>
          <li>
            <a onClick={() => navigate("/mypage/account")}>회원정보수정</a>
          </li>
          <li>
            <a>로그아웃</a>
          </li>
          <li>
            <a
              className="text-error"
              onClick={() => navigate("/mypage/account/delete")}
            >
              회원탈퇴
            </a>
          </li>
        </ul>

        <button className="btn btn-outline mt-4 w-full">내 글 등록하기</button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1 className="text-3xl font-bold mb-4">마이페이지</h1>

                {/* 최근 본 게시물 */}
                <Section title="최근 본 게시물">
                  <RecentPostsCarousel
                    posts={recentPosts.map((post, index) => ({
                      id: index,
                      title: post.title,
                      price: Number(post.price.replace(/[^0-9]/g, "")),
                      thumbnailUrl: post.image,
                    }))}
                  />
                </Section>

                {/* 내 구매/입찰 내역 */}
                <Section title="내 구매/입찰 현황">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {purchaseHistory.map((post) => (
                      <PostCard
                        key={post.title}
                        {...post}
                        onClick={() => navigate("/mypage/purchase-bid")}
                      />
                    ))}
                  </div>
                </Section>

                {/* 내 판매 내역 */}
                <Section title="내 판매/판매 현황">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {purchaseHistory.map((post) => (
                      <PostCard
                        key={post.title}
                        {...post}
                        onClick={() => navigate("/mypage/sale")}
                      />
                    ))}
                  </div>
                </Section>

                {/* 북마크한 작품들 */}
                <Section title="북마크한 작품들">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {bookmarked.map((post) => (
                      <PostCard
                        key={post.title}
                        {...post}
                        onClick={() => navigate("/mypage/bookmark")}
                      />
                    ))}
                  </div>
                </Section>
              </>
            }
          />
          <Route
            path="edit"
            element={<ProfileEditPage onBack={() => navigate("/mypage")} />}
          />
          <Route
            path="account"
            element={<AccountEdit onBack={() => navigate("/mypage")} />}
          />
          <Route path="account/delete" element={<AccountDelete />} />
          <Route path="purchase-bid" element={<PurchaseBidPage />} />
          <Route path="sale" element={<SalePage />} />
          <Route path="bookmark" element={<BookmarkPage />} />
        </Routes>
      </div>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
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
  onClick,
}: {
  image: string;
  title: string;
  price: string;
  badge?: string;
  onClick?: () => void;
}) => (
  <div className="card bg-base-100 shadow-md">
    <figure onClick={onClick} className="cursor-pointer">
      <img src={image} alt={title} className="h-40 w-full object-cover" />
    </figure>
    <div className="card-body p-4">
      <h3 className="card-title text-sm cursor-pointer" onClick={onClick}>
        {title}
      </h3>
      <p className="text-sm">{price}</p>
      {badge && <div className="badge badge-success mt-2">{badge}</div>}
    </div>
  </div>
);

// 임시 데이터
const recentPosts = [
  {
    image: "/images/mypage/Realization.jpg",
    title: "Realization",
    price: "₩1,000,000",
  },
  {
    image: "/images/mypage/Andrew Loomis.jpg",
    title: "Andrew Loomis",
    price: "₩800,000",
  },
  {
    image: "/images/mypage/White Roses.jpg",
    title: "White Roses",
    price: "₩730,000",
  },
  {
    image: "/images/mypage/tangerine.jpg",
    title: "tangerine",
    price: "₩3,000,000",
  },
];

const purchaseHistory = [
  {
    image: "/images/mypage/Victoriaa.JPG",
    title: "Victoria",
    price: "₩1,000,000",
  },
  {
    image: "/images/mypage/Goats and Girls.jpg",
    title: "Goats and Girls",
    price: "₩500,000",
  },
];

const bookmarked = [
  { image: "/src/images/77.jpg", title: "Cityscape", price: "₩400,000" },
  { image: "/src/images/88.jpg", title: "Green Fields", price: "₩400,000" },
];

export default MyPage;
