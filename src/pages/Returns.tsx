import { Layout } from "@/components/layout/Layout";

const Returns = () => {
  return (
    <Layout>
      <div className="container-narrow section-padding">
        <h1 className="text-3xl font-display font-bold mb-4">
          Returns & Exchanges
        </h1>

        <p className="text-muted-foreground mb-4">
          As our products are handmade, returns are accepted only for damaged or
          incorrect items.
        </p>

        <ul className="list-disc ml-6 text-muted-foreground space-y-2">
          <li>Contact us within 48 hours of delivery</li>
          <li>Provide unboxing photos</li>
          <li>Refunds processed within 5–7 days</li>
        </ul>
      </div>
    </Layout>
  );
};

export default Returns;
