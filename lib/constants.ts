import {
  FiSmartphone, FiMonitor, FiShoppingBag, FiHome,
  FiBook, FiActivity, FiHeart
} from "react-icons/fi";
import { 
  MdSportsCricket, MdFace
} from "react-icons/md";

export const CATEGORY_ICONS: Record<string, any> = {
  electronics: FiMonitor,
  mobiles: FiSmartphone,
  "fashion-men": FiShoppingBag,
  "fashion-women": FiHeart,
  "home-kitchen": FiHome,
  books: FiBook,
  sports: MdSportsCricket,
  beauty: MdFace,
};

export const FLIPKART_COLORS = {
  primary: "#2874F0",
  primaryDark: "#1a5dc8",
  orange: "#FF9F00",
  yellow: "#FB641B",
  green: "#388E3C",
  red: "#FF6161",
  bg: "#F1F3F6",
  card: "#FFFFFF",
  textPrimary: "#212121",
  textSecondary: "#878787",
  border: "#E0E0E0",
} as const;

export const SORT_OPTIONS = [
  { label: "Relevance", value: "newest" },
  { label: "Price — Low to High", value: "price_asc" },
  { label: "Price — High to Low", value: "price_desc" },
  { label: "Rating", value: "rating" },
  { label: "Discount", value: "discount" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  confirmed: "Order Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  placed: "#2874F0",
  confirmed: "#FF9F00",
  shipped: "#9C27B0",
  out_for_delivery: "#FF6D00",
  delivered: "#388E3C",
  cancelled: "#FF6161",
};

export const BANNER_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=400&fit=crop",
    alt: "Big Sale — Up to 80% Off",
    link: "/search?sortBy=discount",
  },
  {
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=400&fit=crop",
    alt: "Fashion Mega Sale",
    link: "/category/fashion-men",
  },
  {
    url: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400&h=400&fit=crop",
    alt: "Electronics Store — Best Deals",
    link: "/category/electronics",
  },
  {
    url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&h=400&fit=crop",
    alt: "Home & Kitchen Essentials",
    link: "/category/home-kitchen",
  },
];

export const ADDRESS_TYPES = [
  { label: "Home", value: "home" },
  { label: "Work", value: "work" },
  { label: "Other", value: "other" },
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
  "Jammu & Kashmir", "Ladakh",
];
