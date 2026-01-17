import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const Categories = () => {
  const { categories, loading } = useCategories();

  return (
    <Layout>
      <div className="container-wide section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Shop by Category
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our handcrafted fiber art collections, each piece made with love and care.
          </p>
        </motion.div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-muted animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  to={`/shop?category=${category.slug}`}
                  className="group relative block overflow-hidden rounded-2xl bg-card shadow-soft hover:shadow-card transition"
                >
                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                    <h3 className="font-display text-base sm:text-lg md:text-xl font-semibold leading-tight">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="mt-1 text-xs sm:text-sm text-white/80 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <span className="mt-2 inline-block text-xs sm:text-sm font-medium bg-primary/90 px-3 py-1 rounded-full">
                      Browse →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <p className="text-muted-foreground text-lg">
              No categories available yet.
            </p>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center bg-secondary/40 rounded-2xl p-8"
        >
          <h2 className="font-display text-xl sm:text-2xl font-bold mb-3">
            Can’t find what you’re looking for?
          </h2>
          <p className="text-muted-foreground mb-6">
            We accept custom orders and handmade requests.
          </p>
          <Link
            to="/shop"
            className="btn-primary inline-flex items-center justify-center"
          >
            View All Products
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Categories;
