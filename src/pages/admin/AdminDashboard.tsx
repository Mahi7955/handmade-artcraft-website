import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { TrendingUp, DollarSign, ShoppingBag, Package, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { Product, Order } from "@/types";

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products
    const productsUnsubscribe = onSnapshot(
      query(collection(db, "products")),
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsData);
      }
    );

    // Fetch orders
    const ordersUnsubscribe = onSnapshot(
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

    return () => {
      productsUnsubscribe();
      ordersUnsubscribe();
    };
  }, []);

  const totalRevenue = orders
    .filter(o => o.orderStatus !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  
  const onlineRevenue = orders
    .filter(o => o.paymentMethod === "online" && o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);
  
  const codRevenue = orders
    .filter(o => o.paymentMethod === "cod" && o.orderStatus === "delivered")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.orderStatus === "pending").length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 5).length;

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-secondary-foreground bg-secondary/30",
    },
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-tertiary-foreground bg-tertiary/30",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: TrendingUp,
      color: "text-accent-foreground bg-accent",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">
          Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-4 md:p-6"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl md:text-3xl font-display font-bold">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Breakdown */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-6">
              Revenue Breakdown
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm">Online Payments</span>
                </div>
                <span className="font-semibold">₹{onlineRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-sm">Cash on Delivery</span>
                </div>
                <span className="font-semibold">₹{codRevenue.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="font-display font-bold text-primary">
                  ₹{totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-6">
              Recent Orders
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {order.orderStatus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No orders yet
              </p>
            )}
          </div>

          {/* Inventory Alert */}
          {lowStockProducts > 0 && (
            <div className="bg-destructive/10 rounded-2xl border border-destructive/20 p-6">
              <h2 className="font-display text-lg font-semibold text-destructive mb-2">
                Low Stock Alert
              </h2>
              <p className="text-sm text-destructive/80">
                {lowStockProducts} product{lowStockProducts !== 1 ? "s" : ""} have less than 5 items in stock.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
