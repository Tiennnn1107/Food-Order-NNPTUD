import { useEffect, useState } from 'react';
import { reviewsAPI } from '../../api';
import Toast from '../../components/Toast';

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await reviewsAPI.getAll();
      setReviews(res.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setToast({ message: 'Không thể tải danh sách đánh giá', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await reviewsAPI.delete(id);
      setToast({ message: 'Đã xóa đánh giá', type: 'success' });
      fetchReviews();
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra khi xóa', type: 'error' });
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesRating = !filterRating || review.rating === parseInt(filterRating);
    const matchesSearch = !searchTerm ||
      review.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.food?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const stats = {
    total: reviews.length,
    average: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0,
    fiveStars: reviews.filter(r => r.rating === 5).length,
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-lg">
            {i < rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        <p className="text-gray-500 text-sm">Xem và quản lý phản hồi từ khách hàng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card bg-blue-50 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <span className="text-3xl">📝</span>
          </div>
        </div>
        <div className="card bg-yellow-50 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Trung bình</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.average} / 5</p>
            </div>
            <span className="text-3xl">⭐</span>
          </div>
        </div>
        <div className="card bg-green-50 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Đánh giá 5 sao</p>
              <p className="text-2xl font-bold text-green-700">{stats.fiveStars}</p>
            </div>
            <span className="text-3xl">🏆</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Tìm theo món ăn, khách hàng hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="input-field md:w-48"
        >
          <option value="">Tất cả mức sao</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review._id} className="card hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Review Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 overflow-hidden">
                      {review.user?.avatarUrl ? (
                        <img src={`http://localhost:3000${review.user.avatarUrl}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        review.user?.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{review.user?.username || 'Ẩn danh'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">Đánh giá cho món:</p>
                  <p className="font-medium text-primary-600 flex items-center gap-2">
                    🍕 {review.food?.name || 'Món đã bị xóa'}
                  </p>
                </div>

                {review.comment && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 italic text-gray-700">
                    "{review.comment}"
                  </div>
                )}
              </div>

              {/* Review Image & Action */}
              <div className="flex flex-col items-end justify-between min-w-[150px]">
                {review.imageUrl ? (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={`http://localhost:3000${review.imageUrl}`}
                      alt="Review"
                      className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => window.open(`http://localhost:3000${review.imageUrl}`, '_blank')}
                    />
                  </div>
                ) : (
                  <div className="flex-1"></div>
                )}
                
                <button
                  onClick={() => handleDelete(review._id)}
                  className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  🗑️ Xóa đánh giá
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy đánh giá nào</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc tìm kiếm của bạn</p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ReviewsManager;
