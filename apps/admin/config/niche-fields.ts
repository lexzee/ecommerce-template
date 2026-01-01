export const NICHE_CATEGORIES = {
  perfume: {
    label: "Perfume",
    fields: [
      { name: "brand", label: "Brand (e.g., Chanel, Dior)", type: "text" },
      {
        name: "scent_profile",
        label: "Scent Profile (e.g., Floral, Woody)",
        type: "text",
      },
      { name: "volume", label: "Volume (e.g., 50ml, 100ml)", type: "number" },
      {
        name: "gender",
        label: "Gender Target",
        type: "select",
        options: ["Male", "Female", "Unisex"],
      },
    ],
  },
  food: {
    label: "FoodStuffs",
    fields: [
      { name: "expiry_date", label: "Expiry Date", type: "date" },
      { name: "batch_number", label: "Batch Number", type: "text" },
      { name: "is_perishable", label: "Perishable?", type: "checkbox" },
    ],
  },
  toys: {
    label: "Adult Toys",
    fields: [
      {
        name: "material",
        label: "Material (e.g., Silicone, Plastic)",
        type: "text",
      },
      {
        name: "battery_included",
        label: "Battery Included?",
        type: "checkbox",
      },
      { name: "waterproof", label: "Waterproof?", type: "checkbox" },
    ],
  },
};
