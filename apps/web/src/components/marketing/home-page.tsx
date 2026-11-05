import Link from "next/link";
import { HeroCtas } from "@/components/marketing/actions";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { WorkspacePreview } from "@/components/marketing/workspace-preview";

const setup = [
  {
    title: "Créer une classe",
    body: "Nommez la section. Un second groupe du même cours est une seconde classe, et c'est l'unité facturée.",
  },
  {
    title: "Ajouter un devoir",
    body: "Partez d'une leçon, envoyez un dossier, ou écrivez le code de départ. Publiez quand la section doit le voir.",
  },
  {
    title: "Partager le lien",
    body: "Activez le lien et collez-le, ou affichez le code au tableau. Les nouvelles inscriptions s'arrêtent quand vous le coupez.",
  },
  {
    title: "Les élèves codent",
    body: "Chaque élève a son espace, avec le devoir déjà dans ses fichiers.",
  },
];

const studentFeatures = [
  {
    title: "Neuf langages",
    body: "Python, Java, C, C++, C#, JavaScript, TypeScript, Go et PHP, chacun avec Exécuter.",
  },
  {
    title: "Notebooks",
    body: "Ouvrez un notebook et lancez les cellules dans l'éditeur.",
  },
  {
    title: "Les paquets restent installés",
    body: "pip et npm s'installent dans les fichiers de l'élève et sont encore là au cours suivant.",
  },
  {
    title: "Fenêtres à côté du code",
    body: "Turtle, tkinter et les programmes qui ouvrent une fenêtre s'affichent près de l'éditeur.",
  },
  {
    title: "Une adresse pour un site",
    body: "Un serveur lancé par un élève peut recevoir une adresse que quelqu'un d'autre ouvre.",
  },
  {
    title: "Le travail suit le compte",
    body: "Les fichiers s'enregistrent en tapant, sur n'importe quel ordinateur où l'élève se connecte.",
  },
];

const grading = [
  { title: "Tests publics et cachés", body: "Les élèves lancent les tests publics. La note ajoute les tests cachés." },
  { title: "Publication à une date", body: "Écrivez le devoir maintenant. Il apparaît le jour choisi." },
  { title: "Collecte à l'échéance", body: "À l'heure limite, chaque copie est rendue et verrouillée." },
  { title: "Une note sur une ligne", body: "Laissez un commentaire sur une ligne précise du fichier." },
  { title: "Coefficients et corrections", body: "Pondérez chaque devoir, ou modifiez une note à la main." },
  { title: "Export", body: "Téléchargez le carnet de notes en tableur." },
];

const live = [
  { title: "Voir qui est en ligne", body: "Un point vert marque chaque élève au travail." },
  { title: "Éditer ensemble", body: "Ouvrez son espace depuis la classe. Les deux curseurs s'affichent, avec les noms." },
  { title: "Un terminal sur ses fichiers", body: "Vous avez un shell dans le même dossier, sans vous déplacer." },
  { title: "Surnoms", body: "Appelez-les comme en classe. Seuls les enseignants le voient." },
];

const moves = [
  { title: "Un autre IDE en ligne", body: "Récupérez le dossier de départ, créez une classe, et publiez-le comme premier devoir." },
  { title: "Chromebooks", body: "L'espace est le navigateur. Rien à installer sur l'appareil." },
  { title: "Un carnet dans un tableur", body: "Exportez les notes quand l'établissement les veut dans son outil." },
];

const faqs = [
  {
    q: "Qu'est-ce qui est facturé ?",
    a: "Les classes. Une classe est une section. Les élèves et les enseignants supplémentaires sont inclus. La première est gratuite. Ensuite, 9 $ / mois, ou 6 $ / mois au tarif Établissement à partir de huit classes.",
  },
  {
    q: "Comment fonctionne un compte enseignant ?",
    a: "Créez un compte et ouvrez votre première classe. Les élèves utilisent le lien que vous partagez.",
  },
  {
    q: "De quoi les élèves ont-ils besoin ?",
    a: "Un ordinateur avec un navigateur, et une adresse pour se connecter. Rien n'est installé sur la machine.",
  },
  {
    q: "Ça marche sur Chromebook ?",
    a: "Oui. Éditer, exécuter et rendre se font dans le navigateur.",
  },
  {
    q: "Quels langages ?",
    a: "Python, Java, C, C++, C#, JavaScript, TypeScript, Go et PHP, plus les notebooks et les sites HTML et CSS. La correction automatique accepte des cas d'entrée et de sortie, ou une commande comme pytest.",
  },
  {
    q: "Quelle taille pour une classe ?",
    a: "La classe, c'est la section. Le nombre d'élèves ne change pas le prix. Pour un effectif plus grand, écrivez via Retours.",
  },
  {
    q: "Est-ce relié à mon ENT ?",
    a: "Pas en direct. Téléchargez le carnet de notes et importez-le.",
  },
];

function Eyebrow({ children }: { children: string }) {
  return <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{children}</p>;
}

