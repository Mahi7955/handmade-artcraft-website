import { Layout } from "@/components/layout/Layout";

const FAQ = () => {
  return (
    <Layout>
      <div className="container-wide section-padding max-w-3xl">
        <h1 className="text-3xl font-display font-bold mb-6">FAQ</h1>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Are products handmade?</h3>
            <p className="text-muted-foreground">
              Yes! Every LavMe product is 100% handcrafted.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Is COD available?</h3>
            <p className="text-muted-foreground">
              Yes, Cash on Delivery is available on selected products.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
