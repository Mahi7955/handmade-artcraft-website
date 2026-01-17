import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      {/* Background */}
      <img
        src={heroBg}
        alt="Handmade Fiber Art"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="relative z-10 container-wide pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl text-left text-white"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 bg-white/90 text-foreground text-xs rounded-full">
            <Heart className="h-3.5 w-3.5 text-primary fill-current" />
            Handcrafted with Love
          </span>

          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            Cozy <span className="text-gradient">Handmade</span> Treasures
          </h1>

          <p className="mt-6 text-white/90 text-base md:text-lg leading-relaxed">
            Discover adorable crochet keychains, amigurumi toys, and handwoven
            macramé pieces. Each creation brings warmth and artisanal charm to
            your everyday life.
          </p>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Link to="/shop">
              <Button className="btn-primary gap-2">
                Explore Collection <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" className="btn-secondary bg-white/90">
                Our Story
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex gap-6 text-sm text-white/80 flex-wrap">
            <span>● 100% Handmade</span>
            <span>● Premium Yarn</span>
            <span>● Free Shipping ₹500+</span>
          </div>
        </motion.div>

        {/* Floating card (hidden on small screens) */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="hidden md:flex absolute bottom-16 right-16 bg-white rounded-2xl p-4 shadow-card gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">500+</p>
            <p className="text-sm text-muted-foreground">Happy Customers</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
