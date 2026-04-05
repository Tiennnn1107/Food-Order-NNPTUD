import { useEffect, useState } from 'react';
import { ordersAPI } from '../../api';
import Toast from '../../components/Toast';
import { useSearchParams } from 'react-router-dom';

const OrdersManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const filter = searchParams.get('filter') || 'all';

  useEffect(() => {
    fetchOrders();
  }, [filter]);

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

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      setToast({ message: `Đã cập nhật trạng thái thành ${getStatusLabel(status)}`, type: 'success' });
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        const updated = await ordersAPI.getById(orderId);
        setSelectedOrder(updated.data);
      }
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra', type: 'error' });
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      delivering: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
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

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleViewDetail = async (order) => {
    try {
      const response = await ordersAPI.getById(order._id);
      setSelectedOrder(response.data);
      setShowDetail(true);
    } catch (error) {
      setToast({ message: 'Không thể tải chi tiết đơn hàng', type: 'error' });
    }
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
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

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
            onClick={() => setSearchParams({ filter: tab.value })}
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

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Mã đơn</th>
              <th className="text-left p-3">Khách hàng</th>
              <th className="text-left p-3">Địa chỉ</th>
              <th className="text-left p-3">Tổng tiền</th>
              <th className="text-center p-3">Trạng thái</th>
              <th className="text-left p-3">Ngày đặt</th>
              <th className="text-right p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="p-3 font-medium">#{order._id.slice(-8)}</td>
                <td className="p-3">
                  <div>{order.user?.fullName || 'N/A'}</div>
                  <div className="text-gray-500 text-sm">{order.phone}</div>
                </td>
                <td className="p-3 text-gray-500 text-sm max-w-xs truncate">
                  {order.deliveryAddress}
                </td>
                <td className="p-3 font-medium">{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                <td className="text-center p-3">{getStatusBadge(order.status)}</td>
                <td className="p-3 text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="text-right p-3">
                  <button
                    onClick={() => handleViewDetail(order)}
                    className="text-blue-500 hover:text-blue-600 mr-3"
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <p className="text-gray-500 text-center py-8">Không có đơn hàng nào</p>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
                <button onClick={() => setShowDetail(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Mã đơn:</span>
                  <span className="font-medium">#{selectedOrder._id.slice(-8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Khách hàng:</span>
                  <span>{selectedOrder.user?.fullName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Địa chỉ:</span>
                  <p>{selectedOrder.deliveryAddress}</p>
                </div>
                <div>
                  <span className="text-gray-500">SĐT:</span>
                  <p>{selectedOrder.phone}</p>
                </div>
                {selectedOrder.note && (
                  <div>
                    <span className="text-gray-500">Ghi chú:</span>
                    <p className="bg-gray-100 p-2 rounded mt-1">{selectedOrder.note}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Sản phẩm</h3>
                  <div className="border rounded overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 text-sm">Món</th>
                          <th className="text-center p-2 text-sm">SL</th>
                          <th className="text-right p-2 text-sm">Giá</th>
                          <th className="text-right p-2 text-sm">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">{item.foodName}</td>
                            <td className="text-center p-2">{item.quantity}</td>
                            <td className="text-right p-2">{item.price.toLocaleString('vi-VN')}₫</td>
                            <td className="text-right p-2 font-medium">
                              {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary-500">
                      {selectedOrder.totalAmount.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="font-semibold mb-2">Cập nhật trạng thái</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'confirmed')}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                          Xác nhận đơn
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                        >
                          Hủy đơn
                        </button>
                      </>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'delivering')}
                          className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                        >
                          Giao hàng
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                        >
                          Hủy đơn
                        </button>
                      </>
                    )}
                    {selectedOrder.status === 'delivering' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                      >
                        Đã giao hàng
                      </button>
                    )}
                    {(selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled') && (
                      <span className="text-gray-500 text-sm italic">Không thể thay đổi trạng thái nữa</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default OrdersManager;