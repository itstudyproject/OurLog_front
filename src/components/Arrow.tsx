import React from 'react';
import "../styles/ArrowButton.css"; // 또는 정확한 상대경로

interface ArrowProps {
  direction: 'left' | 'right';
}

const Arrow: React.FC<ArrowProps> = ({ direction }) => {
  return (
    <div className={`arrow arrow-${direction}`}>
      <div className="arrow-top"></div>
      <div className="arrow-bottom"></div>
    </div>
  );
};

export default Arrow;
