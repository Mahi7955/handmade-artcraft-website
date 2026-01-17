import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <Layout>
      <div className="container-narrow section-padding text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary/20 flex items-center justify-center"
          >
            <CheckCircle className="h-12 w-12 text-secondary-foreground" />
          </motion.div>

          <h1 className="font-display text-3xl font-bold mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We've received it and will begin crafting 
            your handmade treasures with love.
          </p>

          {orderId && (
            <div className="bg-muted/50 rounded-xl p-4 mb-8">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono font-medium text-sm break-all">{orderId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/order/${orderId}`}>
              <Button variant="outline" className="gap-2">
                <Package className="h-4 w-4" />
                Track Order
              </Button>
            </Link>
            <Link to="/shop">
              <Button className="btn-primary gap-2">
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
