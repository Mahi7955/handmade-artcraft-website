import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
}) => {
  const { addToCart } = useCart();

  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;

  const displayPrice = product.discountPrice ?? product.price;

  const discountPercent = hasDiscount
    ? Math.round((1 - product.discountPrice! / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group card-artisan bg-card rounded-2xl overflow-hidden border border-border"
    >
      {/* IMAGE */}
      <Link
        to={`/product/${product.id}`}
        className="block relative aspect-square overflow-hidden"
      >
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive">-{discountPercent}%</Badge>
          )}
          {product.codAvailable && (
            <Badge variant="secondary">COD</Badge>
          )}
        </div>

        {/* Wishlist (desktop only) */}
        <div className="hidden sm:block absolute top-2 right-2">
          <Button size="icon" variant="secondary" className="rounded-full">
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Out of stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="font-semibold text-muted-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* CONTENT */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-base font-semibold line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {product.description}
        </p>

        {/* PRICE */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold text-primary">
            ₹{displayPrice}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.price}
            </span>
          )}
        </div>

        {/* ADD BUTTON – FIXED FOR MOBILE */}
        <Button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className="w-full mt-3 rounded-xl btn-primary"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};
