import { useState, useEffect, useCallback } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Fallback data jika API belum ready
const fallbackProducts = [
  {
    image: "/gambarProduct/susuPutih1.jpg",
    name: "Susu Original Diocca",
    price: "Rp 25.000",
    category: "SUSU",
    link: "https://shopee.co.id/DIOCCA-Susu-Bubuk-Original-4-Sachet-X-35-G-i.337778734.29991803611"
  },
  {
    image: "/gambarProduct/susuCoklat1.jpg",
    name: "Susu Cokelat Diocca",
    price: "Rp 25.000",
    category: "SUSU",
    link: "https://shopee.co.id/DIOCCA-Susu-Bubuk-Cokelat-4-Sachet-x-35g-i.337778734.42070089376"
  },
  {
    image: "https://images.unsplash.com/photo-1661450159298-d58a3b98f3a4?w=400",
    name: "Sabun Cuci Piring Batanghari River",
    price: "Rp 15.000",
    category: "SABUN"
  },
  {
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400",
    name: "Sabun Cuci Baju Batanghari River",
    price: "Rp 15.000",
    category: "SABUN"
  },
  {
    image: "https://images.unsplash.com/photo-1551012895-a382185816af?w=400",
    name: "Es Kristal AJ 20kg",
    price: "Rp 20.000",
    category: "ES KRISTAL"
  },
  {
    image: "https://images.unsplash.com/photo-1551012895-a382185816af?w=400",
    name: "Es Kristal AJ 10kg",
    price: "Rp 10.000",
    category: "ES KRISTAL"
  },
  {
    image: "https://images.unsplash.com/photo-1551012895-a382185816af?w=400",
    name: "Es Kristal AJ 5kg",
    price: "Rp 5.000",
    category: "ES KRISTAL"
  }
];

const categories = ["SEMUA", "SUSU", "SABUN", "ES KRISTAL"];

export default function ProductPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["SEMUA"]);
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  interface ApiProduct {
    _id: string;
    images: string[];
    name: string;
    price: number;
    category: string;
    stock: number;
    shopeeLink?: string;
  }

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const transformedProducts = (data.data as ApiProduct[]).map((product) => ({
          productId: product._id,
          image: product.images?.[0] || '/placeholder.jpg',
          name: product.name,
          price: `Rp ${product.price.toLocaleString('id-ID')}`,
          category: product.category,
          stock: product.stock,
          link: product.shopeeLink
        }));
        setProducts(transformedProducts);
      }
    } catch {
      console.log('Using fallback products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleCategory = (category: string) => {
    if (category === "SEMUA") {
      setSelectedCategories(["SEMUA"]);
    } else {
      const newCategories = selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories.filter(c => c !== "SEMUA"), category];
      setSelectedCategories(newCategories.length === 0 ? ["SEMUA"] : newCategories);
    }
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategories.includes("SEMUA")) return true;
    return selectedCategories.includes(product.category);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">PRODUK KAMI</h1>
        <p className="text-gray-600">
          Temukan produk berkualitas terbaik untuk kebutuhan Anda
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 space-y-6">
          <div>
            <h3 className="mb-4">KATEGORI</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <label
                    htmlFor={category}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {loading ? 'Memuat...' : `${filteredProducts.length} produk`}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Unggulan</SelectItem>
                <SelectItem value="price-low">Harga: Rendah ke Tinggi</SelectItem>
                <SelectItem value="price-high">Harga: Tinggi ke Rendah</SelectItem>
                <SelectItem value="name">Nama: A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard key={index} {...product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
