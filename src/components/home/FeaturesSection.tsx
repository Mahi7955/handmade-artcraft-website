import { motion } from "framer-motion";
import { Heart, Gift, Truck, Sparkles } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every stitch is crafted with care by skilled artisans.",
    color: "bg-primary/15 text-primary",
  },
  {
    icon: Gift,
    title: "Gift Ready",
    description: "Beautifully wrapped and perfect for gifting.",
    color: "bg-tertiary/15 text-tertiary-foreground",
  },
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Free shipping on orders above ₹500.",
    color: "bg-secondary/15 text-secondary-foreground",
  },
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Only the finest yarns and materials.",
    color: "bg-accent text-accent-foreground",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="section-padding bg-muted/40 cozy-pattern">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="badge-handmade">Why Choose Us</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-4">
            Crafted with Care
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-card rounded-3xl p-6 border border-border/40 shadow-soft hover:shadow-card transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
