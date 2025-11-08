import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../../client/components/ui/sheet";
import { Button } from "../../client/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "../../client/components/figma/ImageWithFallback";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Susu Original",
      price: 25000,
      quantity: 1,
      image: "/gambarProduct/susuPutih1.jpg",
      category: "Susu"
    },
    {
      id: 2,
      name: "Susu Cokelat",
      price: 25000,
      quantity: 2,
      image: "/gambarProduct/susuCoklat1.jpg",
      category: "Sabun"
    }
  ]);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    const item = cartItems.find(i => i.id === id);
    setCartItems(items => items.filter(item => item.id !== id));
    if (item) {
      toast.success(`${item.name} dihapus dari keranjang`);
    }
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
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Keranjang Anda kosong</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
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
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-black"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border rounded">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
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

        {cartItems.length > 0 && (
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
            <Button className="w-full bg-black text-white hover:bg-gray-800">
              CHECKOUT
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
