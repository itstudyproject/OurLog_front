// src/pages/PurchaseBidPage/PurchaseList.tsx
import React from 'react';
import '../../styles/PurchaseList.css';

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/auth";
import "../../styles/BidHistory.css";

interface Purchase {
  tradeId: number;
  postTitle: string;
  artist: string;
  price: number;
  method: string;
  date: string;
  image: string;
}

const PurchaseList: React.FC = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

 useEffect(() => {
  fetch("http://localhost:8080/ourlog/trades/mypage/purchases", {
    headers: getAuthHeaders(),
  })
    .then((res) => {
      console.log("응답 상태코드:", res.status); // 👈 이게 중요 (403이면 인증 문제)
      if (!res.ok) throw new Error("Fetch 실패");
      return res.json();
    })
    .then((data) => {
      console.log("받은 데이터:", data); // 👈 이거도 확인
      const mapped = data.map((item: any) => ({
        tradeId: item.tradeId,
        postTitle: item.postTitle,
        artist: item.postDTO?.user?.nickname ?? "알 수 없음",
        price: item.nowBuy ?? item.highestBid,
        method: item.nowBuy ? "즉시구매" : "경매낙찰",
        date: item.modifiedAt?.substring(0, 10) ?? "",
        image: item.thumbnailPath || "/images/sample1.jpg",
      }));
      setPurchases(mapped);
    })
    .catch((err) => console.error("에러 발생:", err));
}, []);


  const currentItems = purchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(purchases.length / itemsPerPage);


const PurchaseList = () => {
  return (

    <div className="bid-history-container">
      <div className="bid-history-title">
        <h2>구매 목록</h2>
      </div>

      <div className="bid-list">
        {currentItems.map((item) => (
          <div key={item.tradeId} className="bid-item" onClick={() => navigate(`/art/${item.tradeId}`)}>
            <div className="bid-artwork">
              <img src={item.image} alt={item.postTitle} />
            </div>
            <div className="bid-details">
              <h3>{item.postTitle}</h3>
              <p className="bid-amount">구매금액: {item.price.toLocaleString()}원</p>
              <p>구매방식: {item.method}</p>
              <p>구매날짜: {item.date}</p>
            </div>
          </div>

        ))}
      </ul>


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
    </div>
  );
};

export default PurchaseList;
