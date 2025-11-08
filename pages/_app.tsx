import type { AppProps } from 'next/app';
import { useState, Component, ErrorInfo, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import '@/client/styles/globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchSheet } from '@/components/SearchSheet';
import { CartSheet } from '@/components/CartSheet';
import { ProfileSheet } from '@/components/ProfileSheet';

type Page = "home" | "products" | "about" | "contact";

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Check if current page is admin page
  const isAdminPage = router.pathname.startsWith('/admin');

  const getCurrentPage = (): Page => {
    const path = router.pathname;
    if (path === '/') return 'home';
    if (path === '/products') return 'products';
    if (path === '/about') return 'about';
    if (path === '/contact') return 'contact';
    return 'home';
  };

  const handleNavigate = (page: string) => {
    const routes: Record<string, string> = {
      'home': '/',
      'products': '/products',
      'about': '/about',
      'contact': '/contact'
    };
    router.push(routes[page] || '/');
  };

  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <div className="min-h-screen">
          {/* Hide Header and Footer for admin pages */}
          {!isAdminPage && (
            <Header
              currentPage={getCurrentPage()}
              onNavigate={handleNavigate}
              onOpenSearch={() => setSearchOpen(true)}
              onOpenCart={() => setCartOpen(true)}
              onOpenProfile={() => setProfileOpen(true)}
            />
          )}
          
          <main>
            <Component {...pageProps} />
          </main>
          
          {!isAdminPage && <Footer />}

          {/* These are only for non-admin pages */}
          {!isAdminPage && (
            <>
              <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
              <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
              <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
            </>
          )}
          
          {/* Toast Notifications */}
          <Toaster position="top-center" richColors />
        </div>
      </SessionProvider>
    </ErrorBoundary>
  );
}
