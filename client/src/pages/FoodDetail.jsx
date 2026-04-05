import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { foodsAPI, cartAPI, reviewsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const FoodDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodRes, reviewsRes] = await Promise.all([
          foodsAPI.getById(id),
          reviewsAPI.getAll({ food: id }),
        ]);
        setFood(foodRes.data);
        setReviews(reviewsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setToast({ message: 'Không thể tải thông tin món ăn', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await cartAPI.add(id, quantity, note);
      setToast({ message: 'Đã thêm vào giỏ hàng', type: 'success' });
      setQuantity(1);
      setNote('');
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!food) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Không tìm thấy món ăn</p>
          <button onClick={() => navigate('/foods')} className="btn-primary">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Food Detail */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {food.imageUrl ? (
                <img
                  src={`http://localhost:3000${food.imageUrl}`}
                  alt={food.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">
                  🍴
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold mb-4">{food.name}</h1>
              <p className="text-gray-600 mb-6">{food.description}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-primary-500">
                  {food.price.toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="mb-6">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  food.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {food.isAvailable ? '✓ Còn món' : '✕ Hết món'}
                </span>
              </div>
              {food.isAvailable && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-gray-700 font-medium">Số lượng:</label>
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-700 font-medium block mb-2">Ghi chú:</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Thêm ghi chú (ít cay, không hành...)"
                      className="input-field"
                      rows={3}
                    />
                  </div>
                  <button onClick={handleAddToCart} className="btn-primary w-full py-3 text-lg">
                    Thêm vào giỏ hàng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Đánh giá ({reviews.length})</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-500 font-medium">
                          {review.user?.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="font-medium">{review.user?.fullName || 'Ẩn danh'}</span>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600">{review.comment}</p>
                  )}
                  {review.imageUrl && (
                    <div className="mt-3 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={`http://localhost:3000${review.imageUrl}`}
                        alt="Review"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                        onClick={() => window.open(`http://localhost:3000${review.imageUrl}`, '_blank')}
                      />
                    </div>
                  )}
                  <p className="text-gray-400 text-sm mt-2">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có đánh giá nào</p>
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

export default FoodDetail;