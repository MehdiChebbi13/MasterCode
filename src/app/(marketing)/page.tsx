import { MarketingNav } from "@/components/marketing/landing/MarketingNav";
import { Hero } from "@/components/marketing/landing/Hero";
import { TrustBar } from "@/components/marketing/landing/TrustBar";
import { Features } from "@/components/marketing/landing/Features";
import { HowItWorks } from "@/components/marketing/landing/HowItWorks";
import { Testimonials } from "@/components/marketing/landing/Testimonials";
import { FreeBanner } from "@/components/marketing/landing/FreeBanner";
import { FinalCTA } from "@/components/marketing/landing/FinalCTA";
import { MarketingFooter } from "@/components/marketing/landing/MarketingFooter";
import { Decorations } from "@/components/marketing/landing/Decorations";

export default function LandingPage() {
  return (
    <div id="top">
      <Decorations />
      <MarketingNav />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FreeBanner />
      <FinalCTA />
      <MarketingFooter />
    </div>
  );
}
