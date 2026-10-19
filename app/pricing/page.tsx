"use client";
import React from "react";
import { SimplePricing as Pricing } from "@/components/ainest/Pricing";
import { NavBar } from "@/components/NavBar";

import { Footer } from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col justify-between">
      <NavBar />
      
      {/* 
          We're using the shared SimplePricing component here to ensure 
          total visual and functional consistency (including the toggle) 
          between the dedicated /pricing page and the landing page section.
      */}
      <div className="pt-24 md:pt-32 pb-12 flex-1">
        <Pricing />
      </div>

      <Footer showCta />
    </div>
  );
}
