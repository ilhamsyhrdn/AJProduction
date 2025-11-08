import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, User } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'AJProduct@admin';
    const ADMIN_PASSWORD = 'AJ1964';

    if (formData.email !== ADMIN_EMAIL || formData.password !== ADMIN_PASSWORD) {
      toast.error('Email atau password salah!');
      return;
    }

    setLoading(true);

    try {
      // Store admin session in localStorage
      localStorage.setItem('adminSession', JSON.stringify({
        email: ADMIN_EMAIL,
        role: 'admin',
        name: 'AJ Production Admin',
        loginTime: new Date().toISOString()
      }));

      toast.success('Login berhasil! Selamat datang Admin');
      router.push('/admin/dashboard');
    } catch {
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-600">AJ Production Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Admin Email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Masukkan email admin"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Login sebagai Admin'}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              🔒 Halaman ini hanya untuk Administrator AJ Production
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6 space-y-2">
          <button
            onClick={() => router.push('/auth/signin')}
            className="block w-full text-sm text-gray-600 hover:text-black transition-colors"
          >
            ← Login sebagai Customer
          </button>
          <button
            onClick={() => router.push('/')}
            className="block w-full text-sm text-gray-500 hover:text-black transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
