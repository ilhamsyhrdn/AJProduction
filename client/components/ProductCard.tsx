import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "sonner";

interface ProductCardProps {
  productId?: string;
  image: string;
  name: string;
  price: string;
  category?: string;
  link?: string;
  stock?: number;
  onAddToCart?: () => void;
}

export function ProductCard({ 
  productId, 
  image, 
  name, 
  price, 
  category, 
  link, 
  stock,
  onAddToCart 
}: ProductCardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (status === 'unauthenticated') {
      toast.error('Silakan login terlebih dahulu');
      router.push('/auth/signin');
      return;
    }

    if (!productId) {
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (stock !== undefined && stock <= 0) {
      toast.error('Produk sedang habis');
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${name} ditambahkan ke keranjang`);
        if (onAddToCart) onAddToCart();
      } else {
        toast.error(data.message || 'Gagal menambahkan ke keranjang');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleClick = () => {
    if (productId) {
      router.push(`/products/${productId}`);
    } else if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className={`group ${productId || link ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="aspect-square overflow-hidden mb-4 bg-gray-100 relative">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {(productId || link) && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              className="bg-white rounded-full p-2.5 shadow-lg hover:bg-orange-50 transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-orange-600" />
            </button>
          </div>
        )}
        {stock !== undefined && stock <= 5 && stock > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              Stok Terbatas: {stock}
            </span>
          </div>
        )}
        {stock !== undefined && stock === 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
              Habis
            </span>
          </div>
        )}
      </div>
      {category && (
        <p className="text-gray-500 text-sm mb-1">{category}</p>
      )}
      <h3 className="mb-2">{name}</h3>
      <div className="flex items-center justify-between">
        <p className="text-gray-900">{price}</p>
        {(productId || link) && (
          <span className="text-xs text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {productId ? 'Tambah ke Keranjang →' : 'Beli di Shopee →'}
          </span>
        )}
      </div>
    </div>
  );
}
