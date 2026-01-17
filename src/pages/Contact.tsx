import { Layout } from "@/components/layout/Layout";

const Contact = () => {
  return (
    <Layout>
      <div className="container-narrow section-padding">
        <h1 className="text-3xl font-display font-bold mb-4">Contact Us</h1>

        <p className="text-muted-foreground mb-6">
          We'd love to hear from you! Reach out anytime.
        </p>

        <div className="space-y-3">
          <p><strong>Email:</strong> hello@lavme.art</p>
          <p><strong>Instagram:</strong> @lavme.fiberart</p>
          <p><strong>Pinterest:</strong> @lavmefiberart</p>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
