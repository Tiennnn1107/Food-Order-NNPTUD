import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (foodId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      if (newQuantity > cart.cartItems.find(item => item.food._id === foodId).quantity) {
        await cartAPI.add(foodId, 1);
      } else {
        await cartAPI.reduce(foodId);
      }
      fetchCart();
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleRemoveItem = async (foodId) => {
    try {
      await cartAPI.remove(foodId);
      setToast({ message: 'Đã xóa món khỏi giỏ', type: 'success' });
      fetchCart();
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả món trong giỏ?')) return;

    try {
      await cartAPI.clear();
      setToast({ message: 'Đã xóa giỏ hàng', type: 'success' });
      fetchCart();
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const totalAmount = cart?.cartItems?.reduce(
    (sum, item) => sum + (item.food?.price || 0) * item.quantity,
    0
  ) || 0;

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!cart || cart.cartItems?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Thêm món ăn vào giỏ để đặt hàng</p>
          <Link to="/foods" className="btn-primary">
            Xem thực đơn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.cartItems?.map((item) => (
              <div key={item.food._id} className="card flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.food.imageUrl ? (
                    <img
                      src={`http://localhost:3000${item.food.imageUrl}`}
                      alt={item.food.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🍴
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.food?.name || 'Món không tồn tại'}</h3>
                  <p className="text-primary-500 font-bold">
                    {(item.food?.price || 0).toLocaleString('vi-VN')}₫
                  </p>
                  {item.note && (
                    <p className="text-gray-500 text-sm mt-1">Ghi chú: {item.note}</p>
                  )}
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => handleRemoveItem(item.food._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item.food._id, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.food._id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold mb-4">Tổng cộng</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng</span>
                  <span className="text-green-500">Miễn phí</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary-500">{totalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full block text-center py-3 mb-3">
                Tiến hành đặt hàng
              </Link>
              <button
                onClick={handleClearCart}
                className="btn-secondary w-full py-3"
              >
                Xóa giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Cart;