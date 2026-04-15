"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice } from "@/lib/utils";
import { INDIAN_STATES, ADDRESS_TYPES } from "@/lib/constants";
import { FiMapPin, FiPlus, FiCheck, FiCreditCard } from "react-icons/fi";
import type { Address } from "@/types";

declare global {
  interface Window { Razorpay: any; }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { items, subtotal, discount, shippingFee, total, savings, clearCartLocal, fetchCart } = useCart();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Address, 2: Summary, 3: Payment

  const [form, setForm] = useState({
    full_name: "", phone: "", address_line1: "", address_line2: "", city: "",
    state: "", pincode: "", landmark: "", address_type: "home", is_default: false,
  });

  useEffect(() => {
    async function loadAddresses() {
      const token = await getToken();
      const res = await api.get<{ success: boolean; data: Address[] }>("/addresses", token);
      if (res.success) {
        setAddresses(res.data);
        if (res.data.length > 0) {
          const def = res.data.find((a) => a.is_default) || res.data[0];
          setSelectedAddress(def.id);
        }
      }
    }
    loadAddresses();
  }, [getToken]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    const res = await api.post<{ success: boolean; data: Address }>("/addresses", form, token);
    if (res.success) {
      setAddresses((prev) => [res.data, ...prev]);
      setSelectedAddress(res.data.id);
      setShowAddForm(false);
      showToast("Address added!", "success");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { showToast("Please select a delivery address", "warning"); return; }
    setPlacing(true);

    try {
      const token = await getToken();

      if (paymentMethod === "razorpay") {
        // Create Razorpay order
        const rpRes = await api.post("/razorpay/create-order", { amount: total }, token);
        if (!rpRes.success) throw new Error("Failed to create payment order");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rpRes.data.amount,
          currency: rpRes.data.currency,
          name: "Flipkart Clone",
          description: "Order Payment",
          order_id: rpRes.data.razorpay_order_id,
          handler: async (response: any) => {
            try {
              // Get a fresh token — the original one may have expired during payment
              const freshToken = await getToken();

              // Place order with razorpay details
              const orderRes = await api.post("/orders", {
                address_id: selectedAddress,
                payment_method: "razorpay",
                razorpay_order_id: rpRes.data.razorpay_order_id,
              }, freshToken);

              // Verify payment
              await api.post("/razorpay/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderRes.data.id,
              }, freshToken);

              clearCartLocal();
              showToast("Order placed successfully! 🎉", "success");
              router.push(`/orders/${orderRes.data.id}`);
            } catch (err: any) {
              console.error("Payment handler error:", err);
              showToast(err.message || "Failed to complete order after payment", "error");
            }
          },
          prefill: {
            name: "Test Customer",
            email: "test@example.com",
            contact: "9999999999",
          },
          theme: { color: "#2874F0" },
          modal: {
            ondismiss: () => {
              setPlacing(false);
              showToast("Payment cancelled", "warning");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setPlacing(false);
      } else {
        // COD
        const orderRes = await api.post("/orders", {
          address_id: selectedAddress,
          payment_method: "cod",
        }, token);

        clearCartLocal();
        showToast("Order placed successfully! 🎉", "success");
        router.push(`/orders/${orderRes.data.id}`);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to place order", "error");
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-fk py-4">
        <div className="card empty-state">
          <h3>Your cart is empty</h3>
          <p>Add products to your cart before checking out.</p>
          <button onClick={() => router.push("/")} className="btn btn-primary mt-4">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fk py-4">
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4">
          {/* Step 1: Address */}
          <div className="card overflow-hidden">
            <div className={`p-4 flex items-center gap-3 ${step >= 1 ? "bg-flipkart-primary text-white" : "bg-gray-50"}`}>
              <span className="w-6 h-6 rounded-sm bg-white/20 flex items-center justify-center text-sm font-bold">1</span>
              <h2 className="font-semibold">DELIVERY ADDRESS</h2>
              {step > 1 && <button onClick={() => setStep(1)} className="ml-auto text-sm underline">Change</button>}
            </div>

            {step === 1 && (
              <div className="p-4 space-y-3">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex gap-3 p-3 border rounded cursor-pointer transition ${selectedAddress === addr.id ? "border-flipkart-primary bg-flipkart-primary-light/30" : "border-flipkart-border hover:border-flipkart-primary/50"}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="accent-flipkart-primary mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{addr.full_name}</span>
                        <span className="badge badge-blue">{addr.address_type}</span>
                        <span className="text-sm text-flipkart-text-secondary">{addr.phone}</span>
                      </div>
                      <p className="text-sm text-flipkart-text-secondary">
                        {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}

                {!showAddForm ? (
                  <button onClick={() => setShowAddForm(true)} className="btn btn-outline w-full flex items-center gap-2">
                    <FiPlus size={16} /> Add New Address
                  </button>
                ) : (
                  <form onSubmit={handleAddAddress} className="border rounded p-4 space-y-3">
                    <h3 className="font-semibold text-flipkart-primary">Add New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input className="input" placeholder="Full Name *" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                      <input className="input" placeholder="Phone *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <input className="input" placeholder="Address Line 1 *" required value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
                    <input className="input" placeholder="Address Line 2" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
                    <div className="grid grid-cols-3 gap-3">
                      <input className="input" placeholder="City *" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                      <select className="input" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                        <option value="">State *</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input className="input" placeholder="Pincode *" required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                    </div>
                    <input className="input" placeholder="Landmark" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
                    <div className="flex gap-3">
                      {ADDRESS_TYPES.map((t) => (
                        <label key={t.value} className="flex items-center gap-1 text-sm cursor-pointer">
                          <input type="radio" name="address_type" value={t.value} checked={form.address_type === t.value} onChange={(e) => setForm({ ...form, address_type: e.target.value })} className="accent-flipkart-primary" />
                          {t.label}
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary">Save Address</button>
                      <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-ghost">Cancel</button>
                    </div>
                  </form>
                )}

                <button disabled={!selectedAddress} onClick={() => setStep(2)} className="btn btn-buy w-full py-3 mt-2">
                  DELIVER HERE
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Order Summary */}
          <div className="card overflow-hidden">
            <div className={`p-4 flex items-center gap-3 ${step >= 2 ? "bg-flipkart-primary text-white" : "bg-gray-50"}`}>
              <span className="w-6 h-6 rounded-sm bg-white/20 flex items-center justify-center text-sm font-bold">2</span>
              <h2 className="font-semibold">ORDER SUMMARY</h2>
            </div>
            {step === 2 && (
              <div className="p-4">
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.product_image || "https://via.placeholder.com/60"} alt="" className="w-14 h-14 object-contain rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.product_name}</p>
                        <p className="text-xs text-flipkart-text-secondary">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(3)} className="btn btn-buy w-full py-3">CONTINUE</button>
              </div>
            )}
          </div>

          {/* Step 3: Payment */}
          <div className="card overflow-hidden">
            <div className={`p-4 flex items-center gap-3 ${step >= 3 ? "bg-flipkart-primary text-white" : "bg-gray-50"}`}>
              <span className="w-6 h-6 rounded-sm bg-white/20 flex items-center justify-center text-sm font-bold">3</span>
              <h2 className="font-semibold">PAYMENT OPTIONS</h2>
            </div>
            {step === 3 && (
              <div className="p-4 space-y-3">
                <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition ${paymentMethod === "razorpay" ? "border-flipkart-primary bg-flipkart-primary-light/30" : "border-flipkart-border"}`}>
                  <input type="radio" name="payment" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="accent-flipkart-primary" />
                  <FiCreditCard size={20} />
                  <div>
                    <span className="font-semibold">Razorpay (UPI/Card/Net Banking)</span>
                    <p className="text-xs text-flipkart-text-secondary">Pay securely using Razorpay</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition ${paymentMethod === "cod" ? "border-flipkart-primary bg-flipkart-primary-light/30" : "border-flipkart-border"}`}>
                  <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-flipkart-primary" />
                  <span className="text-xl">💰</span>
                  <div>
                    <span className="font-semibold">Cash on Delivery</span>
                    <p className="text-xs text-flipkart-text-secondary">Pay when you receive</p>
                  </div>
                </label>
                <button onClick={handlePlaceOrder} disabled={placing} className="btn btn-buy w-full py-3 text-base mt-4">
                  {placing ? "Placing Order..." : `CONFIRM ORDER • ${formatPrice(total)}`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Price Sidebar */}
        <div className="lg:sticky lg:top-28 self-start">
          <div className="card">
            <div className="p-4 border-b border-flipkart-border">
              <h2 className="text-sm font-semibold text-flipkart-text-secondary uppercase">Price Details</h2>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span>Price ({items.length} items)</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-flipkart-green"><span>Discount</span><span>−{formatPrice(discount)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className={shippingFee === 0 ? "text-flipkart-green" : ""}>{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span></div>
              <hr className="border-dashed" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(total)}</span></div>
              {savings > 0 && <p className="text-flipkart-green font-semibold">You save {formatPrice(savings)}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
