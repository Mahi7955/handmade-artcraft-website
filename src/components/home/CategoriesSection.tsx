import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ImageIcon } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export const CategoriesSection = () => {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-14">
            <div className="h-8 w-32 bg-muted animate-pulse rounded-full mx-auto" />
            <div className="h-10 w-64 bg-muted animate-pulse rounded mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="badge-handmade">Collections</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-4">
            Shop by Category
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Explore our handcrafted collections, each piece made with love and attention to detail.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={index}
            >
              <Link
                to={`/shop?category=${category.slug}`}
                className="group block relative aspect-[4/5] rounded-3xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-500"
              >
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <h3 className="font-display text-xl font-semibold text-white">
                    {category.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-white/90 text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Explore <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
