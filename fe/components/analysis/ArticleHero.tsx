import Image from "next/image";
import hero from "@/public/images/cay_tre.png";

export default function ArticleHero({ title }: { title: string }) {
  return (
    <header className="mb-6">
      <p className="mb-2 inline-block rounded-full border border-[color:var(--color-border)] px-3 py-1 text-xs font-semibold text-foreground/70">
        Phân tích
      </p>

      <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-brand md:text-4xl">
        {title}
      </h1>

      <figure className="my-6">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[color:var(--color-border)]">
        <Image
          src={hero}
          alt="Minh hoạ cho bài phân tích"
          placeholder="blur"
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 768px"
        />
        </div>
        <figcaption className="mt-2 text-center text-sm text-foreground/60">
          Dĩ bất biến, ứng vạn biến — tư tưởng nền tảng truyền cảm hứng cho ngoại giao “Cây Tre”
        </figcaption>
      </figure>
    </header>
  );
}
