import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { Shield, User } from "lucide-react";

export default function SignIn() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Image 
                  src="/gambarProduct/Logo.jpg" 
                  alt="AJ Production Logo" 
                  width={80}
                  height={80}
                  className="h-20 w-20 object-contain rounded-full"
                  priority
                />
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-2">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Login Customer</h1>
            <p className="text-gray-600 mt-2">Masuk untuk mulai berbelanja</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 py-6"
            >
              <FcGoogle className="w-6 h-6" />
              <span className="font-medium">Masuk dengan Google</span>
            </Button>

            {/* Facebook login removed per request */}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">atau</span>
            </div>
          </div>

          {/* Admin Login Link */}
          <Button
            onClick={() => router.push('/admin/login')}
            variant="outline"
            className="w-full flex items-center justify-center gap-3 border-black hover:bg-black hover:text-white py-6"
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Login sebagai Admin</span>
          </Button>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-8">
            Dengan masuk, Anda menyetujui{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Syarat &amp; Ketentuan
            </Link>{" "}
            dan{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Kebijakan Privasi
            </Link>{" "}
            kami
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
