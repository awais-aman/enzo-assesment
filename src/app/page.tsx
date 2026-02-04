'use client'

import { useEffect, useState, useRef } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilters } from '@/components/ProductFilters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Product, FilterOptions } from '@/types/product'
import { getProducts } from '@/lib/api'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    inStock: undefined,
  })

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initial load - fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await getProducts()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Debounced filter effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Don't debounce on initial load
    if (loading) return

    // Set filtering state immediately for UI feedback
    setIsFiltering(true)

    // Debounce the API call by 300ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const data = await getProducts(filters)
        setFilteredProducts(data)
      } catch (error) {
        console.error('Error filtering products:', error)
      } finally {
        setIsFiltering(false)
      }
    }, 300)

    // Cleanup on unmount or filter change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [filters, loading])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Product Inventory</h2>
        <div className="text-sm text-gray-500">
          Showing {filteredProducts.length} of {products.length} products
          {isFiltering && (
            <span className="ml-2 text-primary-600 animate-pulse">
              • Filtering...
            </span>
          )}
        </div>
      </div>
      
      <ProductFilters filters={filters} onFiltersChange={setFilters} />
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}