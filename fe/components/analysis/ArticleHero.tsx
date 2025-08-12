export default function ArticleHero({ title }: { title: string }) {
  return (
    <header className="mb-6">
      <p className="mb-2 inline-block rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-semibold text-foreground/70">
        Phân tích
      </p>
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-brand md:text-4xl">
        {title}
      </h1>

      <div className="my-6">
        <div className="aspect-[16/9] w-full rounded-2xl border border-[color:var(--color-border)] bg-surface" />
        <p className="mt-2 text-center text-sm text-foreground/60">
          Ảnh minh hoạ
        </p>
      </div>
    </header>
  );
}
