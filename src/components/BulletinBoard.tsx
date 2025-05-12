import "../styles/BulletinBoard.css";

type CategoryKey = "news" | "free" | "promotion" | "request";

const BulletinBoard: React.FC = () => {
  const categories = {
    news: Array.from({ length: 2 }, (_, i) => ({
      id: i,
      title: `새소식 ${i + 1}`,
      description: `이것은 새소식 ${i + 1}에 대한 설명입니다.`,
      date: `2025-05-${(i + 1).toString().padStart(2, "0")}`,
    })),
    free: Array.from({ length: 2 }, (_, i) => ({
      id: i,
      title: `자유 ${i + 1}`,
      description: `이것은 자유 ${i + 1}에 대한 설명입니다.`,
      date: `2025-05-${(i + 1).toString().padStart(2, "0")}`,
    })),
    promotion: Array.from({ length: 2 }, (_, i) => ({
      id: i,
      title: `홍보 ${i + 1}`,
      description: `이것은 홍보 ${i + 1}에 대한 설명입니다.`,
      date: `2025-05-${(i + 1).toString().padStart(2, "0")}`,
    })),
    request: Array.from({ length: 2 }, (_, i) => ({
      id: i,
      title: `요청 ${i + 1}`,
      description: `이것은 요청 ${i + 1}에 대한 설명입니다.`,
      date: `2025-05-${(i + 1).toString().padStart(2, "0")}`,
    })),
  };

  const categoryLabels: Record<CategoryKey, string> = {
    news: "새소식",
    free: "자유",
    promotion: "홍보",
    request: "요청",
  };

  return (
    <section className="bulletin-board-section">
      <div className="bulletin-left">
        <img
          src="/images/bulletinboard.png"
          alt="카테고리 관련 썸네일 이미지"
          className="bulletin-thumbnail"
        />
      </div>

      <div className="category-container">
        {Object.entries(categories).map(([key, items]) => {
          const typedKey = key as CategoryKey;
          return (
            <div key={typedKey}>
              <h3 className="category-header">{categoryLabels[typedKey]}</h3>
              <ul className="category-list">
                {items.map((item) => (
                  <li key={item.id} className="category-item">
                    <div className="category-thumbnail" />
                    <div className="category-text">
                      <p className="category-title">{item.title}</p>
                      <p className="category-description">{item.description}</p>
                      <p className="category-date">{item.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BulletinBoard;
