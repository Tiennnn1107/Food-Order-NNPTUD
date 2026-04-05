import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { foodsAPI, ordersAPI, usersAPI } from '../../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFoods: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueByDay, setRevenueByDay] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [foodsRes, ordersRes, usersRes] = await Promise.all([
        foodsAPI.getAll(),
        ordersAPI.getAll(),
        usersAPI.getAll(),
      ]);

      const foods = foodsRes.data || [];
      const orders = ordersRes.data || [];
      const users = usersRes.data || [];

      // Calculate revenue
      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // Today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = deliveredOrders.filter(o => new Date(o.createdAt) >= today);
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // This month's revenue
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const monthOrders = deliveredOrders.filter(o => new Date(o.createdAt) >= thisMonth);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // Revenue by day (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayOrders = deliveredOrders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= date && orderDate < nextDate;
        });
        const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        last7Days.push({
          day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
          revenue: dayRevenue,
          orders: dayOrders.length,
        });
      }

      setStats({
        totalFoods: foods.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue,
        todayRevenue,
        monthRevenue,
      });

      setRecentOrders(orders.slice(-5).reverse());
      setRevenueByDay(last7Days);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
      delivering: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
      delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    };
    const c = config[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return amount.toLocaleString('vi-VN');
  };

  const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue), 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-6">Tổng quan hệ thống quản lý nhà hàng</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-sm font-medium opacity-90">Tổng món ăn</h3>
          <p className="text-3xl font-bold mt-1">{stats.totalFoods}</p>
          <Link to="/admin/foods" className="text-xs opacity-75 hover:opacity-100 mt-2 inline-block">
            Quản lý →
          </Link>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-sm font-medium opacity-90">Tổng đơn hàng</h3>
          <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
          <Link to="/admin/orders" className="text-xs opacity-75 hover:opacity-100 mt-2 inline-block">
            Quản lý →
          </Link>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-sm font-medium opacity-90">Chờ xử lý</h3>
          <p className="text-3xl font-bold mt-1">{stats.pendingOrders}</p>
          <Link to="/admin/orders?filter=pending" className="text-xs opacity-75 hover:opacity-100 mt-2 inline-block">
            Xem ngay →
          </Link>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-sm font-medium opacity-90">Người dùng</h3>
          <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
          <Link to="/admin/users" className="text-xs opacity-75 hover:opacity-100 mt-2 inline-block">
            Quản lý →
          </Link>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Doanh thu hôm nay</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayRevenue)}₫</p>
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Doanh thu tháng này</h3>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.monthRevenue)}₫</p>
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Tổng doanh thu</h3>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}₫</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Doanh thu 7 ngày qua</h2>
          <div className="flex items-end justify-between h-48 gap-2">
            {revenueByDay.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '160px' }}>
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{day.day}</span>
                <span className="text-xs font-medium text-primary-600">{formatCurrency(day.revenue)}k</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Đơn hàng gần đây</h2>
            <Link to="/admin/orders" className="text-primary-500 hover:underline text-sm">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center font-bold text-primary-600">
                    #{order._id.slice(-4)}
                  </div>
                  <div>
                    <p className="font-medium">{order.user?.fullName || order.user?.username || 'Khách'}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">{order.totalAmount?.toLocaleString('vi-VN')}₫</p>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-gray-500 text-center py-8">Chưa có đơn hàng nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 card">
        <h2 className="text-xl font-bold mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/foods" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors">
            <span className="text-3xl mb-2">🍕</span>
            <span className="font-medium">Thêm món ăn</span>
          </Link>
          <Link to="/admin/categories" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors">
            <span className="text-3xl mb-2">📁</span>
            <span className="font-medium">Quản lý danh mục</span>
          </Link>
          <Link to="/admin/vouchers" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors">
            <span className="text-3xl mb-2">🎫</span>
            <span className="font-medium">Tạo voucher</span>
          </Link>
          <Link to="/admin/orders" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors">
            <span className="text-3xl mb-2">📦</span>
            <span className="font-medium">Xem đơn hàng</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;