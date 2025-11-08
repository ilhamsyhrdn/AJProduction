import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  MessageSquare,
  Mail,
  Inbox,
  Archive
} from 'lucide-react';

export default function AdminMessages() {
  const router = useRouter();
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast.success('Berhasil logout');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Logo and Logout */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AJ Production</h1>
              <p className="text-sm text-gray-500 mt-0.5">Admin Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Navigation Horizontal */}
          <nav className="flex items-center gap-3 overflow-x-auto pb-2">
            <Link href="/admin/dashboard">
              <div className="px-6 py-3 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-md hover:bg-black hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 min-w-fit">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </div>
            </Link>

            <Link href="/admin/orders">
              <div className="px-6 py-3 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-md hover:bg-black hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 min-w-fit">
                <ShoppingCart className="h-5 w-5" />
                Orders
              </div>
            </Link>

            <Link href="/admin/products">
              <div className="px-6 py-3 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-md hover:bg-black hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 min-w-fit">
                <Package className="h-5 w-5" />
                Products
              </div>
            </Link>

            <Link href="/admin/messages">
              <div className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 min-w-fit">
                <MessageSquare className="h-5 w-5" />
                Messages
              </div>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content - Spacing to prevent overlap with sticky header */}
      <main className="max-w-7xl mx-auto px-6 py-8" style={{ marginTop: '0' }}>
        <div className="mb-6 pt-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Messages</h2>
          <p className="text-gray-600">Kelola pesan dari pelanggan</p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Mail className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Messages Coming Soon</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Fitur pesan akan segera hadir. Anda akan dapat melihat dan membalas pesan dari pelanggan di sini.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Inbox className="h-4 w-4" />
                  Inbox
                </div>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Archive className="h-4 w-4" />
                  Archived
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
