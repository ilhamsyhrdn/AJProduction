import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingCart, Heart, Share2, Minus, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  stock: number;
  shopeeLink?: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  
  const [product, setProduct] = useState<Product | null>(null);
  interface RelatedProduct {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category?: { _id: string; name: string; slug: string };
  }
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchRelatedProducts = useCallback(async (categoryId: string, currentId: string) => {
    try {
      const res = await fetch(`/api/products?category=${categoryId}&limit=4`);
      const data = await res.json();
      if (data.success) {
        setRelatedProducts((data.data as RelatedProduct[]).filter((p) => p._id !== currentId));
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data as Product);
        if (data.data.category) {
          fetchRelatedProducts(data.data.category._id, String(id));
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }, [id, fetchRelatedProducts]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // removed old non-memoized fetchProduct & fetchRelatedProducts implementations

  const handleAddToCart = async () => {
    if (!session) {
      toast.error('Please login first to add items to cart');
      router.push('/auth/signin');
      return;
    }

    if (!product) return;

    // Stock validation
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    setAddingToCart(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          quantity
        })
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(`${product.name} added to cart! (${quantity} item${quantity > 1 ? 's' : ''})`);
      } else {
        toast.error(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error('Error adding to cart. Please try again.');
      console.error('Add to cart error:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    // Stock validation
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    await handleAddToCart();
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
              <div className="bg-gray-200 h-6 w-1/2 rounded"></div>
              <div className="bg-gray-200 h-24 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/products" className="text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-600">
        <Link href="/" className="hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-black">Products</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-black">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">{product.name}</span>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <ImageWithFallback
              src={product.images[selectedImage] || '/gambarProduct/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 ${
                    selectedImage === index ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-sm text-gray-600">(0 reviews)</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-3xl font-bold text-gray-900">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Stock */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Stock: <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </span>
            </p>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-600">
                Max: {product.stock}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className="flex-1 bg-white text-black border-2 border-black hover:bg-black hover:text-white"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            
            <Button
              onClick={handleBuyNow}
              disabled={product.stock === 0 || addingToCart}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              Buy Now
            </Button>
          </div>

          {/* Shopee Link */}
          {product.shopeeLink && (
            <div className="mb-6">
              <a
                href={product.shopeeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-orange-600 hover:text-orange-700"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.5 10.5L12 6l4.5 4.5M12 18V7.5"/>
                </svg>
                View on Shopee
              </a>
            </div>
          )}

          {/* Share */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <button className="flex items-center gap-2 text-gray-600 hover:text-black">
              <Heart className="h-5 w-5" />
              Add to Wishlist
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-black">
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct._id} href={`/products/${relatedProduct._id}`}>
                <ProductCard
                  image={relatedProduct.images[0] || '/gambarProduct/placeholder.jpg'}
                  name={relatedProduct.name}
                  price={`Rp ${relatedProduct.price.toLocaleString('id-ID')}`}
                  category={relatedProduct.category?.name}
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
