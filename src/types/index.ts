// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: ProductCategory;
  stock: number;
  codAvailable: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 
  | "crochet" 
  | "knitting" 
  | "yarn-art" 
  | "handmade-gifts";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  "crochet": "Crochet",
  "knitting": "Knitting",
  "yarn-art": "Yarn Art",
  "handmade-gifts": "Handmade Gifts"
};

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "online" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

// User types
export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: "customer" | "admin";
  shippingAddresses: ShippingAddress[];
  createdAt: Date;
}
