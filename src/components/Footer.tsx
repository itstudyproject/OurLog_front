import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-200 py-12">
    <div className="max-w-screen-lg mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* About */}
      <div>
        <h3 className="text-xl font-semibold mb-3">OurLog</h3>
        <p className="text-sm">
          디지털 아티스트를 위한 최고의 커뮤니티. 작품 공유부터 피드백까지,
          당신의 창작 여정을 응원합니다.
        </p>
      </div>

      {/* 사이트 링크 */}
      <div>
        <h4 className="font-medium mb-2">사이트</h4>
        <ul className="space-y-1 text-sm">
          <li>
            <Link to="/terms" className="hover:text-white">
              이용약관
            </Link>
          </li>
          <li>
            <Link to="/privacy-policy" className="hover:text-white">
              개인정보처리방침
            </Link>
          </li>
          <li>
            <Link to="/customer-center" className="hover:text-white">
              고객센터
            </Link>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="font-medium mb-2">Contact</h4>
        <p className="text-sm">
          Email: contact@ourlog.com
          <br />
          Tel: 02-123-4567
        </p>
      </div>
    </div>

    <div className="mt-10 border-t border-gray-800 text-center text-xs text-gray-500">
      © 2024 OurLog. All rights reserved. | Designed by React Spring Team
    </div>
  </footer>
);

export default Footer;
