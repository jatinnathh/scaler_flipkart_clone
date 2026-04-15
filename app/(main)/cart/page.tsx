"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/utils";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiTag } from "react-icons/fi";

export default function CartPage() {
  const { items, cartCount, subtotal, discount, shippingFee, total, savings, loading, updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  if (loading) {
    return (
      <div className="container-fk py-4">
        <div className="skeleton w-full h-[600px] rounded" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-fk py-4">
        <div className="card empty-state">
          <FiShoppingBag size={80} className="text-flipkart-text-secondary" />
          <h3 className="text-xl font-semibold mt-4">Your cart is empty!</h3>
          <p>Add items to your cart to see them here.</p>
          <Link href="/" className="btn btn-primary mt-4 no-underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fk py-4">
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        {/* Cart Items */}
        <div className="card">
          <div className="p-4 border-b border-flipkart-border">
            <h1 className="text-lg font-semibold">My Cart ({cartCount})</h1>
          </div>

          <div className="divide-y divide-flipkart-border/50">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex gap-4">
                {/* Image */}
                <Link href={`/product/${item.product_slug}`} className="shrink-0">
                  <img
                    src={item.product_image || "https://via.placeholder.com/120"}
                    alt={item.product_name}
                    className="w-24 h-24 object-contain rounded"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product_slug}`} className="text-sm text-flipkart-text hover:text-flipkart-primary no-underline line-clamp-2 font-medium">
                    {item.product_name}
                  </Link>
                  {item.brand && <p className="text-xs text-flipkart-text-secondary mt-0.5">{item.brand}</p>}

                  <div className="price-block mt-2">
                    <span className="price-current text-base">{formatPrice(item.price)}</span>
                    {item.mrp > item.price && (
                      <>
                        <span className="price-mrp text-sm">{formatPrice(item.mrp)}</span>
                        <span className="price-discount text-sm">{item.discount_percent}% off</span>
                      </>
                    )}
                  </div>

                  {/* Quantity + Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        disabled={item.quantity >= item.stock_quantity}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        removeItem(item.id);
                        showToast("Item removed from cart", "info");
                      }}
                      className="text-sm font-semibold text-flipkart-text-secondary hover:text-flipkart-red transition uppercase"
                    >
                      Remove
                    </button>
                  </div>

                  {item.stock_quantity <= 5 && item.stock_quantity > 0 && (
                    <p className="stock-warning mt-2 text-xs">Only {item.stock_quantity} left!</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Place Order Button (bottom of items on mobile) */}
          <div className="p-4 border-t border-flipkart-border lg:hidden">
            <button onClick={() => router.push("/checkout")} className="btn btn-buy w-full py-3 text-base">
              PLACE ORDER
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="lg:sticky lg:top-28 self-start">
          <div className="card">
            <div className="p-4 border-b border-flipkart-border">
              <h2 className="text-sm font-semibold text-flipkart-text-secondary uppercase tracking-wider">
                Price Details
              </h2>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Price ({cartCount} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-flipkart-green">
                <span>Discount</span>
                <span>−{formatPrice(discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className={shippingFee === 0 ? "text-flipkart-green" : ""}>
                  {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                </span>
              </div>
              <hr className="border-dashed" />
              <div className="flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
              {savings > 0 && (
                <p className="text-flipkart-green font-semibold text-sm flex items-center gap-1">
                  <FiTag size={14} /> You save {formatPrice(savings)} on this order
                </p>
              )}
            </div>
            <div className="p-4 border-t border-flipkart-border hidden lg:block">
              <button onClick={() => router.push("/checkout")} className="btn btn-buy w-full py-3 text-base">
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
