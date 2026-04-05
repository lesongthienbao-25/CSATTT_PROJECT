import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');

    const fetchProducts = async (query = '') => {
        // Gọi API search có chứa lỗ hổng SQL Injection [cite: 214, 233]
        const res = await fetch(`http://localhost:8000/api/products/search?q=${query}`);
        const data = await res.json();
        setProducts(data);
    };

    useEffect(() => { fetchProducts(); }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Danh mục sản phẩm</h1>
            <div className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    className="border p-2 w-full text-black" 
                    placeholder="Tìm kiếm sản phẩm..." 
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button 
                    className="bg-blue-500 text-white px-4 py-2"
                    onClick={() => fetchProducts(search)}
                > Tìm kiếm </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {products.map((p, index) => (
                    <Link to={`/products/${p.id}`} key={index} className="border p-4 hover:shadow-lg">
                        <h2 className="font-bold">{p.name}</h2>
                        <p className="text-green-600">{p.price} VNĐ</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductCatalog;