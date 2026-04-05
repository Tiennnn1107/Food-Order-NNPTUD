import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      await ordersAPI.cancel(orderId);
      setToast({ message: 'Đã hủy đơn hàng', type: 'success' });
      fetchOrders();
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Không thể hủy đơn', type: 'error' });
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {[
            { value: 'all', label: 'Tất cả' },
            { value: 'pending', label: 'Chờ xác nhận' },
            { value: 'confirmed', label: 'Đã xác nhận' },
            { value: 'delivering', label: 'Đang giao' },
            { value: 'delivered', label: 'Hoàn thành' },
            { value: 'cancelled', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">
                      Mã đơn: #{order._id.slice(-8)}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.foodName} x{item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-gray-500 text-sm">Tổng cộng</p>
                      <p className="text-xl font-bold text-primary-500">
                        {order.totalAmount.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn-secondary py-2"
                      >
                        Chi tiết
                      </Link>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-gray-500 mb-6">
              Đặt món ăn đầu tiên của bạn ngay hôm nay
            </p>
            <Link to="/foods" className="btn-primary">
              Xem thực đơn
            </Link>
          </div>
        )}
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

export default Orders;