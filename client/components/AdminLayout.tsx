import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Mail, 
  LogOut, 
  Shield,
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
      return;
    }
    setAdminSession(JSON.parse(session));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast.success('Logout berhasil');
    router.push('/admin/login');
  };

  const menuItems = [
    { 
      href: '/admin/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      active: router.pathname === '/admin/dashboard'
    },
    { 
      href: '/admin/orders', 
      icon: ShoppingCart, 
      label: 'Pesanan',
      active: router.pathname.startsWith('/admin/orders')
    },
    { 
      href: '/admin/products', 
      icon: Package, 
      label: 'Produk',
      active: router.pathname.startsWith('/admin/products')
    },
    { 
      href: '/admin/messages', 
      icon: Mail, 
      label: 'Pesan',
      active: router.pathname.startsWith('/admin/messages')
    },
  ];

  if (!adminSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo & Menu Toggle */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <h1 className="text-xl font-bold hidden sm:block">AJ Production Admin</h1>
                <h1 className="text-xl font-bold sm:hidden">Admin</h1>
              </div>
            </div>

            {/* Right: User Info & Logout */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" target="_blank">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Website</span>
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Administrator</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {sidebarOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        item.active
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {title && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold">{title}</h2>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
