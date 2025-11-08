// pages/admin/dashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  totalCustomers: number;
  todayOrders: number;
  todayRevenue: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface FetchedOrder {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  createdAt: string;
  paymentStatus?: string;
  total?: number;
  user?: { name?: string };
  shippingAddress?: { fullName?: string };
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

interface StatsPayload {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  totalCustomers: number;
  completedOrders: number;
  cancelledOrders: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect moved below fetchStats definition to avoid temporal dead zone

  const parseJSONSafely = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (e) {
        console.warn('JSON parse failed (dashboard):', e);
        return { success: false, message: 'Format data tidak valid' };
      }
    }
    const text = await response.text();
    return { success: false, message: 'non-json', raw: text.slice(0,200) };
  };

  const fetchStats = useCallback(async () => {
    try {
      const session = localStorage.getItem('adminSession');
      if (!session) return;

      const adminData = JSON.parse(session);

      const response = await fetch('/api/admin/stats-local', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminData.email,
          'x-admin-role': adminData.role
        },
        redirect: 'manual'
      });

      // Auth/session expiration handling
      if (response.status === 401 || response.status === 403) {
        toast.error('Sesi admin berakhir, silakan login kembali');
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
        return;
      }

      const result = await parseJSONSafely(response);

      if (!response.ok || !result.success) {
        if ((result as { raw?: string }).raw?.startsWith('<!DOCTYPE')) {
          console.warn('Non-JSON HTML received from /api/admin/stats-local:', (result as { raw?: string }).raw);
          throw new Error('Terjadi gangguan server saat memuat dashboard.');
        }
        throw new Error(result.message || 'Gagal memuat data dashboard');
      }

  const { stats: fetchedStats, recentOrders: fetchedOrders } = result.data as { stats: Partial<StatsPayload>; recentOrders: FetchedOrder[] };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = fetchedOrders.filter((o) => new Date(o.createdAt) >= today).length;
      const todayRevenue = fetchedOrders
        .filter((o) => new Date(o.createdAt) >= today && o.paymentStatus === 'paid')
        .reduce((sum, order) => sum + (order.total || 0), 0);

      setStats({
        totalOrders: fetchedStats.totalOrders || 0,
        totalRevenue: fetchedStats.totalRevenue || 0,
        totalProducts: fetchedStats.totalProducts || 0,
        lowStockProducts: fetchedStats.lowStockProducts || 0,
        pendingOrders: fetchedStats.pendingOrders || 0,
        totalCustomers: fetchedStats.totalCustomers || 0,
        todayOrders,
        todayRevenue,
        completedOrders: fetchedStats.completedOrders || 0,
        cancelledOrders: fetchedStats.cancelledOrders || 0,
      });

      const recent = fetchedOrders.map((order) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || order.shippingAddress?.fullName || 'Unknown',
        totalAmount: order.total,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt
      }));

      setRecentOrders(recent);
      setLoading(false);
    } catch (error) {
      const err = error as Error;
      console.error('Error fetching stats:', err);
      toast.error(err.message || 'Gagal memuat data dashboard');
      setLoading(false);
      if (/kadaluarsa|login|unauthorized|401/i.test(err.message)) {
        localStorage.removeItem('adminSession');
        router.push('/admin/login');
      }
    }
  }, [router]);

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    fetchStats();
  }, [router, fetchStats]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const getStatusColor = (status: string): string => {
    const s = status === 'delivered' ? 'completed' : status;
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[s] || 'bg-gray-100 text-gray-800';
  };

  const handleLogout = () => {
    // Hapus session dari localStorage
    localStorage.removeItem('adminSession');
    toast.success('Logout berhasil');
    // Redirect ke halaman login
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <div className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 min-w-fit">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </div>
            </Link>

            <Link href="/admin/orders">
              <div className="px-6 py-3 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-md hover:bg-black hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 min-w-fit">
                <ShoppingCart className="h-5 w-5" />
                Orders
                {stats.pendingOrders > 0 && (
                  <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {stats.pendingOrders}
                  </span>
                )}
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
        {/* Removed static login success alert (already handled by login notification) */}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1 - Orders */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalOrders}</h3>
                <p className="text-sm text-gray-600 font-medium">Total Pesanan</p>
              </CardContent>
            </Card>

            {/* Card 2 - Revenue */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalRevenue)}</h3>
                <p className="text-sm text-gray-600 font-medium">Total Pendapatan</p>
              </CardContent>
            </Card>

            {/* Card 3 - Products */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProducts}</h3>
                <p className="text-sm text-gray-600 font-medium">Total Produk</p>
              </CardContent>
            </Card>

            {/* Card 4 - Customers */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCustomers}</h3>
                <p className="text-sm text-gray-600 font-medium">Total Pelanggan</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Pending */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pending</p>
                    <p className="text-sm font-semibold text-gray-900">Menunggu Proses</p>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</h3>
                </div>
              </CardContent>
            </Card>

            {/* Completed */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Selesai</p>
                    <p className="text-sm font-semibold text-gray-900">Sudah Dikirim</p>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.completedOrders}</h3>
                </div>
              </CardContent>
            </Card>

            {/* Cancelled */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dibatalkan</p>
                    <p className="text-sm font-semibold text-gray-900">Tidak Jadi</p>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.cancelledOrders}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Orders */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4 border-b border-gradient-to-r from-indigo-100 to-purple-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    Recent Orders
                  </CardTitle>
                  <Link href="/admin/orders">
                    <span className="text-sm text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer hover:underline transition-all">
                      View All →
                    </span>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <ShoppingCart className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 font-semibold">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div key={order._id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 mb-1">{order.orderNumber}</p>
                          <p className="text-xs text-gray-600 truncate font-medium">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-600 mb-1">{formatCurrency(order.totalAmount)}</p>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4 border-b border-gradient-to-r from-indigo-100 to-purple-100">
                <CardTitle className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Success Rate */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-700">Success Rate</span>
                    <span className="text-lg font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: stats.totalOrders > 0 ? `${(stats.completedOrders / stats.totalOrders) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>

                {/* Avg Order Value */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-700">Avg Order Value</span>
                    <span className="text-sm font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {stats.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders) : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full w-3/4 shadow-lg"></div>
                  </div>
                </div>

                {/* Revenue per Customer */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-700">Revenue/Customer</span>
                    <span className="text-sm font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {stats.totalCustomers > 0 ? formatCurrency(stats.totalRevenue / stats.totalCustomers) : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full w-3/5 shadow-lg"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Quick Access section removed per request (already available via navigation) */}
      </main>
    </div>
  );
}