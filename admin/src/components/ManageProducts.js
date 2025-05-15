import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Plus, DollarSign, Tag, Box, X, RotateCcw, Loader2 } from "lucide-react"; // Add Loader2

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [viewMode, setViewMode] = useState("active"); // 'active' or 'archived'
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [productToRestore, setProductToRestore] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Add loading state for delete
  const [isRestoring, setIsRestoring] = useState(false); // Add loading state for restore
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    if (viewMode === "archived") {
      fetchArchivedProducts();
    }
  }, [viewMode]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products");
    }
  };

  const fetchArchivedProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/deleted-products");
      if (!res.ok) throw new Error("Failed to fetch archived products");
      const data = await res.json();
      if (data.success) {
        setArchivedProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching archived products:", error);
      alert("Failed to fetch archived products");
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      mrp: product.mrp,
      discount: product.discount,
      discountedPrice: product.discountedPrice,
      category: product.category,
      stock: product.stock,
      image: product.image,
    });
    setPreviewImage(product.image);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.length) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
          _imageFile: files[0],
        }));
      };
      reader.readAsDataURL(files[0]);
    } else if (name === "mrp" || name === "discount") {
      const newMRP = name === "mrp" ? value : formData.mrp;
      const newDiscount = name === "discount" ? value : formData.discount;
      const discounted = newMRP && newDiscount
        ? (newMRP - (newMRP * newDiscount / 100)).toFixed(2)
        : "";
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        discountedPrice: discounted,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    for (const key in formData) {
      if (key !== "image" && key !== "_imageFile") {
        form.append(key, formData[key]);
      }
    }
    if (formData._imageFile) {
      form.append("image", formData._imageFile);
    } else if (formData.image && formData.image.startsWith("data:image")) {
      const base64String = formData.image.split(",")[1];
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      form.append("image", blob, "product-image.png");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/products/${editingProduct}`, {
        method: "PUT",
        body: form,
      });

      if (res.ok) {
        await fetchProducts();
        setEditingProduct(null);
        setFormData({});
        setPreviewImage(null);
      } else {
        const errorData = await res.json();
        alert(`Failed to update product: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true); // Set loading state to true
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchProducts();
        if (viewMode === "archived") {
          await fetchArchivedProducts();
        }
      } else {
        const errorData = await res.json();
        alert(`Failed to delete product: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setIsDeleting(false); // Reset loading state
      setShowConfirmModal(false);
      setProductToDelete(null);
    }
  };

  const handleRestoreClick = (product) => {
    setProductToRestore(product);
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    setIsRestoring(true); // Set loading state to true
    try {
      const res = await fetch(`http://localhost:5000/api/products/restore/${productToRestore._id}`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchProducts();
        await fetchArchivedProducts();
      } else {
        const errorData = await res.json();
        alert(`Failed to restore product: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error restoring product:", error);
      alert("Failed to restore product");
    } finally {
      setIsRestoring(false); // Reset loading state
      setShowRestoreModal(false);
      setProductToRestore(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("active")}
                className={`px-4 py-2 rounded-md ${
                  viewMode === "active"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800"
                } hover:bg-indigo-700 hover:text-white`}
              >
                Active Products
              </button>
              <button
                onClick={() => setViewMode("archived")}
                className={`px-4 py-2 rounded-md ${
                  viewMode === "archived"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800"
                } hover:bg-indigo-700 hover:text-white`}
              >
                Archived Products
              </button>
            </div>
            {viewMode === "active" && (
              <button
                onClick={() => navigate("/add-product")}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                <Plus size={18} /> Add Product
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 bg-white shadow rounded-lg">
            <thead className="text-xs uppercase bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">MRP</th>
                <th className="px-4 py-3">Discount %</th>
                <th className="px-4 py-3">Final Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(viewMode === "active" ? products : archivedProducts).map((product) => (
                <tr key={product._id} className="border-b">
                  <td className="px-4 py-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.mrp}</td>
                  <td className="px-4 py-3">{product.discount}%</td>
                  <td className="px-4 py-3">{product.discountedPrice}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 space-x-3">
                    {viewMode === "active" ? (
                      <>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-blue-600 hover:underline"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product._id)}
                          className="text-red-600 hover:underline"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestoreClick(product)}
                        className="text-green-600 hover:underline"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
              <button
                onClick={() => setEditingProduct(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Product</h3>
              <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Product Name:</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                    className="input w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Product Description:</label>
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                    required
                    className="input w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">MRP:</label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleChange}
                    placeholder="MRP"
                    required
                    className="input w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Discount:</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="Discount (%)"
                    required
                    className="input w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Discounted Price:</label>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    readOnly
                    className="input w-full p-2 border border-gray-100 bg-gray-100 rounded-md"
                    placeholder="Discounted Price"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Stock:</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="Stock"
                    required
                    className="input w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Category:</label>
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Category"
                    required
                    className="input w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Product Image:</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                    className="input w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {previewImage && typeof previewImage === "string" && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
                    <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
                <div className="col-span-2 flex justify-end gap-4 mt-4">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this product? This action will archive the product.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                  disabled={isDeleting} // Disable Cancel button while deleting
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    isDeleting
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                  disabled={isDeleting} // Disable Delete button while deleting
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restore Confirmation Modal */}
        {showRestoreModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Restore</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to restore this product? It will be moved back to active products.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                  disabled={isRestoring} // Disable Cancel button while restoring
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRestore}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    isRestoring
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                  disabled={isRestoring} // Disable Restore button while restoring
                >
                  {isRestoring ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Restoring...
                    </>
                  ) : (
                    "Restore"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageProducts;