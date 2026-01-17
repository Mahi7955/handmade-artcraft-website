import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { Package, ChevronDown } from "lucide-react";
import { db } from "@/lib/firebase";
import { Order, OrderStatus, ORDER_STATUS_LABELS } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "orders"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Order[];
        setOrders(ordersData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updates: any = { orderStatus: status };
      
      // If COD order is delivered, mark payment as paid
      const order = orders.find(o => o.id === orderId);
      if (order?.paymentMethod === "cod" && status === "delivered") {
        updates.paymentStatus = "paid";
      }

      await updateDoc(doc(db, "orders", orderId), updates);
      toast.success("Order status updated");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "delivered": return "bg-secondary text-secondary-foreground";
      case "shipped": return "bg-tertiary text-tertiary-foreground";
      case "confirmed": return "bg-primary/20 text-primary";
      case "cancelled": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">
          Orders
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-2xl border border-border p-4 md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <p className="font-mono text-sm font-medium">
                        #{order.id.slice(0, 12)}
                      </p>
                      <Badge className={getStatusColor(order.orderStatus)}>
                        {ORDER_STATUS_LABELS[order.orderStatus]}
                      </Badge>
                      <Badge variant="outline">
                        {order.paymentMethod === "cod" ? "COD" : "Online"}
                      </Badge>
                      {order.paymentStatus === "paid" && (
                        <Badge variant="secondary">Paid</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} • 
                      ₹{order.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.shippingAddress.fullName} • {order.shippingAddress.city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={order.orderStatus}
                      onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(status => (
                          <SelectItem key={status} value={status}>
                            {ORDER_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        )}
      </motion.div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Order #{selectedOrder?.id.slice(0, 12)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Status */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(selectedOrder.orderStatus)}>
                  {ORDER_STATUS_LABELS[selectedOrder.orderStatus]}
                </Badge>
                <Badge variant="outline">
                  {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                </Badge>
                <Badge variant={selectedOrder.paymentStatus === "paid" ? "secondary" : "outline"}>
                  {selectedOrder.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                </Badge>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₹{(item.quantity * item.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <div className="bg-muted/50 rounded-xl p-4 text-sm">
                  <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                  <p className="mt-2">
                    {selectedOrder.shippingAddress.addressLine1}
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <>, {selectedOrder.shippingAddress.addressLine2}</>
                    )}
                  </p>
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {selectedOrder.shippingCost === 0 ? "Free" : `₹${selectedOrder.shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
