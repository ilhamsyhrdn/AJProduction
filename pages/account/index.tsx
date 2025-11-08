import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, User, Heart, Settings, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  interface AccountOrder {
    _id: string;
    orderNumber: string;
    createdAt: string;
    total: number;
    orderStatus: string;
    items: { quantity: number }[];
    paymentMethod: string;
    trackingNumber?: string;
  }
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data as AccountOrder[]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, fetchOrders, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered':
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayStatus = (s: string) => (s === 'delivered' ? 'completed' : s);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden">
                  {session?.user?.image ? (
                    <ImageWithFallback src={session.user.image} alt={session.user.name || ''} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <h3 className="font-semibold">{session?.user?.name}</h3>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-2 rounded bg-gray-100 text-black"
                >
                  <Package className="h-5 w-5" />
                  <span>My Orders</span>
                </Link>
                
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Browse Products</span>
                </Link>
                
                <Link
                  href="/account/profile"
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                
                <Link
                  href="/account/wishlist"
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100"
                >
                  <Heart className="h-5 w-5" />
                  <span>Wishlist</span>
                </Link>

                {/* Admin Dashboard Link - Show only for admin users */}
                {session?.user?.email === 'AJProduct@admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 px-4 py-2 rounded bg-black text-white hover:bg-gray-800 border-2 border-black mt-4"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-semibold">Admin Dashboard</span>
                  </Link>
                )}
                
                <Link
                  href="/account/settings"
                  className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold">My Orders</h1>
              </div>

              <div className="p-6">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                    <Button onClick={() => router.push('/products')}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Link
                        key={order._id}
                        href={`/account/orders/${order._id}`}
                        className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-lg">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              Rp {order.total.toLocaleString('id-ID')}
                            </p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                              {displayStatus(order.orderStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="h-4 w-4" />
                          <span>{order.items.length} item(s)</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                        </div>

                        {order.trackingNumber && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Tracking: </span>
                            <span className="font-medium">{order.trackingNumber}</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
