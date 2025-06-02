import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div>
        <h3 className="footer-heading">
          <img
            src="/images/Symbol.png"
            alt="OurLog Symbol"
            className="footer-symbol"
          />
        </h3>
      </div>

      {/* About */}
      <div>
        <h3 className="footer-heading">OurLog</h3>
        <p className="footer-text">
          아티스트를 위한 최고의 커뮤니티! <br />
          작품 공유와 피드백을 통해 창작 여정을 응원합니다.
        </p>
      </div>

      {/* 사이트 링크 */}
      <div>
        <h4 className="footer-heading">Support</h4>
        <ul className="footer-links">
          <li>
            <Link to="/terms-condition" className="footer-link">
              이용약관
            </Link>
          </li>
          <li>
            <Link to="/privacy-policy" className="footer-link">
              개인정보처리방침
            </Link>
          </li>
          <li>
            <Link to="/customer-center" className="footer-link">
              고객센터
            </Link>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="footer-heading">Contact</h4>
        <p className="footer-text">
          Email: contact@ourlog.com
          <br />
          Tel: 0687-5640
        </p>
      </div>
    </div>

    <div className="footer-bottom">
      © 2025 OurLog. All rights reserved. | Designed by React Spring Team
    </div>
  </footer>
);

export default Footer;
