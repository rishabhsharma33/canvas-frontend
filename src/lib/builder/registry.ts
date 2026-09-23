import { containerBlock } from "@/components/blocks/primitives/ContainerBlock";
import { sectionBlock } from "@/components/blocks/primitives/SectionBlock";
import { headingBlock } from "@/components/blocks/primitives/HeadingBlock";
import { textBlock } from "@/components/blocks/primitives/TextBlock";
import { buttonBlock } from "@/components/blocks/primitives/ButtonBlock";
import { imageBlock } from "@/components/blocks/primitives/ImageBlock";
import { badgeBlock } from "@/components/blocks/primitives/BadgeBlock";
import { avatarBlock } from "@/components/blocks/primitives/AvatarBlock";
import { inputFieldBlock } from "@/components/blocks/primitives/InputFieldBlock";
import { dividerBlock } from "@/components/blocks/primitives/DividerBlock";
import { quoteBlock } from "@/components/blocks/primitives/QuoteBlock";
import { heroSectionBlock } from "@/components/blocks/composite/HeroSectionBlock";
import { pricingCardBlock } from "@/components/blocks/composite/PricingCardBlock";
import { navBarBlock } from "@/components/blocks/composite/NavBarBlock";
import { formFieldGroupBlock } from "@/components/blocks/composite/FormFieldGroupBlock";
import { footerBlock } from "@/components/blocks/composite/FooterBlock";
import { featureGridBlock } from "@/components/blocks/composite/FeatureGridBlock";
import { testimonialBlock } from "@/components/blocks/composite/TestimonialBlock";
import { ctaBandBlock } from "@/components/blocks/composite/CtaBandBlock";
import { twoColumnBlock } from "@/components/blocks/composite/TwoColumnBlock";
import type { BlockDefinition, BlockType, SeedNode } from "./types";

export const registry: Record<BlockType, BlockDefinition> = {
  container: containerBlock,
  section: sectionBlock,
  heading: headingBlock,
  text: textBlock,
  button: buttonBlock,
  image: imageBlock,
  badge: badgeBlock,
  avatar: avatarBlock,
  "input-field": inputFieldBlock,
  divider: dividerBlock,
  quote: quoteBlock,
  "hero-section": heroSectionBlock,
  "pricing-card": pricingCardBlock,
  "nav-bar": navBarBlock,
  "form-field-group": formFieldGroupBlock,
  footer: footerBlock,
  "feature-grid": featureGridBlock,
  testimonial: testimonialBlock,
  "cta-band": ctaBandBlock,
  "two-column": twoColumnBlock,
};

export const registryList = Object.values(registry);

export function getBlockDefinition(type: BlockType): BlockDefinition {
  const def = registry[type];
  if (!def) throw new Error(`No block registered for type "${type}"`);
  return def;
}

/** Builds a SeedNode for a fresh block instance, pulling in its registered default props/children. */
export function createSeedNode(
  type: BlockType,
  propsOverride: Record<string, unknown> = {}
): SeedNode {
  const def = getBlockDefinition(type);
  return {
    type,
    props: { ...def.defaultProps, ...propsOverride },
    children: def.defaultChildren,
  };
}

export const CATEGORY_LABELS: Record<BlockDefinition["category"], string> = {
  primitive: "Primitives",
  layout: "Layout",
  content: "Content",
  section: "Sections",
};

export const CATEGORY_ORDER: BlockDefinition["category"][] = [
  "section",
  "layout",
  "content",
  "primitive",
];
