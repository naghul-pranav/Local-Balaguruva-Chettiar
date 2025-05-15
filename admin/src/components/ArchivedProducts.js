import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

const ArchivedProducts = () => {
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/deleted-products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setArchivedProducts(data.products);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching deleted products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Archived Products</h2>
        {loading ? (
          <p>Loading...</p>
        ) : archivedProducts.length === 0 ? (
          <p>No deleted products found.</p>
        ) : (
          <table className="w-full text-sm text-left text-gray-700 bg-white shadow rounded-lg">
            <thead className="text-xs uppercase bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">MRP</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Final Price</th>
                <th className="px-4 py-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {archivedProducts.map((product) => (
                <tr key={product._id} className="border-b">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">₹{product.mrp}</td>
                  <td className="px-4 py-3">{product.discount}%</td>
                  <td className="px-4 py-3">₹{product.discountedPrice}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ArchivedProducts;
