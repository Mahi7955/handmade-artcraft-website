import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import logo from "@/assets/logo.png";
import { useCategories } from "@/hooks/useCategories";

export const Footer = () => {
  const { categories } = useCategories();

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container-wide py-10 md:py-16">
        
        {/* MAIN GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          
          {/* BRAND */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src={logo}
                alt="LavMe Fiber Art"
                className="h-10 md:h-12 w-auto"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Handcrafted with love. Each piece tells a story of tradition,
              creativity, and the warmth of handmade artistry.
            </p>
          </div>

          {/* SHOP */}
          <div>
            <h4 className="font-display text-base md:text-lg font-semibold mb-3">
              Shop
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/shop?category=${category.slug}`}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/shop"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* HELP */}
          <div>
            <h4 className="font-display text-base md:text-lg font-semibold mb-3">
              Help
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="footer-link">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="footer-link">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="footer-link">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* CONNECT */}
          <div>
            <h4 className="font-display text-base md:text-lg font-semibold mb-3">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>hello@lavme.art</li>
              <li>Instagram: @lavme.fiberart</li>
              <li>Pinterest: @lavmefiberart</li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-muted-foreground">
            © 2024 LavMe – Fiber Art. All rights reserved.
          </p>
          <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
            Made with{" "}
            <Heart className="h-4 w-4 text-primary fill-primary" /> by artisan hands
          </p>
        </div>
      </div>
    </footer>
  );
};
