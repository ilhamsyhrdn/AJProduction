import { ProductCard } from "./ProductCard";

export function FeaturedProducts() {
  const products = [
    {
      image: "/gambarProduct/susuPutih1.jpg",
      name: "Susu Original Diocca",
      price: "Rp 25.000",
      category: "SUSU"
    },
    {
      image: "/gambarProduct/susuCoklat1.jpg",
      name: "Sabun Cokelat Diocca",
      price: "Rp 25.000",
      category: "SUSU"
    },
    {
      image: "https://images.unsplash.com/photo-1579170714070-e6f684b3d00c?w=400",
      name: "Es Kristal Batu AJ 10kg",
      price: "Rp 10.000",
      category: "ES KRISTAL"
    },
    {
      image: "https://images.unsplash.com/photo-1661450159298-d58a3b98f3a4?w=400",
      name: "Sabun Cuci Baju Batanghari River",
      price: "Rp 15.000",
      category: "SABUN"
    }
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">PRODUK UNGGULAN</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Produk terlaris dan paling diminati pelanggan kami
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
