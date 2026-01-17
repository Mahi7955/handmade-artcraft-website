import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  ArrowLeft,
} from "lucide-react";

import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { useCategoryLabels } from "@/hooks/useCategories";
import { useCart } from "@/contexts/CartContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductReviews } from "@/components/reviews/ProductReviews";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { categoryLabels } = useCategoryLabels();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, "products", id), (docSnap) => {
      if (docSnap.exists()) {
        setProduct({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as Product);
      } else {
        setProduct(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container-wide section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted animate-pulse rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 w-40 bg-muted animate-pulse rounded" />
              <div className="h-12 bg-muted animate-pulse rounded" />
              <div className="h-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-wide section-padding text-center">
          <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate("/shop")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </Layout>
    );
  }

  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;

  const displayPrice = product.discountPrice ?? product.price;

  const discountPercent = hasDiscount
    ? Math.round((1 - product.discountPrice! / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  return (
    <Layout>
      <div className="container-wide section-padding">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name}-${index}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Badge variant="secondary">
              {categoryLabels[product.category] || product.category}
            </Badge>

            <h1 className="font-display text-2xl md:text-4xl font-bold">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold text-primary">
                ₹{displayPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="line-through text-muted-foreground">
                    ₹{product.price}
                  </span>
                  <Badge variant="destructive">-{discountPercent}%</Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {product.stock > 0 ? (
                <span className="text-sm text-secondary-foreground">
                  ✓ In Stock ({product.stock})
                </span>
              ) : (
                <span className="text-sm text-destructive">Out of Stock</span>
              )}
              {product.codAvailable && (
                <Badge variant="outline">COD Available</Badge>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-semibold">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="btn-primary"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="pt-6 border-t space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2 items-center">
                <Truck className="h-5 w-5 text-primary" />
                Free shipping above ₹500
              </div>
              <div className="flex gap-2 items-center">
                <Shield className="h-5 w-5 text-primary" />
                Handcrafted quality guaranteed
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <ProductReviews productId={product.id} />
      </div>
    </Layout>
  );
};

export default ProductDetail;
