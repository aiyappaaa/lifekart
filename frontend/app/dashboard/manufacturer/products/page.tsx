'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import AddProductModal from './AddProductModal'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await apiClient('/portal/manufacturer/products?limit=50')
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await apiClient(`/portal/manufacturer/products/${productToDelete}`, { method: 'DELETE' })
      toast.success('Product discontinued successfully.')
      fetchProducts()
    } catch (err) {
      toast.error('Failed to discontinue product.')
    } finally {
      setProductToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter">Products</h1>
        <button 
          onClick={() => {
            setEditingProduct(null)
            setIsModalOpen(true)
          }}
          className="bg-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition-colors"
        >
          + New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 font-semibold">You have no products yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted text-gray-500 uppercase text-xs font-bold">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price (₹)</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono truncate max-w-[100px]" title={p.category_id}>{p.category_id}</td>
                    <td className="px-4 py-3">₹{p.unit_price_wholesale}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock_quantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <button 
                        onClick={() => {
                          setEditingProduct(p)
                          setIsModalOpen(true)
                        }}
                        className="text-accent hover:text-black font-semibold text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(p.id)}
                        className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors"
                      >
                        Discontinue
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }} 
        onSuccess={fetchProducts}
        productToEdit={editingProduct} 
      />

      {/* Custom Discontinue Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-display font-extrabold tracking-tight mb-2 text-red-600">Discontinue Product?</h2>
            <p className="text-gray-600 mb-6">
              Are you absolutely sure you want to permanently discontinue this product? 
              <br/><br/>
              <strong>Warning:</strong> This will trigger the Celery background worker to automatically run permanent substitutions for all active 60-year agreements tied to this product.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 font-bold text-gray-500 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Yes, Discontinue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}