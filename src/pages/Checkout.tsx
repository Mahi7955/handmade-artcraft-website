import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { CreditCard, Truck, ArrowLeft, Check, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { ShippingAddress, OrderItem } from "@/types";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shippingCost = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingCost;

  // Check if COD is available for all items
  const codAvailable = items.every(item => item.product.codAvailable);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (field: keyof ShippingAddress) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShippingAddress(prev => ({ ...prev, [field]: e.target.value }));
  };

  const validateForm = () => {
    const required = ["fullName", "phone", "addressLine1", "city", "state", "pincode"] as const;
    for (const field of required) {
      if (!shippingAddress[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return false;
      }
    }
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }
    return true;
  };

  const createOrder = async () => {
    const orderItems: OrderItem[] = items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images[0] || "",
      price: item.product.discountPrice ?? item.product.price,
      quantity: item.quantity,
    }));

    const orderData = {
      userId: user!.uid,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      subtotal,
      shippingCost,
      total,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);
    return docRef.id;
  };

  const handleRazorpayPayment = async (orderId: string) => {
    try {
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: total,
          currency: "INR",
          receipt: orderId,
          notes: {
            orderId,
            userId: user!.uid,
          },
        },
      });

      if (error || !data) {
        throw new Error(error?.message || "Failed to create payment order");
      }

      const { orderId: razorpayOrderId, keyId } = data;

      // Open Razorpay checkout
      const options = {
        key: keyId,
        amount: Math.round(total * 100),
        currency: "INR",
        name: "LavMe Fiber Art",
        description: "Order Payment",
        order_id: razorpayOrderId,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true,
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (verifyError || !verifyData?.verified) {
              throw new Error("Payment verification failed");
            }

            // Update order with payment details
            await updateDoc(doc(db, "orders", orderId), {
              paymentStatus: "paid",
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              updatedAt: serverTimestamp(),
            });

            clearCart();
            toast.success("Payment successful!");
            navigate(`/order-success/${orderId}`);
          } catch (err) {
            console.error("Payment verification error:", err);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },
        theme: {
          color: "#C48B89",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error(response.error.description || "Payment failed");
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }

    if (!validateForm()) return;

    if (paymentMethod === "online" && !razorpayLoaded) {
      toast.error("Payment gateway is loading. Please wait...");
      return;
    }

    setLoading(true);

    try {
      const orderId = await createOrder();

      if (paymentMethod === "online") {
        await handleRazorpayPayment(orderId);
      } else {
        // COD order
        clearCart();
        toast.success("Order placed successfully!");
        navigate(`/order-success/${orderId}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <Layout>
      <div className="container-wide section-padding">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/cart")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Payment */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-6">
                  Shipping Address
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange("fullName")}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange("phone")}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={handleInputChange("addressLine1")}
                      placeholder="House/Flat No., Building Name, Street"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleInputChange("addressLine2")}
                      placeholder="Landmark, Area (Optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange("city")}
                      placeholder="Mumbai"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange("state")}
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleInputChange("pincode")}
                      placeholder="400001"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-6">
                  Payment Method
                </h2>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "online" | "cod")}
                  className="space-y-3"
                >
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "online"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="online" />
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Online Payment</p>
                      <p className="text-sm text-muted-foreground">
                        Pay securely with cards, UPI, or wallets
                      </p>
                    </div>
                    {!razorpayLoaded && paymentMethod === "online" && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      !codAvailable
                        ? "opacity-50 cursor-not-allowed"
                        : paymentMethod === "cod"
                        ? "border-primary bg-primary/5 cursor-pointer"
                        : "border-border hover:border-primary/50 cursor-pointer"
                    }`}
                  >
                    <RadioGroupItem value="cod" disabled={!codAvailable} />
                    <Truck className="h-5 w-5 text-secondary-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        {codAvailable
                          ? "Pay when you receive your order"
                          : "Not available for some items in cart"}
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-card rounded-2xl border border-border p-6">
                <h2 className="font-display text-xl font-semibold mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          ₹{((item.product.discountPrice ?? item.product.price) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-secondary-foreground">Free</span>
                      ) : (
                        `₹${shippingCost}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <div className="flex justify-between font-display text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full mt-6 btn-primary"
                  onClick={handlePlaceOrder}
                  disabled={loading || (paymentMethod === "online" && !razorpayLoaded)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      {paymentMethod === "online" ? "Pay Now" : "Place Order"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Checkout;
