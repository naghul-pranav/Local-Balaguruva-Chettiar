import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import { Plus, Tag, DollarSign, Package, FileText, Upload, Loader, Check } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [formData, setFormData] = useState({
  name: "",
  description: "",
  mrp: "",
  discount: "",
  discountedPrice: "",
  category: "",
  stock: "",
  image: null,
});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showSuccess && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showSuccess]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("description", formData.description);
    form.append("mrp", formData.mrp);
    form.append("discount", formData.discount);
    form.append("discountedPrice", formData.discountedPrice);
    form.append("category", formData.category);
    form.append("stock", formData.stock);
    if (formData.image) {
      form.append("image", formData.image);
    }

    const response = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add product");
    }

    setShowSuccess(true);
    resetForm();

    setTimeout(() => {
      setShowSuccess(false);
      navigate("/manage-products");
    }, 2000);
  } catch (error) {
    console.error("Error adding product:", error);
    alert("Error adding product: " + error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleChange = (e) => {
  const { name, value, files } = e.target;
  if (name === "image" && files?.length) {
    setFormData((prev) => ({ ...prev, image: files[0] }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      mrp: "",
      discount: "",
      discountedPrice: "",
      stock: "",
      image: null,
    });
    setPreviewImage(null);
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
  };

  return (
    <>
      <Navbar />
      <div ref={scrollRef} className="pt-6 min-h-screen max-h-screen overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 pb-32">
          {showSuccess && (
            <div className="bg-green-50 text-green-600 p-4 mb-6 rounded-lg flex items-center shadow-md animate-fadeIn">
              <Check size={24} className="mr-2 text-green-500" />
              <span className="font-medium">Product Added Successfully!</span>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
            <Plus className="mr-2" size={28} />
            Add New Product
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-medium">
                    <Tag size={16} className="mr-2 text-gray-500" />
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-medium">
                    <FileText size={16} className="mr-2 text-gray-500" />
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
  <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Product Details</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="flex items-center text-gray-700 font-medium">
        <DollarSign size={16} className="mr-2 text-gray-500" />
        MRP (₹)
      </label>
      <input
        type="number"
        name="mrp"
        value={formData.mrp}
        onChange={handleChange}
        placeholder="Enter MRP"
        min="0"
        required
        className="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>
    <div className="space-y-2">
      <label className="flex items-center text-gray-700 font-medium">
        <Tag size={16} className="mr-2 text-gray-500" />
        Discount Rate (%)
      </label>
      <input
        type="number"
        name="discount"
        value={formData.discount}
        onChange={handleChange}
        placeholder="e.g. 10"
        min="0"
        max="100"
        required
        className="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>
    <div className="space-y-2">
      <label className="flex items-center text-gray-700 font-medium">
        <DollarSign size={16} className="mr-2 text-gray-500" />
        Discounted Price (₹)
      </label>
      <input
        type="number"
        name="discountedPrice"
        value={formData.discountedPrice}
        readOnly
        className="w-full p-2 border border-gray-100 bg-gray-100 text-gray-700 rounded-md"
      />
    </div>
    <div className="space-y-2">
      <label className="flex items-center text-gray-700 font-medium">
        <Package size={16} className="mr-2 text-gray-500" />
        Stock
      </label>
      <input
        type="number"
        name="stock"
        value={formData.stock}
        onChange={handleChange}
        min="0"
        required
        className="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>
    <div className="space-y-2">
      <label className="flex items-center text-gray-700 font-medium">
        <FileText size={16} className="mr-2 text-gray-500" />
        Category
      </label>
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="">Select Category</option>
        <option value="Bronze">Bronze</option>
        <option value="Brass">Brass</option>
        <option value="Aluminium">Aluminium</option>
        <option value="Copper">Copper</option>
        <option value="Stainless Steel">Stainless Steel</option>
        <option value="Cast Iron">Cast Iron</option>
        <option value="Non-Stick">Non-Stick</option>
        <option value="Ceramic">Ceramic</option>
        <option value="Others">Others</option>
      </select>
    </div>
  </div>
</div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Product Image</h3>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <Upload size={24} className="mb-1 text-gray-500" />
                    <span className="text-sm text-gray-500">Click to upload or drag image here</span>
                    <input
                      type="file"
                      id="image-upload"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      required
                      className="hidden"
                    />
                  </label>
                </div>
                {previewImage && (
                  <div className="w-full">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Image Preview</h4>
                    <div className="border rounded-lg overflow-hidden h-32 bg-gray-100">
                      <img src={previewImage} alt="Product preview" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddProduct;