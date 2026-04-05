import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, addressesAPI, ordersAPI, vouchersAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, addressesRes] = await Promise.all([
          cartAPI.get(),
          addressesAPI.getAll(),
        ]);
        setCart(cartRes.data);
        setAddresses(addressesRes.data || []);

        if (addressesRes.data?.length > 0) {
          const defaultAddr = addressesRes.data.find(a => a.isDefault) || addressesRes.data[0];
          setSelectedAddress(defaultAddr._id);
          setPhone(defaultAddr.phone);
        } else {
          setPhone(user?.phone || '');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setToast({ message: 'Không thể tải thông tin', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleCheckVoucher = async () => {
    if (!voucherCode.trim()) return;

    try {
      const response = await vouchersAPI.check(voucherCode.toUpperCase());
      setVoucher(response.data);
      setToast({ message: 'Mã hợp lệ', type: 'success' });
    } catch (error) {
      setVoucher(null);
      setToast({ message: error.response?.data?.message || 'Mã không hợp lệ', type: 'error' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setToast({ message: 'Vui lòng chọn địa chỉ giao hàng', type: 'error' });
      return;
    }

    if (!phone) {
      setToast({ message: 'Vui lòng nhập số điện thoại', type: 'error' });
      return;
    }

    setOrderPlacing(true);

    try {
      const address = addresses.find(a => a._id === selectedAddress);
      const orderData = {
        deliveryAddress: `${address?.street}, ${address?.ward}, ${address?.district}, ${address?.city}`,
        phone,
        note,
        voucher: voucher?._id,
      };

      const res = await ordersAPI.create(orderData);
      setLastOrderId(res.data._id);
      setShowPaymentModal(true);
      setToast({ message: 'Đặt hàng thành công! Vui lòng thanh toán.', type: 'success' });
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Đặt hàng thất bại', type: 'error' });
    } finally {
      setOrderPlacing(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Bạn chưa có món ăn nào trong giỏ để thanh toán</p>
          <button onClick={() => navigate('/foods')} className="btn-primary">
            Quay lại mua sắm
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals only after confirming cart exists
  const subtotal = cart.cartItems.reduce(
    (sum, item) => sum + (Number(item.food?.price) || 0) * item.quantity,
    0
  );

  const discount = voucher ? (
    voucher.discountType === 'percent'
      ? Math.min((subtotal * (Number(voucher.discountValue) || 0)) / 100, Number(voucher.maxDiscount) || Infinity)
      : (Number(voucher.discountValue) || 0)
  ) : 0;

  const total = Math.max(0, subtotal - discount);

  const getQRUrl = () => {
    const BANK_ID = 'VCB'; 
    const ACCOUNT_NO = '1026917782';
    const ACCOUNT_NAME = 'NGUYEN ANH PHAT';
    const description = `Thanh toan don hang ${lastOrderId.slice(-8)}`;
    return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact.jpg?amount=${total}&addInfo=${description}&accountName=${ACCOUNT_NAME}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Address Selection */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Địa chỉ giao hàng</h2>
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress === addr._id ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr._id}
                        checked={selectedAddress === addr._id}
                        onChange={(e) => {
                          setSelectedAddress(e.target.value);
                          setPhone(addr.phone);
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{addr.fullName}</div>
                        <div className="text-gray-500 text-sm">
                          {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                        </div>
                        <div className="text-gray-500 text-sm">📞 {addr.phone}</div>
                        {addr.isDefault && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  Chưa có địa chỉ.{' '}
                  <button
                    onClick={() => navigate('/addresses')}
                    className="text-primary-500 hover:underline"
                  >
                    Thêm địa chỉ
                  </button>
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Thông tin liên hệ</h2>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input-field"
                  placeholder="Ghi chú cho đơn hàng..."
                  rows={3}
                />
              </div>
            </div>

            {/* Voucher */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Mã giảm giá</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  className="input-field flex-1"
                  placeholder="Nhập mã giảm giá"
                />
                <button onClick={handleCheckVoucher} className="btn-secondary">
                  Kiểm tra
                </button>
              </div>
              {voucher && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">✓ {voucher.code}</p>
                  <p className="text-green-600 text-sm">
                    Giảm {voucher.discountType === 'percent' ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString('vi-VN')}₫`}
                    {voucher.maxDiscount && ` (tối đa ${voucher.maxDiscount.toLocaleString('vi-VN')}₫)`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold mb-4">Đơn hàng</h2>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.cartItems.map((item) => (
                  <div key={item.food?._id || Math.random()} className="flex gap-3 pb-3 border-b">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.food?.imageUrl ? (
                        <img
                          src={`http://localhost:3000${item.food.imageUrl}`}
                          alt={item.food.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">🍴</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.food?.name || 'Món không tồn tại'}</p>
                      <p className="text-gray-500 text-sm">x{item.quantity}</p>
                      <p className="text-primary-500 font-bold">
                        {((Number(item.food?.price) || 0) * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                {voucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{discount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng</span>
                  <span className="text-green-500">Miễn phí</span>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary-500">{total.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={orderPlacing}
                className="btn-primary w-full py-3 text-lg"
              >
                {orderPlacing ? 'Đang xử lý...' : `Đặt hàng (${total.toLocaleString('vi-VN')}₫)`}
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in">
            <div className="bg-primary-500 p-6 text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">💸</span>
              </div>
              <h2 className="text-2xl font-bold">Thanh toán chuyển khoản</h2>
              <p className="opacity-90">Vui lòng quét mã QR bên dưới để hoàn tất</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                <img 
                  src={getQRUrl()} 
                  alt="QR Code Thanh toán" 
                  className="w-full aspect-square object-contain mx-auto"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số tiền:</span>
                  <span className="font-bold text-primary-600 text-lg">{total.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nội dung:</span>
                  <span className="font-mono font-bold">Thanh toan don hang {lastOrderId.slice(-8)}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                <span className="text-xl">ℹ️</span>
                <p className="text-sm text-blue-700">
                  Đơn hàng của bạn đang ở trạng thái <b>"Chờ xác nhận"</b>. 
                  Sau khi bạn chuyển khoản, quản trị viên sẽ kiểm tra và xác nhận đơn của bạn.
                </p>
              </div>

              <button 
                onClick={() => navigate('/orders')}
                className="btn-primary w-full py-3"
              >
                Tôi đã chuyển khoản - Xem đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
