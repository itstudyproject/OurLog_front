// src/pages/SalePage/SaleStatusList.tsx
import React from 'react';
import '../../styles/SaleStatusList.css';

<<<<<<< HEAD
interface SaleStatus {
  id: number;
  image: string;
  title: string;
  artist: string;
  regDate: string;
  auctionStart: string;
  saleEnd: string;
  method: string;
  status: string;
}

const SaleStatusList: React.FC = () => {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<SaleStatus[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    fetch("http://localhost:8080/ourlog/trades/mypage/sale-status", {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item: any) => ({
          id: item.tradeId,
          title: item.postTitle,
          image: item.thumbnailPath,
          artist: item.postDTO?.user?.nickname ?? "나",
          regDate: item.createdAt?.substring(0, 10) ?? "",
          auctionStart: item.createdAt?.substring(0, 10) ?? "", // 실제 시작시간 필요시 수정
          saleEnd: item.expiredAt?.substring(0, 10) ?? "", // 필요시 Trade에 추가
          method: item.nowBuy ? "즉시구매" : "경매",
          status: item.tradeStatus ? "진행중" : "마감",
        }));
        setStatuses(mapped);
      });
  }, []);

  const currentItems = statuses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(statuses.length / itemsPerPage);
=======
const dummyData = [
  {
    image: '/images/sample7.jpg',
    title: 'peach',
    artist: 'uouo',
    regDate: '2025.05.03',
    auctionStart: '2025.05.03',
    saleEnd: '2025.05.10',
    method: '공개입찰',
    status: '입찰중',
  },
  {
    image: '/images/sample7.jpg',
    title: 'peach',
    artist: 'uouo',
    regDate: '2025.05.03',
    auctionStart: '2025.05.03',
    saleEnd: '2025.05.10',
    method: '공개입찰',
    status: '입찰중',
  },
  {
    image: '/images/sample7.jpg',
    title: 'peach',
    artist: 'uouo',
    regDate: '2025.05.03',
    auctionStart: '2025.05.03',
    saleEnd: '2025.05.10',
    method: '공개입찰',
    status: '입찰중',
  },
];
>>>>>>> parent of 189ff36 (Merge pull request #83 from itstudyproject/develop)

const SaleStatusList = () => {
  return (
    <div className="purchase-list">
      <div className="filter-row">
        <select>
          <option>날짜순</option>
          <option>금액순</option>
        </select>
        <button className="date-filter">검색기간 설정</button>
      </div>
<<<<<<< HEAD
      <div className="bid-list">
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="bid-item"
            onClick={() => navigate(`/art/${item.id}`)}
          >
            <div className="bid-artwork">
              <img src={item.image} alt={item.title} />
            </div>
            <div className="bid-details">
              <h3>{item.title}</h3>
              <p>작가: {item.artist}</p>
              <p>등록일: {item.regDate}</p>
              <p>경매시작: {item.auctionStart}</p>
              <p>판매마감: {item.saleEnd}</p>
              <p>방식: {item.method}</p>
              <p className="bid-amount">상태: {item.status}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`page-btn${page === currentPage ? " active" : ""}`}
          >
            {page}
          </button>
        ))}
      </div>
=======

      <ul className="item-list">
        {dummyData.map((item, idx) => (
          <li key={idx} className="purchase-item">
            <img src={item.image} alt={item.title} className="item-image" />
            <div className="item-info">
              <p className="sale-status-title">{item.title}</p>
              <p className="artist">{item.artist}</p>
              <p>등록일 {item.regDate}</p>
              <p>경매시작일 {item.auctionStart}</p>
              <p>판매 마감일 {item.saleEnd}</p>
              <p>판매방식 {item.method}</p>
              <p>진행상태 {item.status}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination">{'<'} 1 2 3 4 5 {'>'}</div>
>>>>>>> parent of 189ff36 (Merge pull request #83 from itstudyproject/develop)
    </div>
  );
};

export default SaleStatusList;
