import React, { useState } from 'react';

const QuickViewModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState('London');

  // Sample regions with stock units
  const regions = [
    { name: 'London', units: 1250, status: 'In Stock' },
    { name: 'Epstein Island', units: 850, status: 'In Stock' },
    { name: 'Ho Chi Minh', units: 2100, status: 'In Stock' },
    { name: 'Hanoi', units: 1650, status: 'Low Stock' },
    { name: 'Da Nang', units: 920, status: 'In Stock' }
  ];

  const currentRegion = regions.find(r => r.name === selectedRegion);

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const addToCart = () => {
    // TODO: Integrate with actual cart API
    alert(`Added ${quantity} x ${product.name} to cart (Ship to: ${selectedRegion})`);
    onClose();
  };

  const getRegionStatusColor = (status) => {
    switch(status) {
      case 'In Stock': return 'bg-green-100 text-green-800 border-green-300';
      case 'Low Stock': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Out of Stock': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Quick View</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-blue-600 font-semibold">{product.category_name}</p>
                <h3 className="text-2xl font-bold text-gray-800">{product.name}</h3>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="text-lg">⭐ {product.rating.toFixed(1)}</div>
                <span className="text-gray-500">({product.rating_count} reviews)</span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-blue-900">
                {formatCurrency(product.price)}
              </div>

              {/* Availability */}
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                product.availability_status === 'In Stock' ? 'bg-green-100 text-green-800' :
                product.availability_status === 'Low Stock' ? 'bg-orange-100 text-orange-800' :
                product.availability_status === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {product.availability_status}
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{product.description}</p>
              </div>

              {/* Region Selector - Switch Bar */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">📍 Select Region & Availability</label>
                <div className="flex flex-wrap gap-2">
                  {regions.map(region => (
                    <button
                      key={region.name}
                      onClick={() => setSelectedRegion(region.name)}
                      className={`px-3 py-2 rounded-lg border-2 transition text-sm font-semibold ${
                        selectedRegion === region.name
                          ? 'border-blue-500 bg-blue-50 text-blue-800'
                          : `border-gray-300 bg-white text-gray-700 hover:${getRegionStatusColor(region.status)}`
                      }`}
                    >
                      {region.name}
                      <br/>
                      <span className="text-xs">{region.units} units</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Region Stock */}
              {currentRegion && (
                <div className={`p-3 rounded-lg border-2 ${getRegionStatusColor(currentRegion.status)}`}>
                  <div className="text-sm font-semibold">{currentRegion.name}</div>
                  <div className="text-xs mt-1">Available: <span className="font-bold">{currentRegion.units} units</span></div>
                  <div className="text-xs">Status: <span className="font-bold">{currentRegion.status}</span></div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-semibold">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                disabled={product.availability_status === 'Out of Stock'}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {product.availability_status === 'Out of Stock' ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
