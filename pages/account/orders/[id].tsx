import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, Truck, CheckCircle, XCircle, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export default function OrderDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  
  interface OrderItem {
    image: string;
    name: string;
    price: number;
    quantity: number;
  }
  interface AccountOrderDetail {
    _id: string;
    orderNumber: string;
    createdAt: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    subtotal: number;
    shippingCost: number;
    total: number;
    items: OrderItem[];
    trackingNumber?: string;
    shippingAddress: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      province: string;
      postalCode: string;
      notes?: string;
    };
    paymentDetails?: {
      paymentProof?: string;
      paymentProofUploadedAt?: string;
    };
  }
  const [order, setOrder] = useState<AccountOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data as AccountOrderDetail);
      } else {
        alert(data.message);
        router.push('/account');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && id) {
      fetchOrder();
    }
  }, [status, id, router, fetchOrder]);


  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) { setFile(null); setPreview(null); return; }
    if (!/^image\/(png|jpe?g)$/i.test(f.type)) { setError('Format harus JPG/PNG'); return; }
    if (f.size > 2 * 1024 * 1024) { setError('Maksimal 2MB'); return; }
    setError(null);
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const uploadProof = async () => {
    if (!file || !preview) return;
    setUploading(true);
    try {
      const res = await fetch(`/api/orders/${id}` , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentDetails: {
            paymentProof: preview,
            paymentProofMime: file.type,
            paymentProofOriginalName: file.name
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setFile(null);
        setPreview(null);
      } else {
        alert(data.message || 'Gagal upload bukti');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <Button onClick={() => router.push('/account')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package className="h-6 w-6 text-yellow-600" />;
      case 'processing': return <Package className="h-6 w-6 text-blue-600" />;
      case 'shipped': return <Truck className="h-6 w-6 text-purple-600" />;
      case 'delivered':
      case 'completed': return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'cancelled': return <XCircle className="h-6 w-6 text-red-600" />;
      default: return <Package className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const displayStatus = (s: string) => (s === 'delivered' ? 'completed' : s);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/account" className="inline-flex items-center text-gray-600 hover:text-black mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
              <p className="text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
              {getStatusIcon(order.orderStatus)}
              <span className="font-semibold capitalize">{displayStatus(order.orderStatus)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Order Items</h2>
              </div>
              <div className="p-6 space-y-4">
                {order.items.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium mt-1">
                        Rp {item.price.toLocaleString('id-ID')} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-1">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-gray-600">{order.shippingAddress.phone}</p>
                <p className="text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </p>
                {order.shippingAddress.notes && (
                  <p className="text-sm text-gray-500 mt-2 pt-2 border-t">
                    Note: {order.shippingAddress.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Tracking Information</h2>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded">
                  <Truck className="h-6 w-6 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-semibold">{order.trackingNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>Rp {order.shippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>Rp {order.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {order.paymentMethod === 'bank_transfer' && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Bank Transfer Details</h3>
                  <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
                    <p><strong>Bank:</strong> BCA</p>
                    <p><strong>Account:</strong> 1234567890</p>
                    <p><strong>Name:</strong> AJProduction</p>
                    <p className="text-xs text-gray-600 mt-3">Upload bukti transfer agar admin bisa verifikasi.</p>
                  </div>
                  {order.paymentDetails?.paymentProof ? (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Bukti yang diupload:</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={order.paymentDetails.paymentProof} alt="Payment Proof" className="w-full max-h-80 object-contain border rounded" />
                      <p className="text-xs text-gray-500 mt-1">Diunggah: {order.paymentDetails.paymentProofUploadedAt ? new Date(order.paymentDetails.paymentProofUploadedAt).toLocaleString('id-ID') : '-'}</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <label className="block">
                        <span className="sr-only">Pilih file</span>
                        <input type="file" accept="image/png,image/jpeg" onChange={onFileChange} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800" />
                      </label>
                      {error && <p className="text-xs text-red-600">{error}</p>}
                      {preview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Preview" className="h-32 w-auto object-contain border rounded" />
                      )}
                      <Button disabled={!preview || uploading} onClick={uploadProof} className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Payment Proof'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {(order.orderStatus === 'delivered' || order.orderStatus === 'completed') && (
                <div className="mt-6">
                  <Button className="w-full" variant="outline">
                    Rate This Order
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
