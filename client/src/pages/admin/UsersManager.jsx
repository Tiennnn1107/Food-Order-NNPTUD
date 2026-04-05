import { useEffect, useState } from 'react';
import { usersAPI, rolesAPI } from '../../api';
import Toast from '../../components/Toast';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterRole, setFilterRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        usersAPI.getAll(),
        rolesAPI.getAll(),
      ]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, roleId) => {
    try {
      await usersAPI.update(userId, { role: roleId });
      setToast({ message: 'Cập nhật vai trò thành công', type: 'success' });
      fetchData();
      if (selectedUser?._id === userId) {
        const updated = await usersAPI.getById(userId);
        setSelectedUser(updated.data);
      }
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    try {
      await usersAPI.delete(id);
      setToast({ message: 'Đã xóa người dùng', type: 'success' });
      fetchData();
      setShowDetail(false);
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await usersAPI.update(userId, { status: !currentStatus });
      setToast({ message: `Đã ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`, type: 'success' });
      fetchData();
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-700 border-red-200',
      MODERATOR: 'bg-blue-100 text-blue-700 border-blue-200',
      CUSTOMER: 'bg-green-100 text-green-700 border-green-200',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[role?.name] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {role?.name || 'N/A'}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = !filterRole || user.role?._id === filterRole;
    const matchesSearch = !searchTerm ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role?.name === 'ADMIN').length,
    moderators: users.filter(u => u.role?.name === 'MODERATOR').length,
    customers: users.filter(u => u.role?.name === 'CUSTOMER').length,
    active: users.filter(u => u.status !== false).length,
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
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm">Quản lý tài khoản và phân quyền người dùng</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="card bg-gray-50">
          <p className="text-sm text-gray-500">Tổng users</p>
          <p className="text-2xl font-bold">{userStats.total}</p>
        </div>
        <div className="card bg-red-50">
          <p className="text-sm text-red-600">Admin</p>
          <p className="text-2xl font-bold text-red-700">{userStats.admins}</p>
        </div>
        <div className="card bg-blue-50">
          <p className="text-sm text-blue-600">Moderator</p>
          <p className="text-2xl font-bold text-blue-700">{userStats.moderators}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-green-600">Customer</p>
          <p className="text-2xl font-bold text-green-700">{userStats.customers}</p>
        </div>
        <div className="card bg-purple-50">
          <p className="text-sm text-purple-600">Đang hoạt động</p>
          <p className="text-2xl font-bold text-purple-700">{userStats.active}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="input-field md:w-48"
        >
          <option value="">Tất cả vai trò</option>
          {roles.map(role => (
            <option key={role._id} value={role._id}>{role.name}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">User</th>
                <th className="text-left p-3 font-medium text-gray-600">Họ tên</th>
                <th className="text-left p-3 font-medium text-gray-600">Email</th>
                <th className="text-center p-3 font-medium text-gray-600">Vai trò</th>
                <th className="text-center p-3 font-medium text-gray-600">Trạng thái</th>
                <th className="text-left p-3 font-medium text-gray-600">Ngày tạo</th>
                <th className="text-right p-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </div>
                      <span className="font-medium">@{user.username}</span>
                    </div>
                  </td>
                  <td className="p-3">{user.fullName || '-'}</td>
                  <td className="p-3 text-gray-500">{user.email || '-'}</td>
                  <td className="text-center p-3">{getRoleBadge(user.role)}</td>
                  <td className="text-center p-3">
                    <button
                      onClick={() => handleToggleStatus(user._id, user.status)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.status !== false ? 'Hoạt động' : 'Vô hiệu'}
                    </button>
                  </td>
                  <td className="p-3 text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="text-right p-3">
                    <button
                      onClick={() => { setSelectedUser(user); setShowDetail(true); }}
                      className="text-blue-500 hover:text-blue-600 mr-3"
                    >
                      Chi tiết
                    </button>
                    {user.role?.name !== 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <p className="text-gray-500 text-center py-8">Không tìm thấy người dùng nào</p>
        )}
      </div>

      {/* User Detail Modal */}
      {showDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Chi tiết người dùng</h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                  {selectedUser.fullName?.charAt(0) || selectedUser.username?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-bold text-lg">{selectedUser.fullName || 'User'}</p>
                  <p className="text-gray-500">@{selectedUser.username}</p>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
              </div>

              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{selectedUser.email || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số điện thoại</span>
                  <span className="font-medium">{selectedUser.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Địa chỉ</span>
                  <span className="font-medium">{selectedUser.address || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày tạo</span>
                  <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Thay đổi vai trò</label>
                <select
                  value={selectedUser.role?._id || ''}
                  onChange={(e) => handleUpdateRole(selectedUser._id, e.target.value)}
                  className="input-field w-full"
                >
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleToggleStatus(selectedUser._id, selectedUser.status)}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    selectedUser.status !== false
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {selectedUser.status !== false ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
                {selectedUser.role?.name !== 'ADMIN' && (
                  <button
                    onClick={() => handleDelete(selectedUser._id)}
                    className="flex-1 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600"
                  >
                    Xóa tài khoản
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UsersManager;