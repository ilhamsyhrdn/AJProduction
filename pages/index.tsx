import { Hero } from "@/components/Hero";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { CategorySection } from "@/components/CategorySection";
import { Newsletter } from "@/components/Newsletter";
import { SearchSheet } from "@/components/SearchSheet";
import { CartSheet } from "@/components/CartSheet";
import { ProfileSheet } from "@/components/ProfileSheet";
import { useState } from "react";

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <Hero />
      <FeaturedProducts />
      <CategorySection />
      <Newsletter />
      
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
