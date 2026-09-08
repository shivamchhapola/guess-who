import Link from 'next/link';
import { Gamepad2, UploadCloud, Users, Sparkles, Play, ShieldCheck, Flame, ArrowRight, Tv, Film, Zap } from 'lucide-react';
import Image from 'next/image';
import { CLASSIC_GUESS_WHO_TEMPLATE } from '@/data/defaultTemplate';
import { ALL_POPULAR_TEMPLATES } from '@/data/popularTemplates';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Playful Header Navigation */}
      <header className="w-full border-b border-white/10 game-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl game-btn-primary flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              GuessWho<span className="text-amber-400">Party!</span> 🎭
            </span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/templates"
              className="text-xs sm:text-sm font-bold text-slate-300 hover:text-amber-400 transition-colors hidden sm:block"
            >
              Browse Games
            </Link>
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-800/90 border border-white/15 rounded-xl hover:border-amber-400/60 hover:bg-slate-800 transition-all"
            >
              <UploadCloud className="w-4 h-4 text-amber-400" />
              <span>Make Set from Photos</span>
            </Link>
            <Link
              href="/auth/login"
              className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Log In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Playful Game Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full game-card border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-6 shadow-lg shadow-amber-500/10">
          <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>The Ultimate Custom Guess Who Game Launcher</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight max-w-4xl leading-[1.15] mb-6">
          Guess Who? <br className="hidden sm:inline" />
          <span className="font-game-title">Play & Create Custom Board Games!</span>
        </h1>

        <p className="text-slate-300 text-base sm:text-xl max-w-2xl mb-10 font-medium">
          Play classic Guess Who online with friends or make custom card games out of your own photos, friends, The Office, or Marvel superheroes!
        </p>

        {/* Instant Room Join & Fast Play Card */}
        <div className="w-full max-w-3xl game-panel p-6 sm:p-8 rounded-3xl mb-12 border border-white/15 shadow-2xl">
          <form action="/play/practice" className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full flex-1">
              <input
                type="text"
                name="room"
                placeholder="ENTER 6-LETTER ROOM CODE (e.g. AB12CD)"
                maxLength={6}
                className="w-full px-5 py-4 bg-slate-950/90 border-2 border-slate-700/80 rounded-2xl text-center text-xl font-mono font-black tracking-widest text-amber-300 uppercase placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 text-lg game-btn-primary rounded-2xl flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Join Game</span>
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> No Registration to Play
            </span>
            <span>•</span>
            <Link href="/play/practice" className="hover:text-amber-400 underline transition-colors">
              Play Solo Practice Game →
            </Link>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
          {/* Card 1: Bulk Upload Photos */}
          <div className="game-panel p-6 rounded-3xl flex flex-col justify-between border border-amber-500/30 hover:border-amber-400 transition-all text-left group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">Create Set from Photos</h2>
              <p className="text-slate-400 text-xs mb-6">
                Bulk upload any number of pictures or drop a ZIP file! We automatically create character cards for your custom game.
              </p>
            </div>

            <Link
              href="/create"
              className="w-full py-3 px-4 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>Make Photo Game</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Host Game Room */}
          <div className="game-panel p-6 rounded-3xl flex flex-col justify-between border border-purple-500/30 hover:border-purple-400 transition-all text-left group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">Host Online Room</h2>
              <p className="text-slate-400 text-xs mb-6">
                Get a private room code, set an optional passcode, and invite your friend to play online.
              </p>
            </div>

            <Link
              href="/host"
              className="w-full py-3 px-4 text-sm font-bold text-white game-btn-purple rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Host Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Public Lobbies */}
          <div className="game-panel p-6 rounded-3xl flex flex-col justify-between border border-cyan-500/30 hover:border-cyan-400 transition-all text-left group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">Public Game Lobbies</h2>
              <p className="text-slate-400 text-xs mb-6">
                Browse open game rooms created by players online and jump into a match right now.
              </p>
            </div>

            <Link
              href="/lobbies"
              className="w-full py-3 px-4 text-sm font-bold text-slate-100 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Browse Lobbies</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Featured Popular Card Sets Showcase */}
        <div className="w-full max-w-5xl flex flex-col gap-8 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-white">Popular Game Collections</h2>
              <p className="text-slate-400 text-sm">Play ready-made character sets from iconic TV shows and movies.</p>
            </div>

            <Link href="/templates" className="text-xs font-bold text-amber-400 hover:underline">
              View All Sets →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ALL_POPULAR_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="game-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-amber-400/60 transition-all group">
                <div>
                  <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-slate-950/80 mb-4 aspect-[2/1] overflow-hidden">
                    {tpl.cards.slice(0, 8).map((c) => (
                      <div key={c.id} className="relative w-full h-full rounded-lg overflow-hidden bg-slate-900">
                        <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                    {tpl.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-4">{tpl.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-semibold text-slate-400">
                  <span>{tpl.cards.length} Cards</span>
                  <Link
                    href="/play/practice"
                    className="px-3.5 py-1.5 font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Set</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 game-panel py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} GuessWhoParty! The Custom Board Game Platform.</p>
          <div className="flex items-center gap-6 font-bold text-slate-300">
            <Link href="/templates" className="hover:text-amber-400 transition-colors">Browse Sets</Link>
            <Link href="/create" className="hover:text-amber-400 transition-colors">Make Photo Set</Link>
            <Link href="/play/practice" className="hover:text-amber-400 transition-colors">Practice Board</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
