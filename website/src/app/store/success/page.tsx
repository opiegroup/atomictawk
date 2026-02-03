"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { CheckCircle, Package, Radio } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function SuccessPage() {
  const { clearCart } = useCart();

  // Clear cart when success page loads
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[#E3E2D5] flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="industrial-border bg-white p-12 text-center relative">
          {/* Rivets */}
          <span className="rivet top-3 left-3" />
          <span className="rivet top-3 right-3" />
          <span className="rivet bottom-3 left-3" />
          <span className="rivet bottom-3 right-3" />

          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Stamp */}
          <div className="stamp stamp-approved text-2xl inline-block mb-8">
            Order Confirmed
          </div>

          <h1 
            className="text-4xl font-black uppercase tracking-tighter mb-4"
            style={{ fontFamily: "var(--font-oswald), sans-serif" }}
          >
            Requisition Complete
          </h1>

          <p className="font-mono text-sm text-[#353535]/70 mb-8 uppercase">
            Your order has been received and is being processed by the Mechanical Guild. 
            A confirmation transmission has been dispatched to your email coordinates.
          </p>

          <div className="bg-[#E3E2D5] border-2 border-[#353535] p-6 mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Package className="w-6 h-6 text-[#CCAA4C]" />
              <span className="font-black uppercase tracking-widest text-sm">Shipping Status</span>
            </div>
            <p className="text-xs font-mono text-[#353535]/60 uppercase">
              Your items will be deployed within 5-10 business days.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/store" className="block">
              <Button variant="primary" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Return to Base
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-[#353535]/20">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#353535]/40">
              <Radio className="w-3 h-3" />
              <span>Thank you for supporting Atomic Tawk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
