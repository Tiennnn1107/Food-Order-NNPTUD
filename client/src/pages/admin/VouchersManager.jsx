import { useEffect, useState } from 'react';
import { vouchersAPI } from '../../api';
import Toast from '../../components/Toast';
import Loading from '../../components/Loading';

const VouchersManager = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await vouchersAPI.getAll();
      setVouchers(response.data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        endDate: formData.endDate ? new Date(formData.endDate) : null,
      };

      if (editingId) {
        await vouchersAPI.update(editingId, submitData);
        setToast({ message: 'Cập nhật thành công', type: 'success' });
      } else {
        await vouchersAPI.create(submitData);
        setToast({ message: 'Tạo voucher thành công', type: 'success' });
      }
      fetchData();
      resetForm();
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleEdit = (voucher) => {
    setFormData({
      code: voucher.code,
      description: voucher.description || '',
      discountType: voucher.discountType,
      discountValue: voucher.discountValue.toString(),
      minOrderAmount: voucher.minOrderAmount?.toString() || '',
      maxDiscount: voucher.maxDiscount?.toString() || '',
      usageLimit: voucher.usageLimit?.toString() || '',
      startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split('T')[0] : '',
      endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split('T')[0] : '',
    });
    setEditingId(voucher._id);
    setShowForm(true);
  };

  const handleToggle = async (id) => {
    try {
      await vouchersAPI.toggle(id);
      setToast({ message: 'Đã thay đổi trạng thái', type: 'success' });
      fetchData();
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    try {
      await vouchersAPI.delete(id);
      setToast({ message: 'Đã xóa voucher', type: 'success' });
      fetchData();
      if (editingId === id) resetForm();
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percent',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      startDate: '',
      endDate: '',
      usageLimit: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Voucher</h1>
          <p className="text-gray-500">Danh sách các mã giảm giá trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            showForm ? 'bg-gray-100 text-gray-700' : 'bg-primary-600 text-white shadow-md'
          }`}
        >
          {showForm ? 'Hủy bỏ' : '+ Tạo Voucher mới'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 shadow-inner">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary-600 rounded-full"></span>
            {editingId ? 'Cập nhật thông tin Voucher' : 'Thiết lập Voucher mới'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mã Voucher *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                  required
                  placeholder="Vd: CHAOBANMOI"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Loại giảm giá</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                >
                  <option value="percent">Giảm theo phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (₫)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Giảm tối đa (₫)</label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                    placeholder="Vd: 50000"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Đơn tối thiểu (₫)</label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                  placeholder="Vd: 100000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lượt dùng tối đa</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả ngắn</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="Vd: Giảm 20% cho người dùng mới..."
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md"
              >
                {editingId ? 'Lưu thay đổi' : 'Tạo Voucher'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vouchers List Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Mã & Mô tả</th>
              <th className="px-6 py-4">Giảm giá</th>
              <th className="px-6 py-4">Thời gian</th>
              <th className="px-6 py-4 text-center">Đã dùng / Giới hạn</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vouchers.map((voucher) => (
              <tr key={voucher._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md font-mono font-bold text-sm">
                    {voucher.code}
                  </span>
                  <p className="text-gray-500 text-sm mt-1 truncate max-w-[200px]">{voucher.description}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-800">
                    {voucher.discountType === 'percent'
                      ? `${voucher.discountValue}%`
                      : `${voucher.discountValue.toLocaleString('vi-VN')}₫`}
                  </div>
                  {voucher.minOrderAmount > 0 && (
                    <p className="text-[10px] text-gray-400">Đơn từ: {voucher.minOrderAmount.toLocaleString('vi-VN')}₫</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-gray-600">
                    <div>BĐ: {new Date(voucher.startDate).toLocaleDateString('vi-VN')}</div>
                    <div>KT: {voucher.endDate ? new Date(voucher.endDate).toLocaleDateString('vi-VN') : 'N/A'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm font-medium text-gray-700">
                    {voucher.usedCount || 0} / {voucher.usageLimit || '∞'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-primary-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(((voucher.usedCount || 0) / (voucher.usageLimit || 100)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggle(voucher._id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      voucher.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                        : 'bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700'
                    }`}
                  >
                    {voucher.isActive ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(voucher)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(voucher._id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vouchers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">Không tìm thấy mã giảm giá nào.</p>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default VouchersManager;
