import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <section className="relative h-[600px] lg:h-[700px] overflow-hidden" style={{ backgroundColor: '#036635' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageWithFallback
          
          className="w-[3000px] h-[2000px] object-contain"
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="font-bold mb-4 lg:mb-6 tracking-wider text-white" style={{ fontSize: 'clamp(40px, 10vw, 150px)', fontFamily: 'Roboto', fontWeight: 900 }}>AJ PRODUCTION</h1>
          <h2 className="mb-3 lg:mb-4 tracking-wider text-white text-lg sm:text-2xl lg:text-3xl font-semibold">PRODUK BERKUALITAS</h2>
          <p className="mb-6 lg:mb-8 max-w-md mx-auto text-sm sm:text-base lg:text-xl px-2">
            SUSU SEGAR, SABUN ALAMI, DAN ES KRISTAL TERBAIK UNTUK KEBUTUHAN ANDA SEHARI HARI
          </p>
          <Button className="text-white hover:opacity-90 px-6 py-4 lg:px-8 lg:py-6 text-sm lg:text-base" style={{ backgroundColor: '#036635' }}>
           AYOOOOOO SAYANG BELANJA SEKARANG
          </Button>
        </div>
      </div>
    </section>
  );
}
