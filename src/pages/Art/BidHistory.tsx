import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/BidHistory.css';

interface Bid {
  id: number;
  artworkId: number;
  title: string;
  bidAmount: number;
  bidder: string;
  bidTime: string;
  status: 'active' | 'completed' | 'outbid';
  imageSrc: string;
}

const BidHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [artTitle, setArtTitle] = useState<string>('');

  useEffect(() => {
    // 실제 구현에서는 API 호출로 데이터를 가져오게 됩니다
    const fetchBidHistory = async () => {
      try {
        // 테스트용 더미 데이터
        const dummyBids: Bid[] = [
          {
            id: 1,
            artworkId: 1,
            title: '뚱글뚱글 파스타',
            bidAmount: 50000,
            bidder: '작가1',
            bidTime: '14:19:04',
            status: 'active',
            imageSrc: '/images/파스타.jpg'
          },
          {
            id: 2,
            artworkId: 2,
            title: '낙엽 전경',
            bidAmount: 10000,
            bidder: '작가2',
            bidTime: '-- : -- : --',
            status: 'active',
            imageSrc: '/images/낙엽사진.jpeg'
          }
        ];
        
        setBids(dummyBids);
        setArtTitle('최근 입찰 목록');
        setLoading(false);
      } catch (error) {
        console.error('입찰 기록을 불러오는 중 오류가 발생했습니다:', error);
        setLoading(false);
      }
    };
    
    fetchBidHistory();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleBidClick = (artworkId: number) => {
    navigate(`/Art/${artworkId}`);
  };

  if (loading) {
    return (
      <div className="loading">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="bid-history-container">
      
      <div className="bid-history-title">
        <h2>{artTitle}</h2>
        <p className="bid-date">2023.03.16 - 2023.03.24</p>
      </div>
      
      <div className="bid-list">
        {bids.map((bid) => (
          <div key={bid.id} className="bid-item" onClick={() => handleBidClick(bid.artworkId)}>
            <div className="bid-artwork">
              <img src={bid.imageSrc} alt={bid.title} />
            </div>
            <div className="bid-details">
              <h3>{bid.title}</h3>
              <p className="bid-amount">{bid.bidAmount.toLocaleString()}원</p>
            </div>
            {bid.id === 2 && <div className="bid-status active">낙찰 전환</div>}
            <div className="bid-time">
              <div className="time-icon">⏱️</div>
              <div className="time-value">{bid.bidTime}</div>
            </div>
            <div className="bid-actions">
              {bid.id === 1 ? (
                <button className="detail-button">상세 ▶</button>
              ) : (
                <button className="bid-now-button">입찰하기</button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bid-history-footer">
        <button onClick={handleGoBack} className="back-button">뒤로 가기</button>
      </div>
    </div>
  );
};

export default BidHistory;