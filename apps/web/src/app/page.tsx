import type { Metadata } from "next";
import { HomePage } from "@/components/marketing/home-page";

export const metadata: Metadata = {
  title: "GSPB — L'IDE en ligne pour votre classe",
  description:
    "Les élèves codent dans le navigateur. Le tarif est par classe, avec des élèves illimités.",
};

export default function Page() {
  return <HomePage />;
}
