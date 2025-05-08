import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useGetproductsQuery, useAddproductMutation, useUpdateproductMutation, useDeleteproductMutation } from "../../api/Adminapi";

const Productlist = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        status: "",
        category: "",
        images: Array(4).fill(null),
        imagePreviews: Array(4).fill(null),
    });

    // Use RTK Query hook to fetch products
    const { data: productsData, error, isLoading, refetch } = useGetproductsQuery();
    const [addProduct] = useAddproductMutation();
    const [deleteproduct] = useDeleteproductMutation();
    const [updateproduct] = useUpdateproductMutation();
    
    // Update categories when products data changes
    useEffect(() => {
        if (productsData?.categories) {
            setCategories(productsData.categories);
        }
    }, [productsData]);

    // Pagination settings
    const itemsPerPage = 4;
    const products = productsData?.products || [];
    const totalPages = Math.ceil(products.length / itemsPerPage);
    
    // Get current products based on pagination
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    // Pagination controls
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Status styling functions
    const getStatusStyle = (status) => {
        switch (status) {
            case 'in_stock':
                return 'bg-green-100 text-green-700';
            case 'out_of_stock':
                return 'bg-red-100 text-red-700';
            case 'new_arrival':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'in_stock':
                return 'In Stock';
            case 'out_of_stock':
                return 'Out of Stock';
            case 'new_arrival':
                return 'New Arrival';
            default:
                return 'Unknown';
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                status: product.status,
                category: product.category[0], 
                images: product.image || Array(4).fill(null), 
                imagePreviews: product.image || Array(4).fill(null), 
            });
            setEditingProductId(product._id);
        } else {
            setFormData({
                name: "",
                description: "",
                price: "",
                status: "in_stock",
                category: "",
                images: Array(4).fill(null),
                imagePreviews: Array(4).fill(null)
            });
            setEditingProductId(null);
        }
        setModalOpen(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (index, event) => {
        const file = event.target.files[0] || null;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImages = [...formData.images];
                const newPreviews = [...formData.imagePreviews];
                newImages[index] = file;
                newPreviews[index] = reader.result;
                setFormData({ ...formData, images: newImages, imagePreviews: newPreviews });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index) => {
        const newImages = [...formData.images];
        const newPreviews = [...formData.imagePreviews];
        newImages[index] = null;
        newPreviews[index] = null;
        setFormData({ ...formData, images: newImages, imagePreviews: newPreviews });
    };

    // Save product function
    const saveProduct = async () => {
        if (!formData.name || !formData.description || !formData.price || !formData.category) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("status", formData.status);
            data.append("category", formData.category);

            // Append only File instances (not image URLs)
            formData.images.forEach((file) => {
                if (file instanceof File) {
                    data.append("images", file);
                }
            });
    
            // Append existing image URLs if any
            const existingImageUrls = formData.images.filter((img) => typeof img === 'string');
            existingImageUrls.forEach((url) => {
                data.append("existingImages", url);
            });
    
            if (editingProductId) {
                await updateproduct({ id: editingProductId, formData: data }).unwrap();
                toast.success("Product updated successfully");
            } else {
                await addProduct(data).unwrap();
                toast.success("Product added successfully");
            }
    
            setModalOpen(false);
            refetch();
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Error saving product");
        }
    };

    const handleDelete = async (productId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteproduct(productId).unwrap();
                    toast.success("Product deleted successfully");
                    
                    // Check if we need to go to previous page after deletion
                    if (currentProducts.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    }
                    
                    refetch();
                } catch (error) {
                    console.error("Error deleting product:", error);
                    toast.error("Failed to delete product");
                }
            }
        });
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading products: {error.message}</div>;

    // Ensure categoriesData exists
    const categoriesData = productsData?.categories || [];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header section */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Product List</h2>
                <button
                    onClick={() => openModal()}
                    className="bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2"
                >
                    <span>+</span> Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">S.NO</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Image</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentProducts.map((product, index) => (
                                <tr key={product._id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">{indexOfFirstProduct + index + 1}</td>
                                    <td className="px-6 py-4">
                                        <img
                                            src={product.image?.[0] || "/api/placeholder/50/50"}
                                            alt="Product"
                                            className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{product.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.description}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {categoriesData.find(cat => cat._id === (product.category?.[0] || product.category))?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">₹.{product.price} /-</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusStyle(product.status)}`}>
                                                {getStatusLabel(product.status)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-4">
                                            <button
                                                onClick={() => openModal(product)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <FaEdit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <FaTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                <div className="flex justify-between items-center p-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                        Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, products.length)} of {products.length} products
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-md flex items-center ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                            <FaChevronLeft size={14} className="mr-1" /> Previous
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded-md text-gray-700">
                            {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-md flex items-center ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                            Next <FaChevronRight size={14} className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800 text-center">
                                {editingProductId ? "Edit Product" : "Add Product"}
                            </h2>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Product Name"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Product Description"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition resize-none"
                                />
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="Product Price"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                />
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                >
                                    <option value="">Select Status</option>
                                    <option value="in_stock">In Stock</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="new_arrival">New Arrival</option>
                                </select>

                                <div className="space-y-4">
                                    {formData.imagePreviews.map((preview, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            {preview && (
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    className="w-20 h-20 object-cover rounded-lg shadow-md border border-gray-200"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleImageChange(index, e)}
                                                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-100 file:text-red-700 hover:file:bg-red-200"
                                                />
                                            </div>
                                            {preview && (
                                                <button
                                                    onClick={() => removeImage(index)}
                                                    className="text-red-600 hover:text-red-800 transition font-medium"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-6 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveProduct}
                                    className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Productlist;