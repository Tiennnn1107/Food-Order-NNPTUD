import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI, reviewsAPI } from '../api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    food: '',
    rating: 5,
    comment: '',
    image: null,
  });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setToast({ message: 'Không thể tải thông tin đơn hàng', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      await ordersAPI.cancel(id);
      setToast({ message: 'Đã hủy đơn hàng', type: 'success' });
      fetchOrder();
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Không thể hủy đơn', type: 'error' });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewData.food) {
      setToast({ message: 'Vui lòng chọn món ăn để đánh giá', type: 'error' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('order', id);
      formData.append('food', reviewData.food);
      formData.append('rating', reviewData.rating);
      formData.append('comment', reviewData.comment);
      if (reviewData.image) {
        formData.append('file', reviewData.image);
      }

      await reviewsAPI.create(formData);
      setToast({ message: 'Cảm ơn bạn đã đánh giá!', type: 'success' });
      setShowReviewForm(false);
      setReviewData({ food: '', rating: 5, comment: '', image: null });
    } catch (error) {
      setToast({ 
        message: error.response?.data?.message || 'Không thể gửi đánh giá', 
        type: 'error' 
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
      delivering: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
      delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    };
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-4 py-2 rounded-full font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Không tìm thấy đơn hàng</h2>
          <button onClick={() => navigate('/orders')} className="btn-primary">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={() => navigate('/orders')}
          className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2"
        >
          ← Quay lại
        </button>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
              <p className="text-gray-500">
                Mã đơn: #{order._id.slice(-8)}
              </p>
              <p className="text-gray-400 text-sm">
                {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>

          <hr className="my-6" />

          {/* Delivery Info */}
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-3">Địa chỉ giao hàng</h2>
            <p className="text-gray-700">{order.deliveryAddress}</p>
            <p className="text-gray-600">📞 {order.phone}</p>
          </div>

          {order.note && (
            <div className="mb-6">
              <h2 className="font-semibold text-lg mb-3">Ghi chú</h2>
              <p className="text-gray-600 bg-gray-100 p-3 rounded-lg">{order.note}</p>
            </div>
          )}

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="font-semibold text-lg mb-3">Sản phẩm</h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Sản phẩm</th>
                    <th className="text-center p-3">SL</th>
                    <th className="text-right p-3">Đơn giá</th>
                    <th className="text-right p-3">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.foodName}</td>
                      <td className="text-center p-3">{item.quantity}</td>
                      <td className="text-right p-3">
                        {item.price.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="text-right p-3 font-medium">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Tổng cộng</span>
              <span className="text-2xl font-bold text-primary-500">
                {order.totalAmount.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            {order.status === 'pending' && (
              <button
                onClick={handleCancelOrder}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Hủy đơn hàng
              </button>
            )}
            {order.status === 'delivered' && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-primary"
              >
                {showReviewForm ? 'Đóng form' : 'Viết đánh giá'}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-bold mb-4">Đánh giá món ăn</h2>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Chọn món ăn</label>
                  <select
                    className="input-field"
                    value={reviewData.food}
                    onChange={(e) => setReviewData({ ...reviewData, food: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn món ăn để đánh giá --</option>
                    {order.items?.map((item, index) => (
                      <option key={index} value={item.food?._id || item.food}>
                        {item.foodName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Số sao</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className={`text-2xl ${
                          star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nhận xét</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm của bạn về món ăn này..."
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Hình ảnh (tùy chọn)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReviewData({ ...reviewData, image: e.target.files[0] })}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>

                <button type="submit" className="btn-primary w-full py-3">
                  Gửi đánh giá
                </button>
              </form>
            </div>
          )}
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

export default OrderDetail;