/**
 * Clinic data that is the same in every language.
 * Human-readable texts live in /messages/*.json under the same ids.
 */

export const siteConfig = {
  name: "Aurora Dental",
  phone: "+374 10 55 55 55",
  phoneHref: "tel:+37410555555",
  whatsappHref: "https://wa.me/37410555555",
  telegramHref: "https://t.me/aurora_dental_demo",
  developer: {
    name: "Aren Mkrtchyan",
    href: "https://github.com/amd-11",
  },
  rating: 4.9,
  reviewsCount: 327,
} as const;

export const navItems = [
  { id: "services", href: "#services" },
  { id: "doctors", href: "#doctors" },
  { id: "prices", href: "#prices" },
  { id: "reviews", href: "#reviews" },
  { id: "faq", href: "#faq" },
  { id: "contacts", href: "#contacts" },
] as const;

export const services = [
  { id: "therapy", priceFrom: 15000 },
  { id: "implants", priceFrom: 290000 },
  { id: "orthodontics", priceFrom: 450000 },
  { id: "aesthetics", priceFrom: 120000 },
  { id: "hygiene", priceFrom: 20000 },
  { id: "kids", priceFrom: 10000 },
] as const;

export type ServiceId = (typeof services)[number]["id"];

export const processSteps = ["booking", "diagnostics", "plan", "warranty"] as const;

export const doctors = [
  { id: "anna", experience: 12, hue: 168 },
  { id: "david", experience: 18, hue: 200 },
  { id: "mariam", experience: 9, hue: 28 },
  { id: "levon", experience: 15, hue: 260 },
] as const;

export const pricing = [
  {
    id: "therapy",
    items: [
      { id: "consultation", price: 5000 },
      { id: "caries", price: 15000 },
      { id: "canal", price: 45000 },
      { id: "hygiene", price: 20000 },
    ],
  },
  {
    id: "surgery",
    items: [
      { id: "extraction", price: 12000 },
      { id: "wisdom", price: 35000 },
      { id: "implant", price: 290000 },
      { id: "boneGraft", price: 120000 },
    ],
  },
  {
    id: "orthodontics",
    items: [
      { id: "braces", price: 350000 },
      { id: "aligners", price: 950000 },
      { id: "retainer", price: 40000 },
    ],
  },
  {
    id: "aesthetics",
    items: [
      { id: "veneer", price: 180000 },
      { id: "crown", price: 120000 },
      { id: "whitening", price: 90000 },
    ],
  },
] as const;

export const reviews = ["r1", "r2", "r3", "r4", "r5", "r6"] as const;

export const faqItems = ["pain", "price", "installments", "warranty", "tourists", "kids"] as const;
