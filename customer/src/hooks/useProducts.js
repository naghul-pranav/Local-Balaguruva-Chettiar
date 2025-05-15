import { useState, useEffect, useMemo } from 'react';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5008/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const isProductNew = (createdAt) => {
    if (!createdAt || createdAt === '' || createdAt === null) return false;
    
    try {
      const productDate = new Date(createdAt);
      if (isNaN(productDate.getTime())) return false;
      
      const now = new Date();
      const diffTime = Math.abs(now - productDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 6;
    } catch (error) {
      return false;
    }
  };

  // Extract color from product name
  const extractColorFromName = (name) => {
    if (!name) return null;
    
    // Remove the prefix like "30(s)" or "2/20(s)" and "Yarn" suffix
    let colorPart = name.replace(/^\d+(\(\w+\)|\/)?\d*\(\w+\)\s*/, '').replace(/\s*Yarn$/, '');
    
    // Handle special notation with underscore
    if (colorPart.includes('_')) {
      // Convert underscore notation to proper color names
      colorPart = colorPart.split('_').join(' ');
    }
    
    // Return the cleaned color part if it's not empty
    return colorPart.trim() || null;
  };

  const availableColors = useMemo(() => {
    console.log('Products data for color extraction:', products);
    
    // Extract colors from product names
    const colors = products
      .map(product => extractColorFromName(product.name))
      .filter(Boolean);
    
    console.log('Extracted colors from names:', colors);
    
    // If no colors extracted, provide default yarn colors
    if (colors.length === 0) {
      return [
        'Red', 'Blue', 'Green', 'Yellow', 'Purple', 
        'Pink', 'Orange', 'Brown', 'Black', 'White', 
        'Gray', 'Beige'
      ];
    }
    
    // Return unique colors
    return [...new Set(colors)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    result = result.map(product => ({
      ...product,
      isNew: product.createdAt ? isProductNew(product.createdAt) : false,
      extractedColor: extractColorFromName(product.name),
      discountedPrice: product.discountedPrice ?? product.price ?? 0 // fallback for old data
    }));

    if (searchTerm) {
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedColors.length > 0) {
      result = result.filter(product => {
        const productName = product.name.toLowerCase();
        // Check if any selected color appears in the product name
        return selectedColors.some(color => 
          productName.includes(color.toLowerCase()) ||
          (product.extractedColor && product.extractedColor.toLowerCase().includes(color.toLowerCase()))
        );
      });
    }

    result.sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;

      switch (sortBy) {
        case 'price-asc':
          return a.discountedPrice - b.discountedPrice;
        case 'price-desc':
          return b.discountedPrice - a.discountedPrice;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [products, searchTerm, sortBy, selectedColors]);

  return {
    products: filteredProducts,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    loading,
    error,
    selectedColors,
    setSelectedColors,
    availableColors
  };
};

export default useProducts;