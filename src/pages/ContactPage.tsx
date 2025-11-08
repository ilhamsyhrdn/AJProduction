import { Button } from "../../client/components/ui/button";
import { Input } from "../../client/components/ui/input";
import { Label } from "../../client/components/ui/label";
import { Textarea } from "../../client/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function ContactPage() {
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

              {/* Map Placeholder */}
              <div className="mt-8 aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.2236789!2d103.6167!3d-1.6167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e258851e2b2b2b1%3A0x1234567890abcdef!2sJl.%20Sersan%20Anwar%20Bay%2C%20Bagan%20Pete%2C%20Kec.%20Alam%20Barajo%2C%20Kota%20Jambi%2C%20Jambi%2036361!5e0!3m2!1sid!2sid!4v1234567890123!5m2!1sid!2sid"
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
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nama Depan</Label>
                    <Input id="firstName" placeholder="Masukkan nama depan" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input id="lastName" placeholder="Masukkan nama belakang" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input id="phone" type="tel" placeholder="+62 812 3456 7890" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subjek</Label>
                  <Input id="subject" placeholder="Perihal pesan Anda" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tulis pesan Anda di sini..."
                    rows={6}
                  />
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  KIRIM PESAN
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
