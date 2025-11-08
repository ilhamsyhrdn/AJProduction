import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Heart, Leaf, Sparkles } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Berkualitas Tinggi",
    description: "Semua produk kami telah tersertifikasi dan melewati quality control yang ketat."
  },
  {
    icon: Leaf,
    title: "Higienis & Aman",
    description: "Diproduksi dengan standar kebersihan tinggi dan aman untuk seluruh keluarga."
  },
  {
    icon: Sparkles,
    title: "Harga Terjangkau",
    description: "Kualitas premium dengan harga yang ramah di kantong untuk semua kalangan."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] overflow-hidden" style={{ backgroundColor: '#036635' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="mb-4 text-white">TENTANG KAMI</h1>
            <p className="max-w-2xl mx-auto">
              Menyediakan produk berkualitas tinggi untuk kebutuhan sehari-hari keluarga Indonesia
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2>KOMITMEN KAMI UNTUK KUALITAS</h2>
            <p className="text-gray-600 leading-relaxed">
              Didirikan pada tahun 2020, AJProduct lahir dari komitmen sederhana: menyediakan 
              produk berkualitas tinggi yang terjangkau untuk setiap keluarga Indonesia. Kami 
              memahami pentingnya produk sehari-hari yang aman, higienis, dan dapat diandalkan.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Susu segar kami berasal langsung dari peternakan terpercaya dengan standar kesehatan 
              yang ketat. Sabun alami kami dibuat dengan bahan-bahan organik pilihan tanpa bahan 
              kimia berbahaya. Es kristal kami diproduksi dengan air murni yang sudah melewati 
              proses filtrasi bertingkat untuk menjamin kebersihan dan kualitas.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Saat ini, AJProduct telah menjadi pilihan utama ribuan keluarga di seluruh Indonesia. 
              Kami terus berinovasi dan meningkatkan kualitas produk untuk memberikan yang terbaik 
              bagi pelanggan kami.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">NILAI-NILAI KAMI</h2>
            <p className="text-gray-600">
              Prinsip yang menjadi landasan dalam setiap produk kami
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Image Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="/gambarProduct/susuCoklat1.jpg"
                alt="Susu Coklat 1"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="/gambarProduct/susuCoklat2.jpg"
                alt="Susu Coklat 2"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="/gambarProduct/susuCoklat3.jpg"
                alt="Susu Coklat 3"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="/gambarProduct/susuCoklat4.jpg"
                alt="Susu Coklat 4"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="/gambarProduct/susuCoklat5.jpg"
                alt="Susu Coklat 5"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="/gambarProduct/susuPutih1.jpg"
                alt="Susu Putih 1"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="/gambarProduct/susuPutih2.jpg"
                alt="Susu Putih 2"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="/gambarProduct/SusuPutih3.jpg"
                alt="Susu Putih 3"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="/gambarProduct/susuPutih4.jpg"
                alt="Susu Putih 4"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="/gambarProduct/susuPutih5.jpg"
                alt="Susu Putih 5"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1579170714070-e6f684b3d00c?w=500"
                alt="Galeri"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
