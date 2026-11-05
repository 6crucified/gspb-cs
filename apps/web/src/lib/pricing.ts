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
    name: "Début",
    price: "Gratuit",
    unit: "1 classe",
    description: "Une seule section. Tous les élèves dedans sont inclus.",
    features: [
      "1 classe active",
      "Élèves illimités",
      "Enseignants de la classe inclus",
      "Lien d'invitation et devoirs",
      "Espace dans le navigateur",
    ],
    cta: "Commencer gratuitement",
    href: "/sign-up",
  },
  {
    name: "Enseignant",
    price: "9 $",
    unit: "par classe / mois",
    description: "Chaque section supplémentaire est une ligne sur la facture.",
    features: [
      "La première classe reste gratuite",
      "Chaque classe en plus : 9 $ / mois",
      "Élèves illimités dans chaque classe",
      "Aucun tarif par élève ni par enseignant",
      "Fermer une classe arrête son coût",
    ],
    cta: "Ajouter des classes",
    href: "/sign-up",
    featured: true,
  },
  {
    name: "Établissement",
    price: "6 $",
    unit: "par classe / mois",
    description: "Un tarif quand un département ouvre beaucoup de sections.",
    features: [
      "Minimum de 8 classes",
      "Élèves et enseignants illimités",
      "Admin d'établissement",
      "API des listes",
      "Facturation annuelle",
    ],
    cta: "Créer un établissement",
    href: "/sign-up",
  },
];

export const pricingExample =
  "Quatre classes au tarif Enseignant : la première est gratuite, trois sont facturées. 3 × 9 $ = 27 $ / mois.";
