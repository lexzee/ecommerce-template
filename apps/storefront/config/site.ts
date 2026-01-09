export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Noire Essense",
  description: "Your one-stop shop for all things fragrance.",
  url: "https://scentsbynurryo.com", // Replace with actual domain
  ogImage: "https://scentsbynurryo.com/og.jpg",

  niche: "perfume" as "perfume" | "toys" | "food",
  mainNav: [
    { title: "", href: "" },
    // { title: "Home", href: "/" },
    // { title: "Catalog", href: "/catalog" },
  ],

  contact: {
    email: "nuriatabdulrahman580@gmail.com",
    phone: "2347068577887", //For Whatsapp Links
    displayPhone: "+234 706 857 7887", // For UI
    address: {
      street: "123 Commerce St",
      state: "Lagos",
      country: "Nigeria",
    },
    socials: {
      instagram: "https://www.instagram.com/nurry_o/",
      facebook: "https://www.facebook.com/profile.php?id=61570208316285/",
      twitter: "https://twitter.com/nurry_o",
    },
  },

  billing: {
    currency: {
      code: "NGN",
      symbol: "₦",
      locale: "en-NG",
    },
    taxRate: 0,
    deliveryFlatRate: 0, // Optional: automated delivery fee
  },

  features: {
    enablePaystack: false,
    enableWhatsApp: true,
    enableReviews: true,
    enableBlog: false, // future update
  },
};
