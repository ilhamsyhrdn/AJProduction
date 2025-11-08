import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";

export function CategorySection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="aspect-square overflow-hidden flex items-center justify-center bg-gray-100">
              <ImageWithFallback
                src="/gambarProduct/Logo.jpg"
                alt="Koleksi Produk"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:pl-12">
            <h2 className="mb-6">KENAPA MEMILIH KAMI?</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              AJProduct menyediakan produk berkualitas tinggi dengan harga terjangkau. Susu segar kami 
              diproduksi langsung dari peternakan pilihan, sabun alami dibuat dengan bahan organik tanpa 
              bahan kimia berbahaya, dan es kristal kami diproduksi dengan air murni yang higienis.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Semua produk kami telah tersertifikasi dan aman untuk keluarga Anda.
            </p>
            <Button className="bg-black text-white hover:bg-gray-800 px-8">
              LIHAT SEMUA PRODUK
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
