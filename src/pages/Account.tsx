import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { User, Package, LogOut, ChevronRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Order, ORDER_STATUS_LABELS } from "@/types";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Account = () => {
  const navigate = useNavigate();
  const { user, userProfile, logout, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Order[];

      setOrders(ordersData);
      setOrdersLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container-wide section-padding space-y-4">
          <div className="h-32 bg-muted rounded-2xl animate-pulse" />
          <div className="h-64 bg-muted rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-secondary text-secondary-foreground";
      case "shipped":
        return "bg-tertiary text-tertiary-foreground";
      case "confirmed":
        return "bg-primary/20 text-primary";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="container-wide section-padding">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* ✅ PROFILE CARD (FIXED FOR MOBILE) */}
          <div className="bg-card rounded-2xl border border-border p-4 md:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Profile Info */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="font-display text-lg md:text-2xl font-bold truncate">
                    {userProfile?.displayName ||
                      user?.displayName ||
                      "Welcome"}
                  </h1>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <div className="flex justify-end sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-full px-4"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* ORDERS */}
          <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg md:text-xl font-semibold">
                Your Orders
              </h2>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-muted rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/order/${order.id}`}
                    className="block p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8)}
                          </span>
                          <Badge
                            className={getStatusColor(order.orderStatus)}
                          >
                            {ORDER_STATUS_LABELS[order.orderStatus]}
                          </Badge>
                          <Badge variant="outline">
                            {order.paymentMethod === "cod" ? "COD" : "Paid"}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""} • ₹
                          {order.total.toLocaleString()}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {order.createdAt.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No orders yet
                </p>
                <Link to="/shop">
                  <Button className="btn-primary rounded-full px-6">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Account;
