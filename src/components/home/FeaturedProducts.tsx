import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";

interface FeaturedProductsProps {
  products: Product[];
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  return (
    <section className="section-padding bg-accent/30 cozy-pattern">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-14"
        >
          <div>
            <span className="badge-handmade">
              <Heart className="h-3.5 w-3.5 fill-current" />
              Most Loved
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4">
              Featured Creations
            </h2>
            <p className="mt-3 text-muted-foreground">
              Our most cherished handmade pieces, chosen just for you.
            </p>
          </div>

          <Link to="/shop">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Button variant="outline" className="btn-secondary gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-card rounded-3xl border border-border/40 shadow-soft"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">
              Featured products coming soon!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};
