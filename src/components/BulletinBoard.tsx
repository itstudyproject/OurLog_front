import img6 from "../assets/img/img6.png";
import "../styles/BulletinBoard.css"; // CSS 파일 임포트

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
    <section className="flex mb-10 px-4">
      {/* 왼쪽 썸네일 */}
      <div className="w-1/2 pr-6 min-h-[400px] flex justify-center items-start">
        <img
          src="/images/bulletinboard.png"
          alt="카테고리 관련 썸네일 이미지"
          className="rounded-lg w-[700px] h-[450px] object-cover" // 고정 크기 지정
        />
      </div>

      {/* 오른쪽 4개 카테고리 */}
      <div className="w-1/2 category-container">
        {Object.entries(categories).map(([key, items]) => {
          const typedKey = key as CategoryKey;
          return (
            <div key={typedKey}>
              <h3 className="text-lg font-semibold mb-2">
                {categoryLabels[typedKey]}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id} className="category-item">
                    <div className="category-thumbnail" />
                    <div className="flex-1">
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
