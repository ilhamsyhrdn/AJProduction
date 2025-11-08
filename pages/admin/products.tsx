// pages/admin/products.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  Search,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card';
import { safeFetch } from '../../src/utils/safeFetch';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  image?: string;
  images?: string[];
}

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: '',
    stock: 0,
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'link'>('upload');

  // useEffect moved below fetchProducts definition to avoid temporal dead zone

  const fetchProducts = useCallback(async () => {
    try {
      const session = localStorage.getItem('adminSession');
      if (!session) {
        router.push('/admin/login');
        return;
      }
      const adminData = JSON.parse(session);

      const result = await safeFetch<Product[]>('/api/admin/products?limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminData.email,
          'x-admin-role': adminData.role
        },
        onUnauthorized: () => {
          toast.error('Sesi admin berakhir, silakan login kembali');
          localStorage.removeItem('adminSession');
          router.push('/admin/login');
        },
        nonJsonMessage: 'Server mengirim format tidak dikenal saat memuat produk'
      });

      if (!result.success) throw new Error(result.message || 'Gagal memuat produk');
      setProducts(result.data || []);
      setLoading(false);
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching products:', err);
      toast.error(err.message || 'Gagal memuat produk');
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    fetchProducts();
  }, [router, fetchProducts]);

  const handleEdit = (product: Product) => {
    console.log('Editing product:', product);
    setSelectedProduct(product);
    const productWithImages = product as unknown as { images?: string[] };
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description,
      image: productWithImages?.images?.[0] || product.image || ''
    });
    setImagePreview((productWithImages?.images?.[0] || product.image) ?? null);
    setShowEditModal(true);
    console.log('Edit modal should now be visible');
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      const session = localStorage.getItem('adminSession');
      if (!session) return;

      const adminData = JSON.parse(session);

      const delResult = await safeFetch(`/api/admin/products/${selectedProduct._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminData.email,
          'x-admin-role': adminData.role
        },
        onUnauthorized: () => {
          toast.error('Sesi admin berakhir, silakan login kembali');
          localStorage.removeItem('adminSession');
          router.push('/admin/login');
        },
        nonJsonMessage: 'Server mengirim format tidak dikenal saat delete'
      });

      if (!delResult.success) throw new Error(delResult.message || 'Failed to delete product');

      toast.success('Produk berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Gagal menghapus produk');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const session = localStorage.getItem('adminSession');
      if (!session) {
        toast.error('Session expired. Please login again.');
        router.push('/admin/login');
        return;
      }

      const adminData = JSON.parse(session);

      console.log('Updating product:', selectedProduct._id, formData);

      const result = await safeFetch(`/api/admin/products/${selectedProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminData.email,
          'x-admin-role': adminData.role
        },
        body: JSON.stringify(formData),
        onUnauthorized: () => {
          toast.error('Sesi admin berakhir, silakan login kembali');
          localStorage.removeItem('adminSession');
          router.push('/admin/login');
        },
        nonJsonMessage: 'Server mengirim format tidak dikenal saat update'
      });

      console.log('Update result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to update product');
      }

      toast.success('Produk berhasil diupdate');
      setShowEditModal(false);
      setSelectedProduct(null);
      setFormData({
        name: '',
        price: 0,
        category: '',
        stock: 0,
        description: '',
        image: ''
      });
      setImagePreview(null);
      fetchProducts();
    } catch (error) {
      const err = error as Error;
      console.error('Error updating product:', err);
      toast.error(err.message || 'Gagal mengupdate produk');
    }
  };

  // Helpers for image handling
  const normalizeDriveLink = (url: string): string => {
    try {
      if (!url) return '';
      const u = new URL(url);
      if (u.hostname.includes('drive.google.com')) {
        const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const id = fileIdMatch?.[1] || u.searchParams.get('id');
        if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast.success('Logout berhasil');
    router.push('/admin/login');
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Logo and Logout */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AJ Production</h1>
              <p className="text-sm text-gray-500 mt-0.5">Admin Dashboard - Products</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Navigation Horizontal */}
          <nav className="flex items-center gap-4 overflow-x-auto pb-2">
            <Link href="/admin/dashboard">
              <div className="w-44 h-11 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-sm hover:bg-black hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 px-4">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </div>
            </Link>

            <Link href="/admin/orders">
              <div className="w-44 h-11 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-sm hover:bg-black hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 px-4">
                <ShoppingCart className="h-5 w-5" />
                <span>Orders</span>
              </div>
            </Link>

            <Link href="/admin/products">
              <div className="w-44 h-11 bg-black text-white border-2 border-black font-semibold rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 px-4">
                <Package className="h-5 w-5" />
                <span>Products</span>
              </div>
            </Link>

            <Link href="/admin/messages">
              <div className="w-44 h-11 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-sm hover:bg-black hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 px-4">
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
              </div>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content - Spacing to prevent overlap with sticky header */}
      <main className="max-w-7xl mx-auto px-6 py-8" style={{ marginTop: '0' }}>
        {/* Header Section */}
        <div className="mb-8 pt-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Products Management</h2>
              <p className="text-gray-500 mt-1">Manage your product inventory</p>
            </div>
            <Link href="/admin/products/add">
              <button className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 border-2 border-black">
                <Plus className="h-5 w-5 stroke-[2.5]" />
                <span className="text-base">Add New Product</span>
              </button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-3.5 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-all text-base text-gray-900 placeholder:text-gray-500"
              style={{ paddingLeft: '3.5rem' }}
            />
          </div>
        </div>

        {/* Products Table */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <CardTitle className="text-xl font-bold">All Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Product Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Stock</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.stock > 0 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock} pcs
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3 py-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleEdit(product);
                              }}
                              className="text-sm font-semibold border flex items-center justify-center gap-2"
                              type="button"
                              aria-label={`Edit ${product.name}`}
                              style={{
                                backgroundColor: '#000000',
                                color: '#ffffff',
                                borderColor: '#000000',
                                padding: '10px 20px',
                                minHeight: '40px',
                                borderRadius: '8px',
                                width: '120px',
                                marginTop: '2px',
                                marginBottom: '2px'
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#111827';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000';
                              }}
                            >
                              <Edit className="h-4 w-4" style={{ color: '#ffffff' }} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(product);
                              }}
                              className="text-sm font-semibold border flex items-center justify-center gap-2"
                              type="button"
                              aria-label={`Delete ${product.name}`}
                              style={{
                                backgroundColor: '#000000',
                                color: '#ffffff',
                                borderColor: '#000000',
                                padding: '10px 20px',
                                minHeight: '40px',
                                borderRadius: '8px',
                                width: '120px',
                                marginTop: '2px',
                                marginBottom: '2px'
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#111827';
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000';
                              }}
                            >
                              <Trash2 className="h-4 w-4" style={{ color: '#ffffff' }} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Edit Product</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="px-8 pt-6 pb-8 space-y-5">
              <div className="max-w-md">
                <label className="block text-sm font-bold text-gray-900 mb-2">Product Name</label>
                <div className="bg-gray-50 p-3">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama produk"
                    className="w-full px-4 py-3 border-2 border-black rounded-none focus:border-blue-600 focus:outline-none text-gray-900 font-medium bg-white"
                    style={{ borderColor: '#000000' }}
                    required
                  />
                </div>
              </div>
              <div className="max-w-md">
                <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
                <div className="bg-gray-50 p-3">
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Masukkan kategori"
                    className="w-full px-4 py-3 border-2 border-black rounded-none focus:border-blue-600 focus:outline-none text-gray-900 font-medium bg-white"
                    style={{ borderColor: '#000000' }}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-xl">
                <div className="max-w-[220px]">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Price (IDR)</label>
                  <div className="bg-gray-50 p-3">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-black rounded-none focus:border-blue-600 focus:outline-none text-gray-900 font-medium bg-white"
                      style={{ borderColor: '#000000' }}
                      required
                    />
                  </div>
                </div>
                <div className="max-w-[220px]">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Stock</label>
                  <div className="bg-gray-50 p-3">
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-black rounded-none focus:border-blue-600 focus:outline-none text-gray-900 font-medium bg-white"
                      style={{ borderColor: '#000000' }}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="max-w-xl">
                <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                <div className="bg-gray-50 p-3">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Deskripsi produk"
                    className="w-full px-4 py-3 border-2 border-black rounded-none focus:border-blue-600 focus:outline-none text-gray-900 font-medium bg-white"
                    style={{ borderColor: '#000000' }}
                    required
                  />
                </div>
              </div>
              {/* Image Editor */}
              <div className="max-w-xl">
                <label className="block text-sm font-bold text-gray-900 mb-2">Product Image</label>
                <div className="flex gap-5 items-start">
                  <div className="w-40 h-40 border-2 border-black bg-gray-50 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">No Image</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`w-28 px-3 py-2 border-2 rounded-none font-semibold ${imageMode==='upload' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                      >Upload</button>
                      <button
                        type="button"
                        onClick={() => setImageMode('link')}
                        className={`w-28 px-3 py-2 border-2 rounded-none font-semibold ${imageMode==='link' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                      >Link</button>
                    </div>
                    {imageMode === 'upload' ? (
                      <div>
                        <input id="edit-image-file" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        <label htmlFor="edit-image-file" className="inline-flex items-center justify-center w-28 px-4 py-2 bg-black text-white border-2 border-black rounded-none cursor-pointer">Pilih File</label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Tempel link gambar..."
                          value={formData.image || ''}
                          onChange={(e) => {
                            const url = normalizeDriveLink(e.target.value);
                            setFormData((prev) => ({ ...prev, image: url }));
                            setImagePreview(url);
                          }}
                          className="w-[320px] px-3 py-2 border-2 border-black rounded-none bg-white text-gray-900"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-600">Disarankan: JPG/PNG ≤ 1MB, ukuran 800×800px, rasio 1:1.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-200 pt-6 pb-6 px-8">
                <div className="mx-auto max-w-md grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="min-h-[44px] px-5 py-3 bg-black text-white font-bold rounded-none border-2 border-black hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-none border-2 border-black transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 border border-red-200">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold text-red-600">&ldquo;{selectedProduct.name}&rdquo;</span>? This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 font-semibold border flex items-center justify-center gap-2"
                aria-label={`Confirm delete ${selectedProduct.name}`}
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  borderColor: '#000000',
                  padding: '10px 20px',
                  minHeight: '44px',
                  borderRadius: '8px'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#111827';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000';
                }}
              >
                <Trash2 className="h-4 w-4" style={{ color: '#ffffff' }} />
                <span>Yes, delete</span>
              </button>
              <div
                role="button"
                tabIndex={0}
                aria-label="Cancel delete"
                onClick={() => setShowDeleteModal(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowDeleteModal(false);
                  }
                }}
                className="rounded-md"
                style={{
                  flex: '1 1 0%',
                  padding: '10px 20px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '1px solid #000000',
                  minHeight: '44px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = '#111827';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = '#000000';
                }}
              >
                Cancel
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
