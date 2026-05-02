import type { AppLocale } from "./i18n/messages";

export const SITE_URL = "https://mobahug.github.io/gaborulenius/";
export const SITE_NAME = "Gabor Ulenius Portfolio";
export const SOCIAL_IMAGE_URL = `${SITE_URL}jungle.png`;
export const PROFILE_IMAGE_URL = `${SITE_URL}profile2-small.webp`;
export const LINKEDIN_URL =
  "https://www.linkedin.com/in/g%C3%A0bor-horv%C3%A0th-ulenius-07526719a/";
export const GITHUB_URL = "https://github.com/mobahug";
export const TIETO_CAREERS_PROFILE_URL =
  "https://careers.tieto.com/career-story/2025-5/gabor-horvath-ulenius-a-non-traditional-journey-into-coding";

type SeoContent = {
  title: string;
  description: string;
  ogLocale: string;
  ogLocaleAlternate: string;
  imageAlt: string;
};

export const SEO_BY_LOCALE: Record<AppLocale, SeoContent> = {
  en: {
    title:
      "Gabor Ulenius | Full-Stack Developer in Finland | React, TypeScript, Azure",
    description:
      "Portfolio of Gabor Ulenius, Full-Stack Developer in Espoo, Finland specializing in React, TypeScript, Azure, Kubernetes, healthcare data and AI solutions.",
    ogLocale: "en_US",
    ogLocaleAlternate: "fi_FI",
    imageAlt: "Gabor Ulenius full-stack developer portfolio",
  },
  fi: {
    title:
      "Gabor Ulenius | Full-Stack-kehittaja Suomessa | React, TypeScript, Azure",
    description:
      "Gabor Uleniuksen portfolio: Espoossa toimiva Full-Stack-kehittaja, jonka osaamista ovat React, TypeScript, Azure, Kubernetes, terveysdata ja tekoaly.",
    ogLocale: "fi_FI",
    ogLocaleAlternate: "en_US",
    imageAlt: "Gabor Uleniuksen full-stack-kehittajan portfolio",
  },
};

export const RECRUITER_KEYWORDS = [
  "Gabor Ulenius",
  "Full-Stack Developer Finland",
  "React developer",
  "TypeScript developer",
  "Azure developer",
  "healthcare software developer",
  "AI developer",
  "Tieto Caretech",
  "Espoo",
].join(", ");

export const getStructuredData = (locale: AppLocale) => {
  const seo = SEO_BY_LOCALE[locale];
  const language = locale === "fi" ? "fi-FI" : "en";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}#profile-page`,
        url: SITE_URL,
        name: "Gabor Ulenius | Full-Stack Developer Portfolio",
        description: seo.description,
        inLanguage: language,
        about: {
          "@id": `${SITE_URL}#person`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: PROFILE_IMAGE_URL,
          width: 860,
          height: 860,
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}#person`,
        name: "Gabor Ulenius",
        alternateName: "Gabor Horvath Ulenius",
        jobTitle: "Full-Stack Developer",
        description:
          "Espoo-based Full-Stack Developer at Tieto Caretech working on cloud-native healthcare data platforms and AI solutions.",
        url: SITE_URL,
        image: PROFILE_IMAGE_URL,
        email: "mailto:gaborulenius@gmail.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Espoo",
          addressCountry: "FI",
        },
        alumniOf: {
          "@type": "EducationalOrganization",
          name: "Hive Helsinki",
        },
        worksFor: {
          "@type": "Organization",
          name: "Tieto Caretech",
        },
        knowsAbout: [
          "React",
          "TypeScript",
          "Node.js",
          "GraphQL",
          "Azure Cloud",
          "Kubernetes",
          "Docker",
          "Terraform",
          "Healthcare software",
          "Healthcare data platforms",
          "Generative AI",
        ],
        sameAs: [LINKEDIN_URL, GITHUB_URL, TIETO_CAREERS_PROFILE_URL],
      },
    ],
  };
};
