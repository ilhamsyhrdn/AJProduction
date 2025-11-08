import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Input } from "./ui/input";
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchProduct {
  _id: string;
  name: string;
  price: number;
  category: {
    name: string;
  };
  images: string[];
  stock: number;
}

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    onOpenChange(false);
    setSearchQuery('');
    setResults([]);
    router.push(`/products/${productId}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Search Products</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="mt-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : results.length > 0 ? (
              results.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category.name}</p>
                    <p className="text-sm font-semibold mt-1">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
                    {product.stock === 0 && (
                      <p className="text-xs text-red-600 mt-1">Out of stock</p>
                    )}
                  </div>
                </button>
              ))
            ) : hasSearched ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found for "{searchQuery}"</p>
                <p className="text-sm text-gray-400 mt-2">Try different keywords</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Start typing to search products</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
