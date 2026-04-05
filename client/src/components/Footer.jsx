import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">🍔 FoodOrder</h3>
            <p className="text-gray-400 text-sm">
              Đặt món ăn ngon, giao hàng tận nơi. Chất lượng đảm bảo, giá cả hợp lý.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Trang chủ</Link></li>
              <li><Link to="/foods" className="hover:text-primary-500 transition-colors">Món ăn</Link></li>
              <li><Link to="/about" className="hover:text-primary-500 transition-colors">Về chúng tôi</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/faq" className="hover:text-primary-500 transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-primary-500 transition-colors">Điều khoản</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-500 transition-colors">Bảo mật</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📞 1900 xxxx</li>
              <li>📧 support@foodorder.com</li>
              <li>📍 TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2026 FoodOrder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;