export function HomePage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-24">
        <div>
          <h1 className="font-display text-[3.25rem] leading-[1.02] font-semibold tracking-tight text-ink sm:text-6xl">
            L&apos;IDE en ligne pour votre classe
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Les élèves codent dans le navigateur, sur n&apos;importe quel ordinateur. Publiez les
            devoirs, suivez le travail, et tenez la section depuis un seul endroit.
          </p>
          <p className="mt-5 text-sm text-muted">Élèves illimités dans chaque classe. Vous payez par classe.</p>
          <div className="mt-8">
            <HeroCtas />
          </div>
          <p className="mt-5 text-sm text-muted">La première classe est gratuite. Les suivantes sont facturées au mois.</p>
        </div>
        <WorkspacePreview />
      </section>

      <section id="how-it-works" className="border-t border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div className="relative hidden min-h-64 lg:block" aria-hidden>
            <div className="absolute top-6 left-4 h-44 w-44 rounded-full bg-[#6e88ad]/35" />
            <div className="absolute top-24 left-16 w-80 rounded-2xl border border-line bg-[#2c3848] p-5 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-ink-soft">Algorithmique · Bloc B</p>
                <span className="text-muted">×</span>
              </div>
              <p className="mt-16 font-mono text-sm text-white/75">/join/algorithms-block-b</p>
            </div>
          </div>
          <div>
            <Eyebrow>Mise en route</Eyebrow>
            <h2 className="mt-3 font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
              Les élèves rejoignent avec un lien
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              Rien à installer. Les élèves se connectent avec l&apos;adresse qu&apos;ils ont déjà.
            </p>
            <ol className="mt-8 space-y-6">
              {setup.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm text-ink">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Eyebrow>Pour les élèves</Eyebrow>
          <h2 className="mt-3 max-w-xl font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
            Les élèves peuvent construire le travail
          </h2>
          <p className="mt-4 max-w-xl text-ink-soft">
            Chaque élève a un espace : un éditeur, un terminal, et ses propres fichiers.
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {studentFeatures.map((item) => (
              <li key={item.title}>
                <h3 className="font-medium text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Eyebrow>Correction</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
            Vos tests notent la section
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Écrivez les tests une fois. À l&apos;échéance, GSPB récupère le travail, lance vos tests,
            et place les notes dans le carnet.
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {grading.map((item) => (
              <li key={item.title}>
                <h3 className="font-medium text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Eyebrow>Aide en direct</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
            Aider un élève sans traverser la salle
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Ouvrez un espace depuis la classe et éditez avec lui, comme un document partagé.
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {live.map((item) => (
              <li key={item.title}>
                <h3 className="font-medium text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <Eyebrow>Une séance</Eyebrow>
            <h2 className="mt-3 font-display text-4xl leading-tight font-semibold text-ink">
              D&apos;une classe vide à un projet rendu
            </h2>
          </div>
          <ol className="space-y-6 text-sm leading-relaxed text-ink-soft">
            <li>
              <span className="font-medium text-ink">Vous</span> créez le Bloc B, choisissez une leçon
              comme code de départ, et la publiez avec une échéance.
            </li>
            <li>
              <span className="font-medium text-ink">Les élèves</span> ouvrent le lien, lancent les tests
              publics, et retrouvent leurs fichiers au cours suivant.
            </li>
            <li>
              <span className="font-medium text-ink">Vous</span> ouvrez l&apos;espace bloqué, laissez une
              note sur la ligne, et exportez le carnet en fin de séance.
            </li>
          </ol>
        </div>
      </section>

      <section id="pricing" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Eyebrow>Tarifs</Eyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
            Facturé par classe, pas par élève
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Trente élèves dans une section coûtent le même prix que douze. Ajoutez une classe quand
            vous ouvrez une autre section. Retirez-la en fin de période.
          </p>
          <div className="mt-10">
            <PricingGrid />
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-4xl font-semibold text-ink">Vous arrivez d&apos;un autre outil ?</h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Apportez le dossier que vous enseignez déjà. Les guides couvrent la première semaine.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {moves.map((item) => (
              <li key={item.title} className="rounded-2xl border border-line p-5">
                <h3 className="font-medium text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
          <Link href="/guides" className="mt-6 inline-block text-sm text-navy hover:underline">
            Lire les guides
          </Link>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-4xl font-semibold text-ink">Questions des enseignants</h2>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {faqs.map((item) => (
              <div key={item.q} className="grid gap-2 py-5 md:grid-cols-[280px_1fr] md:gap-10">
                <dt className="font-medium text-ink">{item.q}</dt>
                <dd className="text-sm leading-relaxed text-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-4xl font-semibold text-ink">Ouvrez votre première classe</h2>
            <p className="mt-3 text-ink-soft">Gratuite pour une section. Ajoutez-en une autre seulement quand vous l&apos;enseignez.</p>
          </div>
          <HeroCtas />
        </div>
      </section>
    </div>
  );
}
