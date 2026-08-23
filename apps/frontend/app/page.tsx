import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProductPreview } from "@/components/landing/product-preview";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100 selection:bg-zinc-800 selection:text-white font-sans scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <ProductPreview />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}