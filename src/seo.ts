import type { AppLocale } from "./i18n/messages";

export const SITE_URL = "https://mobahug.github.io/gaborulenius_2025/";
export const SITE_NAME = "Gábor Ulenius Portfolio";
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
      "Gábor Ulenius | Full-Stack Developer in Finland | Healthcare Data & AI",
    description:
      "Portfolio of Gábor Ulenius, Full-Stack Developer in Espoo, Finland specializing in healthcare data platforms, cloud delivery, web applications and AI solutions.",
    ogLocale: "en_US",
    ogLocaleAlternate: "fi_FI",
    imageAlt: "Gábor Ulenius full-stack developer portfolio",
  },
  fi: {
    title:
      "Gábor Ulenius | Full-Stack-kehittäjä Suomessa | Terveysdata ja tekoäly",
    description:
      "Gábor Uleniuksen portfolio: Espoossa toimiva Full-Stack-kehittäjä, jonka osaamista ovat terveysdata-alustat, pilvitoimitus, verkkosovellukset ja tekoäly.",
    ogLocale: "fi_FI",
    ogLocaleAlternate: "en_US",
    imageAlt: "Gábor Uleniuksen full-stack-kehittäjän portfolio",
  },
};

export const RECRUITER_KEYWORDS = [
  "Gábor Ulenius",
  "Gábor Horváth-Ulenius",
  "Full-Stack Developer Finland",
  "web application developer",
  "cloud delivery developer",
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
        name: "Gábor Ulenius | Full-Stack Developer Portfolio",
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
        name: "Gábor Ulenius",
        alternateName: "Gábor Horváth-Ulenius",
        jobTitle: "Full-Stack Developer",
        description:
          "Espoo-based Full-Stack Developer at Tieto Caretech working on cloud-native healthcare data platforms, AI prototypes and reliable cloud delivery for major Nordic healthcare environments.",
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
          "Web application development",
          "Backend services",
          "Cloud delivery",
          "Release automation",
          "Observability",
          "Healthcare software",
          "Healthcare data platforms",
          "Generative AI",
        ],
        sameAs: [LINKEDIN_URL, GITHUB_URL, TIETO_CAREERS_PROFILE_URL],
      },
    ],
  };
};
