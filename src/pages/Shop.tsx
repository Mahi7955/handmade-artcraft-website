import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { useCategories } from "@/hooks/useCategories";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [codOnly, setCodOnly] = useState(false);

  const { categories, loading: categoriesLoading } = useCategories();

  const categoryParam = searchParams.get("category");
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  useEffect(() => {
    let q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];

      if (selectedCategories.length > 0) {
        productsData = productsData.filter(p =>
          selectedCategories.includes(p.category)
        );
      }

      if (codOnly) {
        productsData = productsData.filter(p => p.codAvailable);
      }

      productsData = productsData.filter(p => {
        const price = p.discountPrice ?? p.price;
        return price >= priceRange[0] && price <= priceRange[1];
      });

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        productsData = productsData.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }

      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategories, codOnly, priceRange, searchQuery]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev =>
      prev.includes(slug)
        ? prev.filter(c => c !== slug)
        : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setCodOnly(false);
    setPriceRange([0, 10000]);
    setSearchParams({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-display font-semibold mb-3">Categories</h4>
        {categoriesLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map(category => (
              <label key={category.id} className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCategories.includes(category.slug)}
                  onCheckedChange={() => toggleCategory(category.slug)}
                />
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-display font-semibold mb-3">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={10000}
          step={100}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <Checkbox
          checked={codOnly}
          onCheckedChange={(v) => setCodOnly(!!v)}
        />
        <span className="text-sm">Cash on Delivery Available</span>
      </label>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="h-4 w-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="container-wide section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Our Collection
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Discover handcrafted fiber art pieces, each made with love.
          </p>
        </motion.div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64">
            <div className="sticky top-24 bg-card rounded-2xl p-6 border">
              <h3 className="font-display text-lg font-semibold mb-6">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            <div className="lg:hidden mb-6 flex justify-between">
              <p className="text-sm text-muted-foreground">
                {products.length} products
              </p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-2xl">
                <p className="text-muted-foreground">
                  No products found.
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
