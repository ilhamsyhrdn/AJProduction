import { ImageWithFallback } from "../../client/components/figma/ImageWithFallback";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  category?: string;
  link?: string;
}

export function ProductCard({ image, name, price, category, link }: ProductCardProps) {
  const handleClick = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className={`group ${link ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="aspect-square overflow-hidden mb-4 bg-gray-100 relative">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {link && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <div className="bg-white rounded-full p-2.5 shadow-lg">
              <ShoppingBag className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        )}
      </div>
      {category && (
        <p className="text-gray-500 text-sm mb-1">{category}</p>
      )}
      <h3 className="mb-2">{name}</h3>
      <div className="flex items-center justify-between">
        <p className="text-gray-900">{price}</p>
        {link && (
          <span className="text-xs text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Beli di Shopee →
          </span>
        )}
      </div>
    </div>
  );
}
