export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Scents by NurryO",
  description: "Your one-stop shop for all things fragrance.",
  niche: "perfume" as "perfume" | "toys" | "food",
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Catalog", href: "/catalog" },
  ],
  links: {
    instagram: "https://www.instagram.com/nurry_o/",
    facebook: "https://www.facebook.com/nurry.o/",
    twitter: "https://twitter.com/nurry_o",
  },
};
