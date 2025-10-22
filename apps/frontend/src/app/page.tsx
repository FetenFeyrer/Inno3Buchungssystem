import { Calendar } from "../components/Calendar";
import FloorPlanSVG from "../components/FloorPlanSVG";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white font-sans dark:from-black dark:to-zinc-900">
      <header className="w-full h-16 border-b border-zinc-200/60 bg-white/70 backdrop-blur supports-backdrop-filter:bg-white/55 dark:border-zinc-800/60 dark:bg-zinc-900/60">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-blue-600" />
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Inno³ Buchungssystem</span>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Demo UI</div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-4rem)] w-full px-4 md:px-6 flex items-center justify-center">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center gap-6 md:flex-row">
          <section className="flex h-full w-full items-center justify-center md:basis-[30%]">
            <Calendar variant="plain" />
          </section>
          <section className="flex h-full w-full items-center justify-center md:basis-[60%]">
            <div className="w-full">
              <FloorPlanSVG className="w-full h-auto" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
