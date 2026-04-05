import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.role?.name !== 'ADMIN' && user?.role?.name !== 'MODERATOR') {
      navigate('/');
    }
  }, [user, navigate]);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', description: 'Tổng quan hệ thống' },
    { path: '/admin/users', label: 'Người dùng', icon: '👥', description: 'Quản lý user & role', roles: ['ADMIN'] },
    { path: '/admin/categories', label: 'Danh mục', icon: '📁', description: 'Quản lý danh mục', roles: ['ADMIN', 'MODERATOR'] },
    { path: '/admin/foods', label: 'Món ăn', icon: '🍕', description: 'Quản lý sản phẩm', roles: ['ADMIN', 'MODERATOR'] },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '📦', description: 'Quản lý đơn hàng', roles: ['ADMIN', 'MODERATOR'] },
    { path: '/admin/reviews', label: 'Đánh giá', icon: '⭐', description: 'Quản lý review', roles: ['ADMIN', 'MODERATOR'] },
    { path: '/admin/vouchers', label: 'Mã giảm giá', icon: '🎫', description: 'Quản lý voucher', roles: ['ADMIN', 'MODERATOR'] },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (user?.role?.name !== 'ADMIN' && user?.role?.name !== 'MODERATOR') {
    return null;
  }

  const isModerator = user?.role?.name === 'MODERATOR';

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">🍔</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">FoodOrder</h1>
              <p className="text-xs text-gray-400">{isModerator ? 'Moderator' : 'Admin'} Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems
            .filter(item => !item.roles || item.roles.includes(user?.role?.name))
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className={`text-xs ${isActive ? 'text-primary-100' : 'text-gray-500'} group-hover:text-gray-300`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center font-bold">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.fullName || user?.username}</p>
              <p className="text-xs text-primary-400">{isModerator ? 'Moderator' : 'Administrator'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-center rounded-lg text-sm transition-colors"
            >
              Về trang chủ
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-bold">🍔 FoodOrder Admin</h1>
          <div className="w-8" />
        </div>

        {/* Page Content */}
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;