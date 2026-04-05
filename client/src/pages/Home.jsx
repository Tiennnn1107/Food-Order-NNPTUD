import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { foodsAPI, categoriesAPI } from '../api';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, foodsRes] = await Promise.all([
          categoriesAPI.getAll(),
          foodsAPI.getAll({ limit: 8 }),
        ]);
        setCategories(categoriesRes.data || []);
        setFeaturedFoods(foodsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🍕 Đặt Món Ăn Ngon
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Giao hàng tận nơi - Nhanh chóng - Tiện lợi
          </p>
          <Link to="/foods" className="bg-white text-primary-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-block">
            Đặt món ngay
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Danh mục</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/foods?category=${category._id}`}
                className="card flex flex-col items-center p-4 hover:scale-105 transition-transform"
              >
                {category.imageUrl ? (
                  <img
                    src={`http://localhost:3000${category.imageUrl}`}
                    alt={category.name}
                    className="w-20 h-20 object-cover rounded-full mb-2"
                  />
                ) : (
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                    <span className="text-3xl">🍽️</span>
                  </div>
                )}
                <span className="text-center font-medium text-gray-700">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Foods */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Món ăn nổi bật</h2>
            <Link to="/foods" className="text-primary-500 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredFoods.map((food) => (
              <Link key={food._id} to={`/foods/${food._id}`} className="card overflow-hidden">
                <div className="aspect-square bg-gray-100 mb-4">
                  {food.imageUrl ? (
                    <img
                      src={`http://localhost:3000${food.imageUrl}`}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🍴
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{food.name}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{food.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary-500 font-bold text-lg">
                    {food.price.toLocaleString('vi-VN')}₫
                  </span>
                  {food.isAvailable ? (
                    <span className="text-green-500 text-sm">Còn món</span>
                  ) : (
                    <span className="text-red-500 text-sm">Hết món</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-500">Giao hàng trong 30 phút</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Chất lượng đảm bảo</h3>
              <p className="text-gray-500">Nguyên liệu tươi ngon mỗi ngày</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-semibold text-xl mb-2">Giá cả hợp lý</h3>
              <p className="text-gray-500">Nhiều ưu đãi hấp dẫn</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;