export type PricingPlan = {
  name: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "Free",
    unit: "1 class",
    description: "Run a single section. Every student in it is included.",
    features: [
      "1 active class",
      "Unlimited students",
      "Teachers on the class included",
      "Join link and assignments",
      "Browser workspace",
    ],
    cta: "Start free",
    href: "/sign-up",
  },
  {
    name: "Teacher",
    price: "$9",
    unit: "per class / month",
    description: "Open another section and that class is the line item.",
    features: [
      "First class stays free",
      "Each extra class is $9 / month",
      "Unlimited students in every class",
      "No per-student or per-teacher fee",
      "Remove a class to stop paying for it",
    ],
    cta: "Add classes",
    href: "/sign-up",
    featured: true,
  },
  {
    name: "School",
    price: "$6",
    unit: "per class / month",
    description: "One rate when a department runs many sections together.",
    features: [
      "8 class minimum",
      "Unlimited students and teachers",
      "School admin across classes",
      "Roster API",
      "Billed annually",
    ],
    cta: "Create a school",
    href: "/sign-up",
  },
];

export const pricingExample = "Four classes on Teacher: the first is free, three are billed. 3 × $9 = $27 / month.";
