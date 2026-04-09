import React, { useState, useEffect } from 'react';

const StockCheckerModal = ({ product, onClose }) => {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [stockData, setStockData] = useState([]);
  const [commandOutput, setCommandOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample regions with units data
  const sampleRegions = [
    { region: 'London', total_quantity: 1250, warehouses: [
      { warehouse_code: 'LON-W01', quantity: 450, reorder_level: 100 },
      { warehouse_code: 'LON-W02', quantity: 520, reorder_level: 100 },
      { warehouse_code: 'LON-W03', quantity: 280, reorder_level: 80 }
    ]},
    { region: 'Epstein Island', total_quantity: 850, warehouses: [
      { warehouse_code: 'EPI-W01', quantity: 350, reorder_level: 90 },
      { warehouse_code: 'EPI-W02', quantity: 500, reorder_level: 110 }
    ]},
    { region: 'Ho Chi Minh', total_quantity: 2100, warehouses: [
      { warehouse_code: 'HCM-W01', quantity: 750, reorder_level: 150 },
      { warehouse_code: 'HCM-W02', quantity: 680, reorder_level: 130 },
      { warehouse_code: 'HCM-W03', quantity: 670, reorder_level: 120 }
    ]},
    { region: 'Hanoi', total_quantity: 1650, warehouses: [
      { warehouse_code: 'HN-W01', quantity: 620, reorder_level: 120 },
      { warehouse_code: 'HN-W02', quantity: 580, reorder_level: 110 },
      { warehouse_code: 'HN-W03', quantity: 450, reorder_level: 100 }
    ]},
    { region: 'Da Nang', total_quantity: 920, warehouses: [
      { warehouse_code: 'DN-W01', quantity: 520, reorder_level: 100 },
      { warehouse_code: 'DN-W02', quantity: 400, reorder_level: 90 }
    ]}
  ];

  useEffect(() => {
    fetchRegions();
  }, [product.id]);

  const fetchRegions = async () => {
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/api/products/${product.id}/regions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const data = await response.json();
      setRegions(data);
      if (data.length > 0) {
        setSelectedRegion(data[0].region);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      setError(`Failed to fetch regions: ${error.message}`);
      // Use sample data as fallback
      setRegions(sampleRegions);
      if (sampleRegions.length > 0) {
        setSelectedRegion(sampleRegions[0].region);
      }
    }
  };

  const checkStock = async () => {
    setLoading(true);
    setError('');
    setStockData([]);
    setCommandOutput('');

    try {
      let url;
      if (warehouseFilter) {
        url = `http://localhost:8000/api/products/${product.id}/stock/check?warehouse=${encodeURIComponent(warehouseFilter)}`;
      } else {
        url = `http://localhost:8000/api/products/${product.id}/stock/region?region=${encodeURIComponent(selectedRegion)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.stock_data) {
        setStockData(data.stock_data);
        setCommandOutput(data.command_output || '');
      } else if (Array.isArray(data)) {
        setStockData(data);
      } else {
        setError('Unexpected response format');
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      setError(`Failed to check stock: ${error.message}`);
      
      // Use sample data as fallback
      const selectedRegionData = sampleRegions.find(r => r.region === selectedRegion);
      if (selectedRegionData) {
        const sampleData = selectedRegionData.warehouses.map(w => ({
          region: selectedRegion,
          warehouse_code: w.warehouse_code,
          quantity: w.quantity,
          reorder_level: w.reorder_level
        }));
        setStockData(sampleData);
        setError('⚠️ Using sample data - Backend unavailable');
      }
    }
    setLoading(false);
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">📊 Stock Checker</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
            <p className="text-blue-600">{formatCurrency(product.price)}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-lg border-l-4 ${
              error.includes('sample') 
                ? 'bg-yellow-50 border-yellow-500 text-yellow-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              {error}
            </div>
          )}

          {/* Filter Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {regions.map(region => (
                  <option key={region.region} value={region.region}>
                    {region.region} (Total: {region.total_quantity} units)
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Warehouse Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., LON-W01 or HCM-W02"
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Leave blank to check entire region
              </p>
            </div>

            <button
              onClick={checkStock}
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-gray-400"
            >
              {loading ? '⏳ Checking...' : '🔍 Check Stock'}
            </button>
          </div>

          {/* Command Output (for pentesting) */}
          {commandOutput && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="text-xs text-gray-400 mb-2">Command Output:</div>
              <pre>{commandOutput}</pre>
            </div>
          )}

          {/* Stock Data */}
          {stockData.length > 0 && (
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-4">📦 Stock Information</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Region</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Warehouse</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Units</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Reorder Level</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{item.region}</td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{item.warehouse_code}</td>
                        <td className="px-4 py-3 text-center font-semibold text-gray-800">{item.quantity}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{item.reorder_level}</td>
                        <td className="px-4 py-3 text-center">
                          {item.quantity === 0 ? (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Out</span>
                          ) : item.quantity <= item.reorder_level ? (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">Low</span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {stockData.length === 0 && !loading && (
            <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-600">
              <p>Click "Check Stock" to view inventory data for the selected region</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockCheckerModal;
