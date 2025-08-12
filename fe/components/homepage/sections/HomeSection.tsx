"use client";
import HeroBanner from "@/components/homepage/HeroBanner";
import FeatureTiles from "@/components/homepage/FeatureTiles";
import PRSection from "@/components/homepage/PRSection";

/**
 * HomeSection:
 * - Hero + primary CTA (open chat dock)
 * - Feature tiles: Chat, Docs, Analysis (scroll-to on landing)
 * - Short PR/intro block
 */
export default function HomeSection({
  onOpenChat,
}: {
  onOpenChat: () => void;
}) {
  return (
    <section id="home">
      <HeroBanner onOpenChat={onOpenChat} />
      <FeatureTiles onOpenChat={onOpenChat} />
      <PRSection />
    </section>
  );
}
