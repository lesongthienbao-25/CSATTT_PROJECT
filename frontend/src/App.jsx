import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProductCatalog from './pages/ProductCatalog'
import ProductDetail from './pages/ProductDetail'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App