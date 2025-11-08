import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Mail, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentOrderSummary {
  _id: string;
  orderNumber: string;
  user?: { name?: string };
  total: number;
  orderStatus: string;
}

interface TopProductSummary {
  name: string;
  totalSold: number;
  revenue: number;
}

interface RevenueByMonthPoint {
  month: string;
  revenue: number;
}

interface DashboardStats {
  overview: {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalProducts: number;
    lowStockProducts: number;
    totalCustomers: number;
    newCustomers: number;
    newMessages: number;
    totalSubscribers: number;
  };
  recentOrders: RecentOrderSummary[];
  topProducts: TopProductSummary[];
  revenueByMonth: RevenueByMonthPoint[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else if (res.status === 403) {
        alert('Access denied. Admin only.');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.name}
              </span>
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                View Site
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {stats.overview.totalRevenue.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                From {stats.overview.totalOrders} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalOrders}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.overview.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Products
              </CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalProducts}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.overview.lowStockProducts} low stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Customers
              </CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalCustomers}</div>
              <p className="text-xs text-gray-500 mt-1">
                +{stats.overview.newCustomers} this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/products" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Products</h3>
                  <p className="text-sm text-gray-600">Add, edit, or remove products</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/orders" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">View Orders</h3>
                  <p className="text-sm text-gray-600">Process and track orders</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/messages" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Messages</h3>
                  <p className="text-sm text-gray-600">
                    {stats.overview.newMessages} new messages
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.user?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rp {order.total.toLocaleString('id-ID')}</p>
                      <p className="text-xs text-gray-600">{order.orderStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/orders" className="block mt-4 text-center text-sm text-blue-600 hover:underline">
                View all orders →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts.map((product, index: number) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.totalSold} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Rp {product.revenue.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
