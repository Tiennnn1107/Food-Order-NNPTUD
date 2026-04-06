import { useState } from 'react';
import { Link } from 'react-router-dom';
import authAPI from '../api/auth';
import Toast from '../components/Toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email form, 2: Reset password form
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      setToast({ message: response.data.message, type: 'success' });
      setStep(2);
    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Có lỗi xảy ra',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setToast({ message: 'Mật khẩu xác nhận không khớp', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ message: 'Mật khẩu phải có ít nhất 6 ký tự', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({ token, newPassword });
      setToast({ message: 'Đặt lại mật khẩu thành công', type: 'success' });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Có lỗi xảy ra',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quên mật khẩu</h1>
          <p className="text-gray-500 mt-2">
            {step === 1
              ? 'Nhập email để khôi phục mật khẩu'
              : 'Nhập token và mật khẩu mới'}
          </p>
        </div>

        <div className="card">
          {step === 1 ? (
            <form onSubmit={handleSendResetEmail} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Nhập email của bạn"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Chúng tôi sẽ gửi một token khôi phục mật khẩu đến email của bạn
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Token khôi phục
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="input-field"
                  placeholder="Nhập token từ email"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary-500 hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
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

export default ForgotPassword;