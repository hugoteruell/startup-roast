import Link from "next/link";
import RoastForm from "./form";

export default function NewRoastPage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 mx-auto max-w-md w-full px-5 py-6 flex flex-col">

        <Link href="/" className="eyebrow hover:text-text">← back</Link>

        <div className="flex-1 flex flex-col justify-center gap-6 py-6">
          <header className="flex flex-col gap-2">
            <h1 className="h-display text-4xl font-bold">ok go ahead</h1>
            <p className="text-text-soft text-base">
              the more you believe in it, the better the painting.
            </p>
          </header>

          <RoastForm />
        </div>
      </div>
    </main>
  );
}
