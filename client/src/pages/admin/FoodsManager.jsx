import { useEffect, useState } from 'react';
import { foodsAPI, categoriesAPI } from '../../api';
import Toast from '../../components/Toast';

const FoodsManager = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [foodsRes, categoriesRes] = await Promise.all([
        foodsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setFoods(foodsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingId) {
        await foodsAPI.update(editingId, submitData);
        if (imageFile) {
          const imgFormData = new FormData();
          imgFormData.append('file', imageFile);
          await foodsAPI.uploadImage(editingId, imgFormData);
        }
        setToast({ message: 'Cập nhật món ăn thành công', type: 'success' });
      } else {
        const res = await foodsAPI.create(submitData);
        const newFood = res.data;
        if (imageFile && newFood._id) {
          const imgFormData = new FormData();
          imgFormData.append('file', imageFile);
          await foodsAPI.uploadImage(newFood._id, imgFormData);
        }
        setToast({ message: 'Thêm món ăn thành công', type: 'success' });
      }
      fetchData();
      resetForm();
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleEdit = (food) => {
    setFormData({
      name: food.name,
      description: food.description || '',
      price: food.price.toString(),
      category: food.category?._id || '',
      isAvailable: food.isAvailable,
    });
    setEditingId(food._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa món này?')) return;

    try {
      await foodsAPI.delete(id);
      setToast({ message: 'Đã xóa món ăn', type: 'success' });
      fetchData();
      if (editingId === id) resetForm();
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleToggleAvailable = async (id, currentStatus) => {
    try {
      await foodsAPI.update(id, { isAvailable: !currentStatus });
      setToast({ message: `Đã ${!currentStatus ? 'hiển thị' : 'ẩn'} món ăn`, type: 'success' });
      fetchData();
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: '', isAvailable: true });
    setEditingId(null);
    setShowForm(false);
    setImageFile(null);
  };

  const filteredFoods = foods.filter(food => {
    const matchesCategory = !filterCategory || food.category?._id === filterCategory;
    const matchesSearch = !searchTerm ||
      food.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const foodStats = {
    total: foods.length,
    available: foods.filter(f => f.isAvailable).length,
    unavailable: foods.filter(f => !f.isAvailable).length,
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý món ăn</h1>
          <p className="text-gray-500 text-sm">Quản lý thực đơn nhà hàng</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn-primary ${showForm ? 'bg-gray-500 hover:bg-gray-600' : ''}`}
        >
          {showForm ? '✕ Hủy' : '+ Thêm món'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card bg-blue-50 border-l-4 border-l-blue-500">
          <p className="text-sm text-blue-600">Tổng món</p>
          <p className="text-2xl font-bold text-blue-700">{foodStats.total}</p>
        </div>
        <div className="card bg-green-50 border-l-4 border-l-green-500">
          <p className="text-sm text-green-600">Đang bán</p>
          <p className="text-2xl font-bold text-green-700">{foodStats.available}</p>
        </div>
        <div className="card bg-red-50 border-l-4 border-l-red-500">
          <p className="text-sm text-red-600">Tạm ngưng</p>
          <p className="text-2xl font-bold text-red-700">{foodStats.unavailable}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6 max-w-2xl border-l-4 border-l-primary-500">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary-500 rounded-full"></span>
            {editingId ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Tên món *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Ví dụ: Phở bò đặc biệt"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Giá (₫) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="VD: 50000"
                  required
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Danh mục</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                rows={3}
                placeholder="Mô tả chi tiết món ăn..."
              />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-gray-700 font-medium">Còn bán món này</span>
              </label>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="hidden"
                  />
                  <span className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer flex items-center gap-1 shadow-sm">
                    📷 {imageFile ? 'Thay đổi ảnh' : 'Chọn ảnh món ăn'}
                  </span>
                </label>
                {imageFile && <span className="text-xs text-green-600 font-medium truncate max-w-[150px]">{imageFile.name}</span>}
                {editingId && !imageFile && (
                  <span className="text-xs text-gray-400 italic">Để trống nếu không muốn đổi ảnh</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editingId ? '✓ Cập nhật' : '+ Thêm mới'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field md:w-48"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
          >
            ▦ Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-white shadow' : ''}`}
          >
            ☰ Table
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFoods.map((food) => (
            <div key={food._id} className="card group overflow-hidden">
              <div className="relative">
                <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {food.imageUrl ? (
                    <img
                      src={`http://localhost:3000${food.imageUrl}`}
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🍽️
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleToggleAvailable(food._id, food.isAvailable)}
                  className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                    food.isAvailable
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {food.isAvailable ? '✓ Còn' : '✗ Hết'}
                </button>
              </div>
              <h3 className="font-bold text-lg truncate">{food.name}</h3>
              <p className="text-gray-500 text-sm truncate">{food.category?.name || 'Chưa phân loại'}</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-primary-600 font-bold text-lg">
                  {food.price?.toLocaleString('vi-VN')}₫
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(food)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(food._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Hình</th>
                <th className="text-left p-3 font-medium text-gray-600">Tên món</th>
                <th className="text-left p-3 font-medium text-gray-600">Danh mục</th>
                <th className="text-left p-3 font-medium text-gray-600">Giá</th>
                <th className="text-center p-3 font-medium text-gray-600">Trạng thái</th>
                <th className="text-right p-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredFoods.map((food) => (
                <tr key={food._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {food.imageUrl ? (
                        <img
                          src={`http://localhost:3000${food.imageUrl}`}
                          alt={food.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">🍽️</div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-medium">{food.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {food.category?.name || '-'}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-primary-600">
                    {food.price?.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="text-center p-3">
                    <button
                      onClick={() => handleToggleAvailable(food._id, food.isAvailable)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        food.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {food.isAvailable ? 'Còn món' : 'Hết món'}
                    </button>
                  </td>
                  <td className="text-right p-3">
                    <button
                      onClick={() => handleEdit(food)}
                      className="text-blue-500 hover:text-blue-600 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(food._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredFoods.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🍕</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy món ăn</h3>
          <p className="text-gray-500">Thử thay đổi bộ lọc hoặc thêm món ăn mới</p>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default FoodsManager;