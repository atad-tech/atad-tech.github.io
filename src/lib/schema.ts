import { CONTACT, SITE, SOCIAL } from "@/config/site";
import type { Service } from "@/data/services";
import { absolute } from "./url";

export const ORG_ID = () => `${absolute("/")}#business`;
export const SITE_ID = () => `${absolute("/")}#website`;

export function organization() {
  return {
    "@type": "ProfessionalService",
    "@id": ORG_ID(),
    name: SITE.legalName,
    alternateName: SITE.alternateNames,
    url: absolute("/"),
    logo: absolute("/logo.png"),
    image: absolute("/og-image.png"),
    description: SITE.description,
    telephone: CONTACT.phoneE164,
    areaServed: SITE.areaServed.map((name) => ({ "@type": "Country", name })),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT.phoneE164,
      contactType: "sales",
      availableLanguage: ["Arabic", "English"],
      url: `https://wa.me/${CONTACT.whatsapp}`,
    },
    sameAs: [SOCIAL.facebook, SOCIAL.instagram],
  };
}

export function website() {
  return { "@type": "WebSite", "@id": SITE_ID(), url: absolute("/"), name: SITE.name, inLanguage: SITE.lang, publisher: { "@id": ORG_ID() } };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(it.path) })),
  };
}

export function faqPage(faq: readonly { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

export function serviceSchema(s: Service) {
  return {
    "@type": "Service",
    "@id": `${absolute(`/${s.slug}/`)}#service`,
    name: s.name,
    alternateName: s.en,
    description: s.seo.description,
    url: absolute(`/${s.slug}/`),
    provider: { "@id": ORG_ID() },
    areaServed: SITE.areaServed.map((name) => ({ "@type": "Country", name })),
    ...(s.priceFrom
      ? { offers: { "@type": "Offer", priceSpecification: { "@type": "PriceSpecification", minPrice: s.priceFrom, priceCurrency: "EGP" } } }
      : {}),
  };
}
