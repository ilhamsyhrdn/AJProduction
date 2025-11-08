import { ShoppingCart, Search, Menu, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signIn, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenProfile: () => void;
}

export function Header({ currentPage, onNavigate, onOpenSearch, onOpenCart, onOpenProfile }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const navItems = [
    { label: "HOME", value: "home", href: "/" },
    { label: "ABOUT", value: "about", href: "/about" },
    { label: "PRODUCT", value: "products", href: "/products" },
    { label: "CONTACT", value: "contact", href: "/contact" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex-1 lg:flex-initial text-center lg:text-left">
            <Link 
              href="/"
              className="flex items-center gap-2 tracking-wider hover:text-gray-600 transition-colors mx-auto lg:mx-0"
            >
              <img 
                src="/gambarProduct/Logo.jpg" 
                alt="AJ Product Logo" 
                className="h-10 w-10 object-contain rounded-full"
              />
              <span className="font-semibold">AJProduction</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.value}
                href={item.href}
                className={`hover:text-gray-600 transition-colors ${
                  router.pathname === item.href ? "border-b-2 border-black" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden lg:flex"
              onClick={onOpenSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* User Avatar or Login Button */}
            {session ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                        <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onOpenProfile}>
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push('/account/orders')}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Desktop Logout Button - Always Visible */}
                <Button 
                  variant="outline"
                  size="sm"
                  className="hidden lg:flex text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => router.push('/auth/signin')}
                className="hidden lg:flex"
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onOpenCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-8">
            {navItems.map((item) => (
              <Link
                key={item.value}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-left py-2 hover:text-gray-600 transition-colors ${
                  router.pathname === item.href ? "border-l-2 border-black pl-2" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                onOpenSearch();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-gray-600 transition-colors"
            >
              SEARCH
            </button>
            
            {/* Auth Section for Mobile */}
            <div className="pt-4 border-t space-y-2">
              {session ? (
                <>
                  <div className="pb-2 border-b">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left py-2 hover:text-gray-600 transition-colors flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left py-2 hover:text-gray-600 transition-colors flex items-center"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="text-left py-2 hover:text-red-600 transition-colors flex items-center w-full text-red-600 font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/auth/signin');
                  }}
                  className="text-left py-2 hover:text-gray-600 transition-colors flex items-center w-full font-medium"
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
