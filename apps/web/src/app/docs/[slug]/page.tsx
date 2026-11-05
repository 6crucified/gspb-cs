import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { docs, getDoc } from "@/lib/docs";
import { ProsePage } from "@/components/marketing/prose";

type Params = { slug: string };

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: "Docs" };
  return { title: doc.title, description: doc.summary };
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  return (
    <ProsePage eyebrow="Docs" title={doc.title} lede={doc.summary}>
      {doc.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <p>
        <Link href="/docs" className="text-navy hover:underline">
          All docs
        </Link>
      </p>
    </ProsePage>
  );
}
