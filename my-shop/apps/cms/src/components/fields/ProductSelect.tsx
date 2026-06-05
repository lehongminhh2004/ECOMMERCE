'use client'

import React, { useState, useEffect } from 'react'
import { useField } from '@payloadcms/ui'

interface ProductSelectProps {
  path: string
  field: {
    label?: string
    required?: boolean
  }
}

export const ProductSelect: React.FC<ProductSelectProps> = ({ path, field }) => {
  const { value, setValue } = useField<string>({ path })
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  // Fetch product detail for current saved value to show its name
  useEffect(() => {
    if (value) {
      fetch('http://localhost:3000/shop-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'vendure-token': '__default_channel__'
        },
        body: JSON.stringify({
          query: `
            query GetProduct($id: ID!) {
              product(id: $id) {
                id
                name
              }
            }
          `,
          variables: { id: value }
        })
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.data?.product) {
            setSelectedProduct(result.data.product)
          }
        })
        .catch((err) => console.error('Error fetching selected Vendure product:', err))
    } else {
      setSelectedProduct(null)
    }
  }, [value])

  // Fetch list of products based on search term
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:3000/shop-api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'vendure-token': '__default_channel__'
          },
          body: JSON.stringify({
            query: `
              query GetProducts($options: ProductListOptions) {
                products(options: $options) {
                  items {
                    id
                    name
                  }
                }
              }
            `,
            variables: {
              options: {
                filter: {
                  name: {
                    contains: search
                  }
                },
                take: 10
              }
            }
          })
        })
        const result = await response.json()
        setProducts(result.data?.products?.items || [])
      } catch (err) {
        console.error('Error fetching Vendure products list:', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timer)
  }, [search])

  const selectOptions = [...products]
  if (selectedProduct && !selectOptions.some((p) => p.id === selectedProduct.id)) {
    selectOptions.unshift(selectedProduct)
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>
        {field.label || 'Vendure Product'} {field.required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          type="text"
          placeholder="Type to search Vendure products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 14px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '100%',
            outline: 'none',
            backgroundColor: 'var(--theme-bg-input, #fff)',
            color: 'var(--theme-text, #000)'
          }}
        />
        {loading ? (
          <div style={{ fontSize: '12px', color: '#888' }}>Searching...</div>
        ) : (
          <select
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            style={{
              padding: '10px 14px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              backgroundColor: 'var(--theme-bg-input, #fff)',
              color: 'var(--theme-text, #000)'
            }}
          >
            <option value="">-- Choose product --</option>
            {selectOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (ID: {p.id})
              </option>
            ))}
          </select>
        )}
        {selectedProduct && (
          <div style={{ fontSize: '12px', color: '#00aa66', marginTop: '4px' }}>
            Selected: <strong>{selectedProduct.name}</strong> (ID: {selectedProduct.id})
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductSelect

