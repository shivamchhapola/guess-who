import Link from 'next/link';
import { Gamepad2, PlusCircle, Users, Sparkles, ShieldCheck, Zap, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Header / Navigation */}
      <header className="w-full border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              GuessWho<span className="gradient-text font-black">Maker</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/templates"
              className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors hidden sm:block"
            >
              Browse Templates
            </Link>
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-200 glass-card rounded-lg hover:border-cyan-400/50 hover:text-white transition-all"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Create Set</span>
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Creator Login</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col items-center justify-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>100% Free & Open Source • No Paywalls • No Registration to Play</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-center tracking-tight max-w-4xl leading-[1.1] mb-6">
          The Ultimate <span className="gradient-text">Custom Guess Who</span> Online Platform
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl text-center max-w-2xl mb-12">
          Play classic or community-created Guess Who games instantly with friends via room code. Design custom card sets with custom photos and traits!
        </p>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-16">
          {/* Join Room Card */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between hover:border-cyan-500/40 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Join Game Room</h2>
              <p className="text-slate-400 text-sm mb-6">
                Enter a 6-character room code from your friend to join immediately as a guest.
              </p>
            </div>

            <form className="flex flex-col gap-3" action="/play/practice">
              <input
                type="text"
                name="room"
                placeholder="Enter 6-Digit Code (e.g. AB12CD)"
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-center text-lg font-mono tracking-widest text-white uppercase placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="submit"
                className="w-full py-3.5 px-6 font-bold text-white gradient-btn rounded-xl flex items-center justify-center gap-2"
              >
                <span>Join Game</span>
              </button>
            </form>
          </div>

          {/* Host New Room Card */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between hover:border-purple-500/40 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Host New Game</h2>
              <p className="text-slate-400 text-sm mb-6">
                Create a private or public game room choosing from classic characters or thousands of custom sets.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/play/practice"
                className="w-full py-3.5 px-6 font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Play Practice Game</span>
              </Link>
              <Link
                href="/templates"
                className="w-full py-3 px-6 text-sm font-semibold text-slate-300 glass-card rounded-xl text-center hover:text-white hover:border-purple-400/50 transition-colors"
              >
                Explore Template Library
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="glass-card p-6 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <ShieldCheck className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="font-bold text-slate-200 text-base mb-1">No Login to Play</h3>
            <p className="text-slate-400 text-xs">Jump right into multiplayer matches without signing up or granting permissions.</p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <Sparkles className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-bold text-slate-200 text-base mb-1">Custom Template Creator</h3>
            <p className="text-slate-400 text-xs">Logged-in creators can upload custom photos, set character names, and publish public templates.</p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <Zap className="w-8 h-8 text-pink-400 mb-3" />
            <h3 className="font-bold text-slate-200 text-base mb-1">Serverless & Open Source</h3>
            <p className="text-slate-400 text-xs">100% hosted on Vercel with zero latency real-time multiplayer updates.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 glass-panel py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} GuessWhoMaker Clone. Open Source under MIT License.</p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/templates" className="hover:text-cyan-400 transition-colors">Templates</Link>
            <Link href="/create" className="hover:text-cyan-400 transition-colors">Create Set</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">GitHub Repository</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
