import { redirect } from "next/navigation";

export default async function MembresRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/classes/${id}/parametres/membres`);
}
