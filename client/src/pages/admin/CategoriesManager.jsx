import { useEffect, useState } from 'react';
import { categoriesAPI } from '../../api';
import Toast from '../../components/Toast';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await categoriesAPI.update(editingId, formData);
        setToast({ message: 'Cập nhật danh mục thành công', type: 'success' });
      } else {
        await categoriesAPI.create(formData);
        setToast({ message: 'Thêm danh mục thành công', type: 'success' });
      }
      fetchData();
      resetForm();
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setEditingId(category._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      await categoriesAPI.delete(id);
      setToast({ message: 'Đã xóa danh mục', type: 'success' });
      fetchData();
      if (editingId === id) resetForm();
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Không thể xóa danh mục này', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingId(null);
    setShowForm(false);
  };

  // Icons for categories
  const categoryIcons = ['🍕', '🍔', '🍜', '🥗', '🍰', '🥤', '☕', '🍣', '🥪', '🍛'];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
          <p className="text-gray-500 text-sm">Quản lý các danh mục món ăn</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn-primary ${showForm ? 'bg-gray-500 hover:bg-gray-600' : ''}`}
        >
          {showForm ? '✕ Hủy' : '+ Thêm danh mục'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6 max-w-xl border-l-4 border-l-primary-500">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary-500 rounded-full"></span>
            {editingId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Tên danh mục *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Ví dụ: Món chính, Đồ uống..."
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Mô tả ngắn về danh mục..."
              />
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat, index) => (
          <div
            key={cat._id}
            className="card hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center text-2xl">
                {categoryIcons[index % categoryIcons.length]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{cat.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{cat.description || 'Chưa có mô tả'}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <button
                onClick={() => handleEdit(cat)}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                ✏️ Sửa
              </button>
              <button
                onClick={() => handleDelete(cat._id)}
                className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có danh mục nào</h3>
          <p className="text-gray-500 mb-4">Bắt đầu thêm danh mục để quản lý món ăn</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            + Thêm danh mục đầu tiên
          </button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CategoriesManager;