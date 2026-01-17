import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { 
  Package, 
  CheckCircle, 
  Truck, 
  Home, 
  Clock, 
  XCircle,
  ArrowLeft,
  MapPin,
  CreditCard,
  Loader2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Order, OrderStatus, ORDER_STATUS_LABELS } from "@/types";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const STATUS_STEPS: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="h-5 w-5" />,
  confirmed: <CheckCircle className="h-5 w-5" />,
  shipped: <Truck className="h-5 w-5" />,
  delivered: <Home className="h-5 w-5" />,
  cancelled: <XCircle className="h-5 w-5" />,
};

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/order/${orderId}` } } });
      return;
    }

    if (!orderId) {
      setError("Order ID not found");
      setLoading(false);
      return;
    }

    // Real-time listener for order updates
    const unsubscribe = onSnapshot(
      doc(db, "orders", orderId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          
          // Check if order belongs to current user
          if (data.userId !== user.uid) {
            setError("You don't have access to this order");
            setLoading(false);
            return;
          }

          setOrder({
            id: docSnapshot.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Order);
          setError(null);
        } else {
          setError("Order not found");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId, user, authLoading, navigate]);

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    if (order.orderStatus === "cancelled") return -1;
    return STATUS_STEPS.indexOf(order.orderStatus);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="container-narrow section-padding flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container-narrow section-padding text-center">
          <div className="max-w-md mx-auto">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Oops!</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/account/orders">
              <Button>View My Orders</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) return null;

  const currentStep = getCurrentStepIndex();
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <Layout>
      <div className="container-wide section-padding">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/account/orders")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Track Order
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Order ID: <span className="font-mono">{orderId}</span>
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Status Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-6">
                  Order Status
                </h2>

                {isCancelled ? (
                  <div className="flex items-center gap-4 p-4 bg-destructive/10 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold text-destructive">Order Cancelled</p>
                      <p className="text-sm text-muted-foreground">
                        This order has been cancelled
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Progress line */}
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border" />
                    <div 
                      className="absolute left-6 top-6 w-0.5 bg-primary transition-all duration-500"
                      style={{ 
                        height: `calc(${(currentStep / (STATUS_STEPS.length - 1)) * 100}% - 24px)` 
                      }}
                    />

                    {/* Steps */}
                    <div className="space-y-8">
                      {STATUS_STEPS.map((status, index) => {
                        const isCompleted = index <= currentStep;
                        const isCurrent = index === currentStep;

                        return (
                          <motion.div
                            key={status}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-start gap-4"
                          >
                            <div
                              className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                            >
                              {STATUS_ICONS[status]}
                            </div>
                            <div className="pt-2">
                              <p
                                className={`font-medium ${
                                  isCompleted ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {ORDER_STATUS_LABELS[status]}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {status === "pending" && "Order is being processed"}
                                {status === "confirmed" && "Order confirmed by seller"}
                                {status === "shipped" && "Package is on the way"}
                                {status === "delivered" && "Package delivered successfully"}
                              </p>
                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary">
                                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                  Current Status
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-6">
                  Order Items ({order.items.length})
                </h2>

                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-primary font-semibold">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Details Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Payment Info */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-semibold">Payment</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium">
                      {order.paymentMethod === "online" ? "Online Payment" : "Cash on Delivery"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={`font-medium ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : order.paymentStatus === "failed"
                          ? "text-destructive"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {order.shippingCost === 0 ? "Free" : `₹${order.shippingCost}`}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-primary">₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-semibold">Shipping Address</h3>
                </div>

                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.addressLine1}
                  </p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="text-muted-foreground">
                      {order.shippingAddress.addressLine2}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  <p className="text-muted-foreground">
                    Phone: {order.shippingAddress.phone}
                  </p>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-muted/50 rounded-2xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Need help with your order?
                </p>
                <Link to="/about">
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default OrderTracking;
