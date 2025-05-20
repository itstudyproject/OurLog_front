import React from "react";
import "./ArtBidRegister.css";

interface ArtBidRegisterProps {
  value: {
    description: string;
    auction: {
      startPrice: number | "";
      nowBuy: number | "";
      startDate: string;
      endDate: string;
    };
  };
  onChange: (value: ArtBidRegisterProps["value"]) => void;
}

const ArtBidRegister: React.FC<ArtBidRegisterProps> = ({ value, onChange }) => {
  const handleChange = (field: string, val: any) => {
    if (field === "description") {
      onChange({ ...value, description: val });
    } else {
      onChange({
        ...value,
        auction: { ...value.auction, [field]: val },
      });
    }
  };

  return (
    <div className="artbid-section">
      <label className="artbid-label">작품설명</label>
      <textarea
        name="description"
        value={value.description}
        onChange={e => handleChange("description", e.target.value)}
        placeholder="작품에 대한 설명을 입력하세요."
        className="artbid-textarea"
        rows={4}
      />

      <div className="auction-grid">
        <div className="auction-field">
          <label className="auction-label" htmlFor="startPrice">
            <span className="auction-label-icon">₩</span> 경매 시작가
          </label>
          <input
            id="startPrice"
            type="number"
            min={0}
            className="auction-input"
            value={value.auction.startPrice}
            onChange={e =>
              handleChange("startPrice", e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="예: 10000"
            required
          />
        </div>
        <div className="auction-field">
          <label className="auction-label" htmlFor="nowBuy">
            <span className="auction-label-icon">₩</span> 즉시구매가 <span className="auction-optional">(선택)</span>
          </label>
          <input
            id="nowBuy"
            type="number"
            min={0}
            className="auction-input"
            value={value.auction.nowBuy}
            onChange={e =>
              handleChange("nowBuy", e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="예: 50000"
          />
        </div>
        <div className="auction-field">
          <label className="auction-label" htmlFor="startDate">
            <span className="auction-label-icon">🗓️</span> 경매 시작일
          </label>
          <input
            id="startDate"
            type="datetime-local"
            className="auction-input"
            value={value.auction.startDate}
            onChange={e => handleChange("startDate", e.target.value)}
            required
          />
        </div>
        <div className="auction-field">
          <label className="auction-label" htmlFor="endDate">
            <span className="auction-label-icon">🗓️</span> 경매 종료일
          </label>
          <input
            id="endDate"
            type="datetime-local"
            className="auction-input"
            value={value.auction.endDate}
            onChange={e => handleChange("endDate", e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ArtBidRegister;