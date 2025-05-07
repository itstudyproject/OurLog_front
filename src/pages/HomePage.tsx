import React from "react";
import "../styles/HomePage.css";
import { cn } from "../utils/utils";
import type { AuctionItem } from "../types";

const SAMPLE_AUCTIONS: AuctionItem[] = [
  {
    id: "1",
    title: "Abstract Forms",
    price: 300000,
    imageUrl: "/images/11.jpg",
    artist: "김민수",
    endTime: new Date("2024-05-01"),
    currentBid: 300000,
    bidCount: 5,
  },
  {
    id: "2",
    title: "Blue Landscape",
    price: 1200000,
    imageUrl: "/images/22.jpg",
    artist: "이지원",
    endTime: new Date("2024-05-02"),
    currentBid: 1200000,
    bidCount: 3,
  },
  {
    id: "3",
    title: "Colorful Composition",
    price: 900000,
    imageUrl: "/images/33.jpg",
    artist: "박서연",
    endTime: new Date("2024-05-03"),
    currentBid: 900000,
    bidCount: 7,
  },
];

export default function HomePage() {
  return (
    <div className="homepage-root">
      {/* Hero Section */}
      <section className="homepage-hero">
        <div className="homepage-container">
          <div className="homepage-hero-inner">
            <h1 className="homepage-hero-title">
              당신의 이야기가
              <br />
              작품이 되는 곳,
              <br />
              <span className="homepage-hero-mint">OurLog</span>
            </h1>
            <p className="homepage-hero-desc">
              아티스트와 컬렉터가 만나는 특별한 공간
            </p>
          </div>
        </div>
      </section>

      {/* Current Auctions */}
      <section className="homepage-container">
        <h2 className="homepage-section-title">진행 중인 경매</h2>
        <div className="homepage-auction-list">
          {SAMPLE_AUCTIONS.map((auction) => (
            <div
              key={auction.id}
              className="homepage-auction-card"
            >
              <div className="homepage-auction-image-wrap">
                <img
                  src={auction.imageUrl}
                  alt={auction.title}
                  className="homepage-auction-image"
                />
              </div>
              <div className="homepage-auction-content">
                <h3 className="homepage-auction-title">{auction.title}</h3>
                <p className="homepage-auction-price">
                  ₩{auction.price.toLocaleString()}
                </p>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button
                    className={cn(
                      "btn",
                      auction.id === "1" && "btn-orange",
                      auction.id === "2" && "btn-mint",
                      auction.id === "3" && "btn-blue"
                    )}
                  >
                    {auction.id === "1" && "팜하기"}
                    {auction.id === "2" && "림하기"}
                    {auction.id === "3" && "알감하기"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
