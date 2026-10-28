import { CONTACT, SITE, SOCIAL } from "@/config/site";
import type { Service } from "@/data/services";
import { absolute } from "./url";

export const ORG_ID = () => `${absolute("/")}#business`;
export const SITE_ID = () => `${absolute("/")}#website`;
export const FOUNDER_ID = () => `${absolute("/about/")}#founder`;

/** مؤسس عتاد، بيظهر كمؤلف للمقالات (E-E-A-T) */
export const FOUNDER = { name: "م. مصطفى محمد", alternateName: "Mostafa Mohamed", jobTitle: "مؤسس عتاد ATAD ومهندس برمجيات" } as const;

export function founder() {
  return { "@type": "Person", "@id": FOUNDER_ID(), name: FOUNDER.name, alternateName: FOUNDER.alternateName, jobTitle: FOUNDER.jobTitle, url: absolute("/about/"), worksFor: { "@id": ORG_ID() } };
}

export function article(a: { title: string; description: string; path: string; image: string; published: string; updated: string; keyword: string }) {
  return {
    "@type": "Article",
    "@id": `${absolute(a.path)}#article`,
    headline: a.title,
    description: a.description,
    url: absolute(a.path),
    mainEntityOfPage: absolute(a.path),
    image: absolute(a.image),
    datePublished: a.published,
    dateModified: a.updated,
    inLanguage: "ar",
    keywords: a.keyword,
    author: { "@id": FOUNDER_ID() },
    publisher: { "@id": ORG_ID() },
  };
}

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
    founder: { "@id": FOUNDER_ID() },
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
