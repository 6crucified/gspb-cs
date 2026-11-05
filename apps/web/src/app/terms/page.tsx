import type { Metadata } from "next";
import { ProsePage } from "@/components/marketing/prose";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <ProsePage title="Terms" lede="The short version of how an account on GSPB works.">
      <p>
        A teacher account can open classes. Students join a class you invite them to. You are
        responsible for the work you assign and for the students you admit with a join link.
      </p>
      <p>
        Pricing is per active class. The first class is free. Paid classes are billed as described
        on the pricing page. Closing a class ends that charge on the next bill.
      </p>
      <p>
        Do not upload work you do not have the right to share with your class. We may suspend an
        account that is used to attack the service or other people&apos;s files.
      </p>
    </ProsePage>
  );
}
