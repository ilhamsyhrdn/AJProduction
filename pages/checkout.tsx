import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface CartItem {
  product: {
    _id: string;
    name: string;
  };
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CheckoutPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'cod'
  });

  // Payment proof (bank transfer)
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [paymentProofError, setPaymentProofError] = useState<string | null>(null);

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPaymentProofFile(null);
      setPaymentProofPreview(null);
      return;
    }
    // Validate type & size (<=2MB)
    if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
      setPaymentProofError('File harus JPG atau PNG');
      setPaymentProofFile(null);
      setPaymentProofPreview(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setPaymentProofError('Ukuran maksimal 2MB');
      setPaymentProofFile(null);
      setPaymentProofPreview(null);
      return;
    }
    setPaymentProofError(null);
    setPaymentProofFile(file);
    const reader = new FileReader();
    reader.onload = () => setPaymentProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.success) {
        setCartItems(data.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchCart();
    }
  }, [status, router, fetchCart]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      router.push('/products');
      return;
    }

    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.address || 
        !formData.city || !formData.province || !formData.postalCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate phone number
    if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Processing your order...');
    
    try {
      interface PaymentDetailsPayload {
        paymentProof: string;
        paymentProofMime: string;
        paymentProofOriginalName: string;
      }
      let paymentDetails: PaymentDetailsPayload | undefined = undefined;
      if (formData.paymentMethod === 'bank_transfer' && paymentProofFile && paymentProofPreview) {
        paymentDetails = {
          paymentProof: paymentProofPreview,
          paymentProofMime: paymentProofFile.type,
          paymentProofOriginalName: paymentProofFile.name
        };
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode,
            notes: formData.notes
          },
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          paymentDetails
        })
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success('Order placed successfully! 🎉', { id: toastId });
        
        // Show payment instructions based on method
        if (formData.paymentMethod === 'bank_transfer') {
          toast.info('Please complete your bank transfer payment', { duration: 5000 });
        }
        
        setTimeout(() => {
          router.push(`/account/orders/${data.data._id}`);
        }, 1000);
      } else {
        toast.error(data.message || 'Failed to place order', { id: toastId });
      }
    } catch (error) {
      toast.error('Error placing order. Please try again.', { id: toastId });
      console.error('Checkout error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = 5000;
  const total = subtotal + shippingCost;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => router.push('/products')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="province">Province *</Label>
                  <Input
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <div className="flex items-center space-x-2 p-4 border rounded cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="font-medium">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-600">Pay when you receive the product</div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-4 border rounded cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-gray-600">Transfer to our bank account</div>
                  </Label>
                </div>
                {formData.paymentMethod === 'bank_transfer' && (
                  <div className="mt-4 space-y-3 border rounded p-4 bg-gray-50">
                    <p className="text-sm text-gray-700 font-medium">Upload Bukti Transfer (JPG / PNG, max 2MB)</p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handlePaymentProofChange}
                      className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                    />
                    {paymentProofError && (
                      <p className="text-xs text-red-600">{paymentProofError}</p>
                    )}
                    {paymentProofPreview && (
                      <div className="flex items-center gap-3">
                        {/* Base64 preview - next/image adds overhead; keep <img> with lint disable */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={paymentProofPreview}
                          alt="Payment Proof Preview"
                          className="h-20 w-20 object-cover border rounded"
                        />
                        <button
                          type="button"
                          onClick={() => { setPaymentProofFile(null); setPaymentProofPreview(null); }}
                          className="text-xs px-3 py-1 border rounded hover:bg-gray-100"
                        >Hapus</button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Pastikan transfer sesuai dengan total. Admin akan verifikasi setelah bukti diupload.</p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 p-4 border rounded cursor-pointer hover:bg-gray-50 opacity-50">
                  <RadioGroupItem value="midtrans" id="midtrans" disabled />
                  <Label htmlFor="midtrans" className="flex-1">
                    <div className="font-medium">Online Payment (Coming Soon)</div>
                    <div className="text-sm text-gray-600">Credit card, e-wallet, etc.</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white hover:bg-gray-800 h-12 text-lg"
            >
              {submitting ? 'Processing...' : 'Place Order'}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg border sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>Rp {shippingCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
