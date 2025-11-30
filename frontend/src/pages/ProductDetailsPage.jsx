import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, ArrowLeft, Star, Truck, Shield, Leaf, AlertTriangle, User } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProductDetailsPage = ({ onAddToCart }) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [rating, setRating] = useState({ average_rating: 0, total_reviews: 0, rating_distribution: {} });
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchRating();
    fetchReviews();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        fetchRelatedProducts(data.category);
        checkIfNewArrival();
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const checkIfNewArrival = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products`);
      if (response.ok) {
        const allProducts = await response.json();
        const newArrivalIds = allProducts.slice(-6).map(p => p.id);
        setIsNewArrival(newArrivalIds.includes(productId));
      }
    } catch (error) {
      console.error('Error checking new arrival:', error);
    }
  };

  const fetchRating = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products/${productId}/rating`);
      if (response.ok) {
        const data = await response.json();
        setRating(data);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await fetch(`${BACKEND_URL}/api/products/${productId}/reviews?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/products?category=${category}`);
      if (response.ok) {
        const data = await response.json();
        setRelatedProducts(data.filter(p => p.id !== productId).slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    if (product && stock > 0) {
      onAddToCart({ ...product, quantity: Math.min(quantity, stock) });
      setQuantity(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const originalPrice = product.original_price || product.originalPrice;
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const stock = product.stock ?? 100;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 10;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4 md:mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-4 md:p-8">
            {/* Product Image */}
            <div className="relative">
              <div className={`aspect-square rounded-xl overflow-hidden bg-gray-100 ${isOutOfStock ? 'opacity-50' : ''}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                  <span className="bg-red-600 text-white text-lg font-bold px-6 py-2 rounded-lg">
                    Out of Stock
                  </span>
                </div>
              )}
              {discount > 0 && !isOutOfStock && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-lg">
                  {discount}% OFF
                </span>
              )}
              {(product.is_bestseller || product.isBestseller) && !isOutOfStock && (
                <span className="absolute top-4 right-4 bg-[#4CAF50] text-white text-sm font-semibold px-3 py-1 rounded-lg">
                  Bestseller
                </span>
              )}
              {isNewArrival && !isOutOfStock && !(product.is_bestseller || product.isBestseller) && (
                <span className="absolute top-4 right-4 bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-lg">
                  New Arrival
                </span>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="mb-4">
                <p className="text-sm text-green-600 font-medium mb-2 capitalize">{product.category?.replace('-', ' ')}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                <p className="text-gray-500">{product.weight}</p>
              </div>

              {/* Low Stock Warning */}
              {isLowStock && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                  <AlertTriangle size={20} />
                  <span className="font-medium">Hurry up! Only {stock} stock available</span>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={i < Math.round(rating.average_rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({rating.average_rating > 0 ? `${rating.average_rating} rating` : 'No ratings yet'})
                </span>
                {rating.total_reviews > 0 && (
                  <span className="text-sm text-gray-400">• {rating.total_reviews} review{rating.total_reviews > 1 ? 's' : ''}</span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-800">₹{product.price.toFixed(2)}</span>
                {originalPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through">₹{originalPrice}</span>
                )}
                {discount > 0 && (
                  <span className="text-green-600 font-medium">Save ₹{(originalPrice - product.price).toFixed(2)}</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 mb-6">{product.description}</p>
              )}

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-lg">
                  <Leaf size={24} className="text-green-600 mb-2" />
                  <span className="text-xs text-gray-600">100% Natural</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-lg">
                  <Shield size={24} className="text-green-600 mb-2" />
                  <span className="text-xs text-gray-600">Quality Assured</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-lg">
                  <Truck size={24} className="text-green-600 mb-2" />
                  <span className="text-xs text-gray-600">Fast Delivery</span>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                >
                  <span>Out of Stock</span>
                </button>
              ) : (
                <div className="flex items-center gap-4 mt-auto">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="px-6 text-lg font-medium">{quantity}</span>
                    <button
                      onClick={() => quantity < stock && setQuantity(quantity + 1)}
                      disabled={quantity >= stock}
                      className={`p-3 transition-colors ${quantity >= stock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#4CAF50] hover:bg-[#43A047] text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              )}

              {/* Stock Info */}
              <p className="text-sm mt-4">
                {isOutOfStock ? (
                  <span className="text-red-500 font-medium">✗ Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-red-500 font-medium">Hurry up! Only {stock} stock available</span>
                ) : (
                  <span className="text-green-600">✓ In Stock</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Customer Reviews</h2>
            {rating.total_reviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < Math.round(rating.average_rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                    />
                  ))}
                </div>
                <span className="font-semibold">{rating.average_rating}</span>
                <span className="text-gray-500">({rating.total_reviews} reviews)</span>
              </div>
            )}
          </div>

          {/* Rating Distribution */}
          {rating.total_reviews > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = rating.rating_distribution?.[String(star)] || 0;
                  const percentage = rating.total_reviews > 0 ? (count / rating.total_reviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-8">{star} ★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{review.user_name}</span>
                        {review.is_verified_purchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Verified Purchase</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                      {review.review_text && (
                        <p className="text-gray-600 text-sm">{review.review_text}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400">Be the first to review this product!</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relProduct) => {
                const relOriginalPrice = relProduct.original_price || relProduct.originalPrice;
                const relDiscount = Math.round(((relOriginalPrice - relProduct.price) / relOriginalPrice) * 100);
                const relStock = relProduct.stock ?? 100;
                const relIsOutOfStock = relStock <= 0;
                
                return (
                  <div
                    key={relProduct.id}
                    onClick={() => navigate(`/product/${relProduct.id}`)}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  >
                    <div className={`relative aspect-square ${relIsOutOfStock ? 'opacity-50' : ''}`}>
                      <img
                        src={relProduct.image}
                        alt={relProduct.name}
                        className="w-full h-full object-cover"
                      />
                      {relIsOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {relDiscount > 0 && !relIsOutOfStock && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                          {relDiscount}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{relProduct.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{relProduct.weight}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">₹{relProduct.price}</span>
                        {relOriginalPrice > relProduct.price && (
                          <span className="text-xs text-gray-400 line-through">₹{relOriginalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
