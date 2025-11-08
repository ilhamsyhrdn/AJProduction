import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "./ui/sheet";
import { Button } from "./ui/button";
import { Minus, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CartItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  stock: number;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart items from API
  useEffect(() => {
    if (open && session) {
      loadCart();
    }
  }, [open, session]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      const data = await response.json();
      
      if (data.success && data.cart) {
        setCartItems(data.cart.items || []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, delta: number) => {
    const item = cartItems.find(i => i.productId === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    if (newQuantity > item.stock) {
      toast.error(`Stok tidak mencukupi. Stok tersedia: ${item.stock}`);
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCartItems(items =>
          items.map(item =>
            item.productId === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      } else {
        toast.error(data.message || 'Gagal mengupdate quantity');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const removeItem = async (productId: string) => {
    const item = cartItems.find(i => i.productId === productId);
    
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCartItems(items => items.filter(item => item.productId !== productId));
        if (item) {
          toast.success(`${item.name} dihapus dari keranjang`);
        }
      } else {
        toast.error(data.message || 'Gagal menghapus item');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleCheckout = () => {
    if (status === 'unauthenticated') {
      toast.error('Silakan login terlebih dahulu untuk checkout');
      onOpenChange(false);
      router.push('/auth/signin');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Keranjang Anda kosong');
      return;
    }

    onOpenChange(false);
    router.push('/checkout');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5000;
  const total = subtotal + shipping;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Keranjang Belanja ({cartItems.length})</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6">
          {status === 'unauthenticated' ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Silakan login untuk melihat keranjang belanja</p>
              <Button 
                onClick={() => {
                  onOpenChange(false);
                  router.push('/auth/signin');
                }}
                className="bg-black text-white hover:bg-gray-800"
              >
                Login Sekarang
              </Button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat keranjang...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Keranjang Anda kosong</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item._id} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <div>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <h4 className="text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-400">Stok: {item.stock}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-400 hover:text-black"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border rounded">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {status === 'authenticated' && cartItems.length > 0 && (
          <SheetFooter className="flex-col space-y-4 border-t pt-4">
            <div className="space-y-2 w-full">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkir</span>
                <span>Rp {shipping.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <Button 
              onClick={handleCheckout}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              CHECKOUT
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
