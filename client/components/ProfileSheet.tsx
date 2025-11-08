import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { User, Package, LogOut, ShoppingCart } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  const handleLogout = () => {
    onOpenChange(false);
    signOut({ callbackUrl: '/' });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>My Account</SheetTitle>
        </SheetHeader>
        
        {session ? (
          <>
            {/* User Info */}
            <div className="mt-6 flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                <AvatarFallback className="text-lg">{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-lg">{session.user?.name}</p>
                <p className="text-sm text-gray-500">{session.user?.email}</p>
              </div>
            </div>

            {/* Quick Menu */}
            <div className="mt-8">
              <h3 className="mb-4 font-semibold text-gray-700">Quick Menu</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigate('/account')}
                  className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => handleNavigate('/account/orders')}
                  className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>My Orders</span>
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8 pt-8 border-t">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-gray-600 text-center">Please sign in to access your account</p>
            <Button
              onClick={() => handleNavigate('/auth/signin')}
              className="w-full"
            >
              <User className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
