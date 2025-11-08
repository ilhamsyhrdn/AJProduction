import { Instagram, ShoppingBag, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="mb-4">PRODUK</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/products" className="hover:text-black transition-colors">Semua Produk</a></li>
              <li><a href="/products?category=susu" className="hover:text-black transition-colors">Susu</a></li>
              <li><a href="/products?category=sabun" className="hover:text-black transition-colors">Sabun</a></li>
              <li><a href="/products?category=es-kristal" className="hover:text-black transition-colors">Es Kristal</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4">TENTANG</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/about" className="hover:text-black transition-colors">Tentang Kami</a></li>
              <li><a href="/about#quality" className="hover:text-black transition-colors">Kualitas Produk</a></li>
              <li><a href="/about#certification" className="hover:text-black transition-colors">Sertifikasi</a></li>
              <li><a href="/about#partners" className="hover:text-black transition-colors">Mitra Kami</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4">BANTUAN</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/contact" className="hover:text-black transition-colors">Hubungi Kami</a></li>
              <li><a href="/contact#shipping" className="hover:text-black transition-colors">Pengiriman</a></li>
              <li><a href="/contact#order" className="hover:text-black transition-colors">Cara Pemesanan</a></li>
              <li><a href="/contact#faq" className="hover:text-black transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4">IKUTI KAMI</h3>
            <p className="text-sm text-gray-600 mb-3">DIOCCA</p>
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://www.instagram.com/diocca.id?igsh=OXR4dHA0dThldW9o" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
                aria-label="Instagram Diocca"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@diocca?_r=1&_t=ZS-91ArPyD3XyG" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-black transition-colors"
                aria-label="TikTok Diocca"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://shopee.co.id/diocca.id" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-600 transition-colors"
                aria-label="Shopee Diocca"
              >
                <ShoppingBag className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-gray-600 mb-3 mt-6">BATANGHARI RIVER</p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/batanghaririver?igsh=MXFtMmdqenlmNjh4cQ==" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
                aria-label="Instagram Batanghari River"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-gray-600">
          <p>&copy; 2025 AJProduction. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
