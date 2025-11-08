import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'sonner';
import { ADMIN_ORDER_STATUSES, paymentStatusLabel, renderOrderStatusBadge } from '../../src/constants/orderStatus';
import { safeFetch } from '../../src/utils/safeFetch';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { LayoutDashboard, ShoppingCart, Package, MessageSquare, Search, Filter } from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  paymentMethod?: 'cod' | 'bank_transfer' | 'midtrans';
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    notes?: string;
  };
  totalAmount?: number;
  total?: number;
  subtotal?: number;
  shippingCost?: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  paymentDetails?: {
    paymentProof?: string;
    paymentProofMime?: string;
    paymentProofOriginalName?: string;
    paymentProofUploadedAt?: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // modal and zoom removed per new table-only spec

  // useEffect moved below fetchOrders definition to avoid temporal dead zone

  // Use shared safeFetch utility

  const fetchOrders = useCallback(async () => {
    try {
      const session = localStorage.getItem('adminSession');
      if (!session) return;

      const adminData = JSON.parse(session);

      const result = await safeFetch<Order[]>('/api/admin/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminData.email,
          'x-admin-role': adminData.role,
        },
        onUnauthorized: () => {
          toast.error('Sesi admin berakhir, silakan login kembali');
          localStorage.removeItem('adminSession');
          router.push('/admin/login');
        },
        nonJsonMessage: 'Terjadi gangguan pada server. Coba muat ulang halaman.'
      });

      if (!result.success) throw new Error(result.message || 'Gagal memuat data pesanan');
      setOrders(result.data || []);
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching orders:', err);
      toast.error(err.message || 'Gagal memuat data pesanan');
      // Optional: force logout if unauthorized pattern detected
      if (/unauthorized|401|kadaluarsa/i.test(err.message)) {
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    fetchOrders();
  }, [router, fetchOrders]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast.success('Berhasil logout');
    router.push('/admin/login');
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const session = localStorage.getItem('adminSession');
      if (!session) return;

      const adminData = JSON.parse(session);

      const result = await safeFetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminData.email,
          'x-admin-role': adminData.role
        },
        body: JSON.stringify({ orderStatus: newStatus === 'delivered' ? 'completed' : newStatus }),
        onUnauthorized: () => {
          toast.error('Sesi admin berakhir, silakan login kembali');
          localStorage.removeItem('adminSession');
          router.push('/admin/login');
        },
        nonJsonMessage: 'Terjadi gangguan pada server. Coba lagi.'
      });

      if (!result.success) throw new Error(result.message || 'Gagal mengupdate status pesanan');

      toast.success('Status pesanan berhasil diupdate');
      fetchOrders();
    } catch (error) {
      const err = error as Error;
      console.error('Error updating order:', err);
      toast.error(err.message || 'Gagal mengupdate status pesanan');
      if (/unauthorized|401|kadaluarsa/i.test(err.message)) {
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Normalize order amount from various possible fields
  const getOrderAmount = (order: Order) => {
    const tryNum = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const fromTotalAmount = tryNum(order.totalAmount);
    if (fromTotalAmount) return fromTotalAmount;
    const orderRecord = order as unknown as Record<string, unknown>;
    const fromTotal = tryNum(orderRecord.total);
    if (fromTotal) return fromTotal;
    const itemsSum = Array.isArray(order.items)
      ? order.items.reduce((s, it) => s + tryNum(it.price) * tryNum(it.quantity), 0)
      : 0;
    const subtotal = tryNum(orderRecord.subtotal) || itemsSum;
    const shipping = tryNum(orderRecord.shippingCost);
    return subtotal + shipping;
  };

  // helper to build WhatsApp link
  const formatPhoneForWA = (phone?: string) => {
    if (!phone) return '';
    const digits = phone.replace(/[^0-9+]/g, '');
    if (digits.startsWith('+')) return digits.slice(1);
    if (digits.startsWith('0')) return '62' + digits.slice(1);
    return digits;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50" data-layout-version="orders-table-v3">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Logo and Logout */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AJ Production</h1>
              <p className="text-sm text-gray-500 mt-0.5">Admin Dashboard</p>
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
          <nav className="flex items-center gap-3 overflow-x-auto pb-2">
            <Link href="/admin/dashboard">
              <div className="px-6 py-3 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-md hover:bg-black hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 min-w-fit">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </div>
            </Link>

            <Link href="/admin/orders">
              <div className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 min-w-fit">
                <ShoppingCart className="h-5 w-5" />
                Orders
              </div>
            </Link>

            <Link href="/admin/products">
              <div className="px-6 py-3 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-md hover:bg-black hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 min-w-fit">
                <Package className="h-5 w-5" />
                Products
              </div>
            </Link>

            <Link href="/admin/messages">
              <div className="px-6 py-3 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-md hover:bg-black hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 min-w-fit">
                <MessageSquare className="h-5 w-5" />
                Messages
              </div>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content - Spacing to prevent overlap with sticky header */}
      <main className="max-w-7xl mx-auto px-6 py-8" style={{ marginTop: '0' }}>
        <div className="mb-6 pt-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h2>
          <p className="text-gray-600">Kelola semua pesanan pelanggan</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari berdasarkan nomor order, nama, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-3.5 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-all text-base text-gray-900 placeholder:text-gray-500"
                style={{ paddingLeft: '3.5rem' }}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-14 pr-8 py-3.5 border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none appearance-none bg-white cursor-pointer min-w-[200px] text-base font-semibold text-gray-900"
                style={{ paddingLeft: '3.5rem' }}
              >
                <option value="all">Semua Status</option>
                {ADMIN_ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Order Details</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Alamat Customer</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Barang Dipesan</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total & Payment</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status Pengiriman</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Bukti Transfer</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-semibold">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const amount = formatCurrency(getOrderAmount(order));
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors align-top">
                        {/* Order Details */}
                        <td className="px-6 py-5 align-top">
                          <div className="space-y-1 leading-snug">
                            <div className="font-semibold text-sm text-gray-900 tracking-tight">{order.shippingAddress?.fullName || order.customerName}</div>
                            <div className="text-[11px] font-mono text-gray-600">#{order.orderNumber}</div>
                            <div className="text-[11px] text-gray-500">{formatDate(order.createdAt)}</div>
                            {order.shippingAddress?.phone && (
                              <a
                                href={`https://wa.me/${formatPhoneForWA(order.shippingAddress.phone)}`}
                                target="_blank" rel="noreferrer"
                                className="inline-block pt-0.5 text-[11px] font-medium text-green-700 hover:text-green-800 underline"
                                title="Chat via WhatsApp"
                              >
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </td>
                        {/* Alamat Customer */}
                        <td className="px-6 py-5 align-top">
                          {order.shippingAddress ? (
                            <div className="space-y-1 text-[11px] text-gray-700 leading-snug">
                              {order.shippingAddress.address && <div className="font-medium text-gray-800">{order.shippingAddress.address}</div>}
                              <div className="text-gray-600">{[order.shippingAddress.city, order.shippingAddress.province].filter(Boolean).join(', ')}</div>
                              {order.shippingAddress.postalCode && <div className="text-gray-600">Kode Pos: {order.shippingAddress.postalCode}</div>}
                              {order.shippingAddress.notes && <div className="italic text-gray-500">Catatan: {order.shippingAddress.notes}</div>}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">-</span>
                          )}
                        </td>
                        {/* Barang Dipesan */}
                        <td className="px-6 py-5 align-top">
                          <ul className="text-[12px] text-gray-800 space-y-1 leading-snug">
                            {order.items?.map((it, idx) => {
                              const item = it as Record<string, unknown>;
                              const productName = (item.productName || item.name || item.title || 'Produk') as string;
                              return (
                                <li key={idx} className="flex items-center justify-between gap-3">
                                  <span className="truncate max-w-[220px] font-medium">
                                    {productName}
                                  </span>
                                  <span className="text-gray-600 text-[11px]">× {it.quantity}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                        {/* Total & Payment */}
                        <td className="px-6 py-5 align-top">
                          <div className="space-y-2 leading-snug">
                            <div className="text-sm font-semibold text-gray-900">{amount}</div>
                            <div className="grid grid-cols-2 items-center gap-3">
                              <span
                                className={`text-[11px] tracking-wide font-semibold px-2 py-1 rounded-full border text-center ${
                                  order.paymentStatus === 'paid'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : order.paymentStatus === 'failed'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : order.paymentStatus === 'refunded'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {paymentStatusLabel(order.paymentStatus)}
                              </span>
                              <select
                                value={order.paymentStatus}
                                aria-label="Update payment status"
                                onChange={async (e) => {
                                  try {
                                    const newStatus = e.target.value;
                                    const session = localStorage.getItem('adminSession');
                                    if (!session) return toast.error('Admin session missing');
                                    const adminData = JSON.parse(session);
                                    const result = await safeFetch(`/api/admin/orders/${order._id}`, {
                                      method: 'PUT',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'x-admin-email': adminData.email,
                                        'x-admin-role': adminData.role
                                      },
                                      body: JSON.stringify({ paymentStatus: newStatus }),
                                      onUnauthorized: () => {
                                        toast.error('Sesi admin berakhir, silakan login kembali');
                                        localStorage.removeItem('adminSession');
                                        router.push('/admin/login');
                                      },
                                      nonJsonMessage: 'Terjadi gangguan pada server saat update pembayaran'
                                    });
                                    if (result.success) {
                                      toast.success('Payment status updated');
                                      fetchOrders();
                                    } else {
                                      toast.error(result.message || 'Failed updating payment status');
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    toast.error('Error updating payment status');
                                  }
                                }}
                                className="px-2 py-1 border border-gray-200 rounded text-[11px] font-medium focus:border-black focus:outline-none cursor-pointer bg-white min-w-[140px] justify-self-start"
                              >
                                <option value="pending">Belum dibayar</option>
                                <option value="paid">Sudah dibayar</option>
                                <option value="failed">Pesanan dibatalkan</option>
                                <option value="refunded">Refund</option>
                              </select>
                            </div>
                          </div>
                        </td>
                        {/* Status Pengiriman */}
                        <td className="px-6 py-5 align-top">
                          <div className="space-y-2 leading-snug">
                            <div>{renderOrderStatusBadge(order.orderStatus)}</div>
                            <select
                              value={order.orderStatus === 'delivered' ? 'completed' : order.orderStatus}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className="px-2 py-1 border border-gray-200 rounded text-[11px] font-medium focus:border-black focus:outline-none cursor-pointer bg-white"
                            >
                              {ADMIN_ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        {/* Bukti Transfer */}
                        <td className="px-6 py-5 align-top">
                          {order.paymentMethod === 'bank_transfer' && order.paymentDetails?.paymentProof ? (
                            <a href={order.paymentDetails.paymentProof} target="_blank" rel="noreferrer" title="Lihat bukti" className="block group w-10">
                              <div className="relative rounded-md border border-gray-200 overflow-hidden bg-gray-100 h-10 w-10 flex items-center justify-center">
                                <ImageWithFallback src={order.paymentDetails.paymentProof} alt="Bukti" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                              </div>
                              {order.paymentDetails.paymentProofUploadedAt && (
                                <div className="mt-1 text-[10px] text-gray-500 text-center leading-tight">
                                  {new Date(order.paymentDetails.paymentProofUploadedAt).toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit'})}
                                </div>
                              )}
                            </a>
                          ) : (
                            <span className="text-[11px] text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{filteredOrders.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue (paid)</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  filteredOrders.reduce((sum, order) => {
                    const amount = getOrderAmount(order);
                    return sum + (order.paymentStatus === 'paid' ? amount : 0);
                  }, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
