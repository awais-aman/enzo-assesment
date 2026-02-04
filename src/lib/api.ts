import type { Product, CreateProductRequest, UpdateProductRequest, FilterOptions } from '@/types/product'
import type { ApiResponse } from '@/types/api'
import { mockProducts } from '@/data/mockProducts'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getProducts(filters?: FilterOptions): Promise<Product[]> {
  await delay(800) // Simulate slow API
  
  let products = [...mockProducts]
  
  if (filters) {
    // Single-pass filtering for better performance
    products = products.filter(product => {
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false
      }
      
      // Price range filters
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false
      }
      
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false
      }
      
      // Stock availability filter (FIXED: was backwards)
      if (filters.inStock !== undefined) {
        if (filters.inStock && product.stock <= 0) {
          return false // In stock filter should exclude out of stock items
        }
        if (!filters.inStock && product.stock > 0) {
          return false // Out of stock filter should exclude in stock items
        }
      }
      
      return true
    })
  }
  
  return products
}

export async function getProduct(id: string): Promise<Product | null> {
  await delay(300)
  
  const product = mockProducts.find(p => p.id === id)
  return product || null
}

export async function createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
  await delay(500)
  
  // Validate required fields
  if (!data.name || !data.category) {
    throw new Error('Product name and category are required')
  }
  
  if (!data.sku) {
    throw new Error('SKU is required')
  }
  
  // Validate price
  if (data.price < 0 || data.price > 999999 || isNaN(data.price)) {
    throw new Error('Price must be between $0 and $999,999')
  }
  
  // Validate stock
  if (data.stock < 0 || !Number.isInteger(data.stock)) {
    throw new Error('Stock must be a non-negative integer')
  }
  
  const newProduct: Product = {
    id: crypto.randomUUID(), // Use crypto API for better ID generation
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // In a real app, this would persist to a database
  mockProducts.push(newProduct)
  
  return {
    success: true,
    data: newProduct,
    message: 'Product created successfully'
  }
}

export async function updateProduct(data: UpdateProductRequest): Promise<ApiResponse<Product>> {
  await delay(400)
  
  const index = mockProducts.findIndex(p => p.id === data.id)
  
  if (index === -1) {
    throw new Error('Product not found')
  }
  
  // BUG: This doesn't properly merge the updated data
  const updatedProduct = {
    ...mockProducts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  
  mockProducts[index] = updatedProduct
  
  return {
    success: true,
    data: updatedProduct,
    message: 'Product updated successfully'
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse<void>> {
  await delay(300)
  
  const index = mockProducts.findIndex(p => p.id === id)
  
  if (index === -1) {
    throw new Error('Product not found')
  }
  
  mockProducts.splice(index, 1)
  
  return {
    success: true,
    data: undefined,
    message: 'Product deleted successfully'
  }
}