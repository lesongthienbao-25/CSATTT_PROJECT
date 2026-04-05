import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
    const { id } = useParams();
    const [reviews, setReviews] = useState([
  { id: 1, user: "Hacker UEH", content: "<img src=x onerror=\"alert('XSS_Success_UEH')\">" },
  { id: 2, user: "Trung", content: "Sản phẩm xịn lắm nha mọi người!" }
]);
    const [newReview, setNewReview] = useState({ author: '', content: '', rating: 5 });

    const fetchReviews = async () => {
        const res = await fetch(`http://localhost:8000/api/products/reviews/${id}`);
        const data = await res.json();
        setReviews(data);
    };

    const submitReview = async () => {
        // Gửi review lên - lỗ hổng Stored XSS nằm ở đây vì không sanitize [cite: 219, 221]
        await fetch(`http://localhost:8000/api/products/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: id, ...newReview })
        });
        fetchReviews();
    };

    useEffect(() => { fetchReviews(); }, [id]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Chi tiết sản phẩm #{id}</h1>
            
            <div className="mt-8 border-t pt-4">
                <h3 className="text-xl mb-4">Đánh giá khách hàng</h3>
                {reviews.map((r, i) => (
                    <div key={i} className="mb-4 p-2 bg-gray-100">
                        <p className="font-semibold">{r.author} ({r.rating} ⭐)</p>
                        {/* CỰC KỲ QUAN TRỌNG: Render innerHTML để kích hoạt XSS  */}
                        <div dangerouslySetInnerHTML={{ __html: r.content }} />
                    </div>
                ))}

                <div className="mt-6 p-4 border flex flex-col gap-2">
                    <input type="text" placeholder="Tên của bạn" className="border p-2 text-black" 
                           onChange={e => setNewReview({...newReview, author: e.target.value})} />
                    <textarea placeholder="Nội dung đánh giá (thử nhập <script> vào đây)" className="border p-2 text-black"
                           onChange={e => setNewReview({...newReview, content: e.target.value})} />
                    <button onClick={submitReview} className="bg-green-500 text-white p-2">Gửi đánh giá</button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;