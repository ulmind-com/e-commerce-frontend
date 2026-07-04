import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { ProductCard } from '../components/ui/ProductCard';

const CATEGORY_IMAGES = {
  "Fresh Fruits":          "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80",
  "Pharmacy":              "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&q=80",
  "Pet Care":              "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&q=80",
  "Baby Care":             "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&q=80",
  "Dairy, Bread & Eggs":   "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80",
  "Mouth fresheners":      "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=200&q=80",
  "Cold Drinks & Juices":  "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=200&q=80",
  "Candies & Gums":        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&q=80",
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 text-xs">Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleBannerClick = (searchTerm) => {
    const cat = categories.find(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (cat) {
      setSelectedCategory(cat._id);
    } else {
      navigate(`/products?search=${searchTerm}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get('http://localhost:8000/api/categories/'),
          axios.get('http://localhost:8000/api/products?limit=100')
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCategories = selectedCategory 
    ? categories.filter(c => c._id === selectedCategory) 
    : categories;

  const productsByCategory = filteredCategories.map(cat => ({
    ...cat,
    products: products.filter(p => p.category_id === cat._id)
  })).filter(cat => cat.products.length > 0);

  // Fallback if category_id matching fails (in case DB IDs mismatched)
  if (productsByCategory.length === 0 && products.length > 0) {
      productsByCategory.push({
          _id: "all",
          name: "All Products",
          products: products
      });
  }

  return (
    <div className="bg-white min-h-screen pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner */}
        <div className="relative rounded-xl overflow-hidden bg-[#247b46] text-white flex items-center shadow-sm mb-6 h-[240px]">
          <div className="flex-1 pl-12 z-10">
            <h1 className="text-4xl font-bold mb-3">Stock up on daily essentials</h1>
            <p className="text-lg opacity-90 mb-6 max-w-md">
              Get farm-fresh goodness & a range of exotic fruits, vegetables, eggs & more
            </p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-white text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2">
            <div className="absolute inset-0 bg-gradient-to-r from-[#247b46] to-transparent z-10" />
            <img 
              src="/grocery_essentials.png" 
              alt="Daily Essentials" 
              className="h-full w-full object-cover object-left"
            />
          </div>
        </div>

        {/* Small Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div 
            onClick={() => handleBannerClick('pharmacy')}
            className="relative rounded-xl overflow-hidden bg-[#0ba1a7] text-white h-[180px] cursor-pointer shadow-sm group flex flex-col justify-between p-6">
            <div className="z-10 relative pointer-events-none flex-1">
              <h3 className="text-2xl font-bold mb-1 leading-tight w-3/4">Pharmacy at your doorstep!</h3>
              <p className="text-sm opacity-90 mb-4 w-2/3">Cough syrups, pain relief sprays & more</p>
            </div>
            <div className="z-10 relative mt-auto">
              <button className="bg-white text-[#0ba1a7] px-4 py-1.5 rounded-md text-sm font-semibold group-hover:bg-gray-100 transition-colors pointer-events-auto">
                Order Now
              </button>
            </div>
            <img 
              src="/pharmacy_banner.png" 
              alt="Pharmacy" 
              className="absolute right-0 bottom-0 h-[120%] w-auto object-cover opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all"
            />
          </div>

          <div 
            onClick={() => handleBannerClick('pet')}
            className="relative rounded-xl overflow-hidden bg-[#f0c341] text-gray-900 h-[180px] cursor-pointer shadow-sm group flex flex-col justify-between p-6">
            <div className="z-10 relative pointer-events-none flex-1">
              <h3 className="text-2xl font-bold mb-1 leading-tight w-3/4">Pet care supplies at your door</h3>
              <p className="text-sm opacity-90 mb-4 w-2/3">Food, treats, toys & more</p>
            </div>
            <div className="z-10 relative mt-auto">
              <button className="bg-gray-900 text-white px-4 py-1.5 rounded-md text-sm font-semibold group-hover:bg-black transition-colors pointer-events-auto">
                Order Now
              </button>
            </div>
            <img 
              src="/pet_care_banner.png" 
              alt="Pet Care" 
              className="absolute right-0 bottom-0 h-full w-auto object-cover opacity-90 mix-blend-luminosity hover:mix-blend-normal transition-all"
            />
          </div>

          <div 
            onClick={() => handleBannerClick('baby')}
            className="relative rounded-xl overflow-hidden bg-[#d0e1e6] text-gray-900 h-[180px] cursor-pointer shadow-sm group flex flex-col justify-between p-6">
            <div className="z-10 relative pointer-events-none flex-1">
              <h3 className="text-2xl font-bold mb-1 leading-tight w-3/4">No time for a diaper run?</h3>
              <p className="text-sm opacity-90 mb-4 w-2/3">Get baby care essentials</p>
            </div>
            <div className="z-10 relative mt-auto">
              <button className="bg-[#5c8c99] text-white px-4 py-1.5 rounded-md text-sm font-semibold group-hover:bg-[#466f7a] transition-colors pointer-events-auto">
                Order Now
              </button>
            </div>
            <img 
              src="/baby_care_banner.png" 
              alt="Baby Care" 
              className="absolute right-0 bottom-0 h-full w-auto object-cover mix-blend-luminosity hover:mix-blend-normal transition-all"
            />
          </div>
        </div>

        {/* Category Icons Row */}
        {!loading && categories.length > 0 && (
          <div className="mb-10">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              <div 
                onClick={() => setSelectedCategory(null)}
                className="flex flex-col items-center min-w-[100px] cursor-pointer group">
                <div className={`w-20 h-20 bg-[#f4f6f8] rounded-2xl flex items-center justify-center mb-2 overflow-hidden shadow-sm border ${selectedCategory === null ? 'border-[#0c831f] border-2' : 'border-gray-100'} group-hover:shadow-md transition-shadow`}>
                  <img src="/logo.png" alt="All Products" className="w-12 h-12 object-contain group-hover:scale-105 transition-transform" />
                </div>
                <span className={`text-xs font-semibold text-center leading-tight w-full break-words ${selectedCategory === null ? 'text-[#0c831f]' : 'text-gray-700'}`}>
                  All Products
                </span>
              </div>
              {categories.map((cat, idx) => {
                const imgUrl = CATEGORY_IMAGES[cat.name] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80";
                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedCategory(cat._id)}
                    className="flex flex-col items-center min-w-[100px] cursor-pointer group">
                    <div className={`w-20 h-20 bg-[#f4f6f8] rounded-2xl flex items-center justify-center mb-2 overflow-hidden shadow-sm border ${selectedCategory === cat._id ? 'border-[#0c831f] border-2' : 'border-gray-100'} group-hover:shadow-md transition-shadow`}>
                      <img src={imgUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <span className={`text-xs font-semibold text-center leading-tight w-full break-words ${selectedCategory === cat._id ? 'text-[#0c831f]' : 'text-gray-700'}`}>
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Listing grouped by Categories */}
        <div className="pb-16">
          {loading ? (
            <div className="flex justify-center items-center h-40">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0c831f]" />
            </div>
          ) : productsByCategory.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No products found.
            </div>
          ) : (
            productsByCategory.map((category) => (
              <div key={category._id} className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{category.name}</h2>
                  <Link to={`/products?category=${category._id}`} className="text-[#0c831f] font-semibold text-sm hover:underline flex items-center gap-1">
                    see all <span className="text-lg">›</span>
                  </Link>
                </div>
                
                <div className={`${selectedCategory ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4' : 'flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide'}`}>
                  {category.products.map((product, index) => (
                    <div key={product._id} className={selectedCategory ? '' : 'min-w-[200px] max-w-[200px] flex-shrink-0'}>
                      <ErrorBoundary>
                        <ProductCard
                          product={product}
                          onAddToCart={addToCart}
                          index={index}
                        />
                      </ErrorBoundary>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
