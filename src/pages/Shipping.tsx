import { Layout } from "@/components/layout/Layout";

const Shipping = () => {
  return (
    <Layout>
      <div className="container-narrow section-padding">
        <h1 className="text-3xl font-display font-bold mb-4">
          Shipping Information
        </h1>

        <ul className="space-y-3 text-muted-foreground">
          <li>📦 Orders ship within 2–4 business days</li>
          <li>🚚 Free shipping on orders above ₹500</li>
          <li>🇮🇳 Currently shipping within India</li>
          <li>⏱ Delivery takes 3–7 business days</li>
        </ul>
      </div>
    </Layout>
  );
};

export default Shipping;
