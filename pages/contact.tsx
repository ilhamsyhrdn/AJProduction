import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Instagram, ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ type: 'success', message: data.message });
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setStatus({ type: 'error', message: data.message || 'Terjadi kesalahan. Silakan coba lagi.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4">HUBUNGI KAMI</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kami siap melayani kebutuhan Anda. Hubungi kami untuk informasi lebih lanjut atau pemesanan produk
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="mb-8">INFORMASI KONTAK</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-2">Alamat</h3>
                    <p className="text-gray-600">
                      Jl. Sersan Anwar Bay, RT.01/RW.01, Bagan Pete, Kec. Alam Barajo<br />
                      Kota Jambi, Jambi 36361<br />
                      Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-2">Telepon</h3>
                    <p className="text-gray-600">
                      +62 819 0534 1580
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-2">Email</h3>
                    <p className="text-gray-600">
                      info@ajproduct.com<br />
                      sales@ajproduct.com
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-2">Jam Operasional</h3>
                    <p className="text-gray-600">
                      Senin - Sabtu: 08.00 - 16.00 WIB<br />
                      Minggu & Hari Libur: Tutup
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="mb-4">Ikuti Media Sosial Kami</h3>
                
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">DIOCCA</p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href="https://www.instagram.com/diocca.id?igsh=OXR4dHA0dThldW9o"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-pink-50 transition-colors border border-gray-200"
                    >
                      <Instagram className="h-5 w-5 text-pink-600" />
                      <span className="text-sm">@diocca.id</span>
                    </a>
                    <a 
                      href="https://www.tiktok.com/@diocca?_r=1&_t=ZS-91ArPyD3XyG"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      <span className="text-sm">@diocca</span>
                    </a>
                    <a 
                      href="https://shopee.co.id/diocca.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-orange-50 transition-colors border border-gray-200"
                    >
                      <ShoppingBag className="h-5 w-5 text-orange-600" />
                      <span className="text-sm">Shopee Store</span>
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">BATANGHARI RIVER</p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href="https://www.instagram.com/batanghaririver?igsh=MXFtMmdqenlmNjh4cQ=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-pink-50 transition-colors border border-gray-200"
                    >
                      <Instagram className="h-5 w-5 text-pink-600" />
                      <span className="text-sm">@batanghaririver</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.1981895044096!2d103.56312927501392!3d-1.6328669983519501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e25876cfb90b0f7%3A0xab74201606701a6f!2sCV.%20Agrotech%20Sumatera%20Mandiri!5e0!3m2!1sid!2sid!4v1762434525450!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="mb-8">KIRIM PESAN</h2>
              
              {status && (
                <div className={`mb-6 p-4 rounded-lg ${
                  status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {status.message}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nama Depan</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Masukkan nama depan" 
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Masukkan nama belakang"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+62 812 3456 7890"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subjek</Label>
                  <Input 
                    id="subject" 
                    placeholder="Perihal pesan Anda"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tulis pesan Anda di sini..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Mengirim...' : 'KIRIM PESAN'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
