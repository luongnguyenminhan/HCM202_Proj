export type Section = { heading: string; body: string };

export default function ArticleBody({ sections }: { sections: Section[] }) {
  return (
    <article className="space-y-6">
      {sections.map((s, i) => (
        <section key={i}>
          <h2 className="text-xl font-semibold">{s.heading}</h2>
          <p className="mt-2 text-foreground/80">{s.body}</p>
        </section>
      ))}
    </article>
  );
}
