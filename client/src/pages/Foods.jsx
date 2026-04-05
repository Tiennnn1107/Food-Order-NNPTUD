import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { foodsAPI, categoriesAPI } from '../api';

const Foods = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodsRes, categoriesRes] = await Promise.all([
          foodsAPI.getAll(searchParams.get('category') ? { category: searchParams.get('category') } : {}),
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

    fetchData();
  }, [searchParams]);

  const handleCategoryClick = (categoryId) => {
    if (categoryId === selectedCategory) {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Thực đơn</h1>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handleCategoryClick('')}
            className={`px-4 py-2 rounded-full transition-colors ${
              !selectedCategory
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category._id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Foods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foods
            .filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((food) => (
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

        {foods.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy món ăn nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Foods;