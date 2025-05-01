import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black/80 mt-20 py-12">
      <div className="container mx-auto px-4 text-sm text-text-dark flex flex-col sm:flex-row justify-between gap-4">
        <div>© 2024 OurLog. All rights reserved.</div>
        <div className="flex gap-6">
          <Link to="/" className="hover:underline">
            홈
          </Link>
          <Link to="/privacy-policy" className="hover:underline">
            개인정보처리방침
          </Link>
          <Link to="/customer-support" className="hover:underline">
            고객센터
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
