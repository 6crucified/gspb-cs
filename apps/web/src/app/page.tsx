import type { Metadata } from "next";
import { HomePage } from "@/components/marketing/home-page";

export const metadata: Metadata = {
  title: "GSPB — The online IDE for your class",
  description:
    "Students code in the browser. Teachers run the section from one place. Pricing is per class, with unlimited students.",
};

export default function Page() {
  return <HomePage />;
}
