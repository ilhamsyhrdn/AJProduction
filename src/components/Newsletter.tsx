import { Button } from "../../client/components/ui/button";
import { Input } from "../../client/components/ui/input";
import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ type: 'success', message: data.message });
        setEmail('');
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
    <section className="py-16 lg:py-24 text-white" style={{ backgroundColor: '#036635' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="mb-4 text-white">BERGABUNG DENGAN KAMI</h2>
          <p className="mb-8 text-gray-300">
            Dapatkan informasi promo, tips produk, dan penawaran eksklusif langsung ke email Anda
          </p>
          
          {status && (
            <div className={`mb-4 p-3 rounded-lg ${
              status.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Masukkan email Anda"
              className="bg-white text-black flex-1"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit"
              className="bg-white text-black hover:bg-gray-100 px-8"
              disabled={loading}
            >
              {loading ? 'MEMPROSES...' : 'DAFTAR'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
