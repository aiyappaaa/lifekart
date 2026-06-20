'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { X } from 'lucide-react'

export default function AddProductModal({ isOpen, onClose, onSuccess, productToEdit }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, productToEdit?: any }) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    unit_size: '',
    unit_price_wholesale: '',
    unit_price_retail: '',
    min_order_quantity: '1',
    stock_quantity: '0',
    image_url: '',
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      if (productToEdit) {
        setFormData({
          name: productToEdit.name || '',
          sku: productToEdit.sku || '',
          category_id: productToEdit.category_id || '',
          unit_size: productToEdit.unit_size || '',
          unit_price_wholesale: productToEdit.unit_price_wholesale?.toString() || '',
          unit_price_retail: productToEdit.unit_price_retail?.toString() || '',
          min_order_quantity: productToEdit.min_order_quantity?.toString() || '1',
          stock_quantity: productToEdit.stock_quantity?.toString() || '0',
          image_url: productToEdit.image_url || '',
        })
      } else {
        setFormData({
          name: '',
          sku: '',
          category_id: '',
          unit_size: '',
          unit_price_wholesale: '',
          unit_price_retail: '',
          min_order_quantity: '1',
          stock_quantity: '0',
          image_url: '',
        })
      }
    }
  }, [isOpen, productToEdit])

  const fetchCategories = async () => {
    try {
      const data = await apiClient('/catalog/categories?limit=100')
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load categories', err)
      toast.error('Failed to load categories')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clean payload
    const payload = {
      name: formData.name,
      sku: formData.sku,
      category_id: formData.category_id,
      unit_size: formData.unit_size || undefined,
      unit_price_wholesale: parseFloat(formData.unit_price_wholesale),
      unit_price_retail: parseFloat(formData.unit_price_retail),
      min_order_quantity: parseFloat(formData.min_order_quantity) || 1,
      stock_quantity: parseFloat(formData.stock_quantity) || 0,
      image_url: formData.image_url || undefined,
    }

    try {
      setLoading(true)
      if (productToEdit) {
        await apiClient(`/portal/manufacturer/products/${productToEdit.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        toast.success('Product updated successfully!')
      } else {
        await apiClient('/portal/manufacturer/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        toast.success('Product added successfully!')
      }
      onSuccess()
      onClose()
    } catch (err) {
      const rawError = err instanceof Error ? err.message : String(err)
      toast.error(`Failed to add product: ${rawError}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-display font-extrabold tracking-tight">
            {productToEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 flex-1">
          <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Product Name *</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                  placeholder="e.g. Premium Aluminium Foil"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">SKU *</label>
                <input 
                  type="text" name="sku" value={formData.sku} onChange={handleChange} required
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                  placeholder="e.g. FOIL-PREM-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Category *</label>
                <select 
                  name="category_id" value={formData.category_id} onChange={handleChange} required
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0 bg-white"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Wholesale Price (₹) *</label>
                <input 
                  type="number" step="0.01" min="0" name="unit_price_wholesale" value={formData.unit_price_wholesale} onChange={handleChange} required
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Retail Price / MRP (₹) *</label>
                <input 
                  type="number" step="0.01" min="0" name="unit_price_retail" value={formData.unit_price_retail} onChange={handleChange} required
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Unit Size</label>
                <select 
                  name="unit_size" value={formData.unit_size} onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0 bg-white"
                >
                  <option value="" disabled>Select a unit size</option>
                  <option value="piece">piece</option>
                  <option value="pack">pack</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="liter">liter</option>
                  <option value="ml">ml</option>
                  <option value="pair">pair</option>
                  <option value="dozen">dozen</option>
                  <option value="box">box</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Image URL</label>
                <input 
                  type="url" name="image_url" value={formData.image_url} onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Current Stock *</label>
                <input 
                  type="number" min="0" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Min Order Qty (MOQ) *</label>
                <input 
                  type="number" min="1" name="min_order_quantity" value={formData.min_order_quantity} onChange={handleChange} required
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-accent focus:ring-0" 
                />
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="add-product-form"
            disabled={loading}
            className="px-6 py-2 bg-accent text-white font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : (productToEdit ? 'Save Changes' : 'Add Product')}
          </button>
        </div>
      </div>
    </div>
  )
}
