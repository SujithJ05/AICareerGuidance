import { Metadata } from "next";

export const siteConfig = {
  name: "CareerGuideAI",
  description:
    "AI-powered career development platform with resume building, ATS checking, interview prep, and personalized learning paths",
  url: "https://careerguideai.com", // Update with your actual domain
  ogImage: "https://careerguideai.com/og-image.png",
  links: {
    twitter: "https://twitter.com/careerguideai",
    github: "https://github.com/yourusername/careerguideai",
  },
};

export const defaultMetadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "career development",
    "AI resume builder",
    "ATS checker",
    "interview preparation",
    "job search",
    "career coach",
    "skill development",
    "online courses",
    "professional development",
  ],
  authors: [
    {
      name: "CareerGuideAI Team",
      url: siteConfig.url,
    },
  ],
  creator: "CareerGuideAI",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@careerguideai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
