"use client";

import Link from "next/link";
import { 
  ExternalLink, 
  Share2, 
  Palette, 
  Sparkles,
  ArrowRight,
  BarChart3,
  Crown,
  Layout,
  Eye,
  Instagram,
  Twitter,
  Youtube,
  Music,
  Mail,
  Linkedin,
  Check,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "All Your Links, One Place",
    description: "Websites, Articles, Google Drives and More — everything your audience needs in one beautiful link.",
  },
  {
    icon: Palette,
    title: "Stunning Themes",
    description: "Choose from 8 gorgeous themes or customize your own colors, fonts, and style.",
  },
  {
    icon: Share2,
    title: "Social Icons",
    description: "Display your Instagram, X, YouTube, TikTok, and LinkedIn with clickable icons.",
  },
];

const premiumFeatures = [
  {
    icon: Layout,
    title: "Unlimited Links",
    description: "Free: 5 links. Premium: Add as many as you want.",
  },
  {
    icon: BarChart3,
    title: "Click Analytics",
    description: "See who's clicking and which links perform best.",
  },
  {
    icon: Palette,
    title: "Custom Themes",
    description: "Your colors, your fonts, your complete brand control.",
  },
  {
    icon: Eye,
    title: "Remove Branding",
    description: "Clean, professional look with no Aylae badge.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">Free Forever</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6">
            All Your Links,
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Accessed Easily
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Create your personal link page in seconds. Share everything you create 
            with one simple link. Join hundreds of creators already using Aylae.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/login"
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all hover:scale-105"
            >
              Create Your Aylae
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#examples"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold transition-all"
            >
              See Examples
            </a>
          </div>

          {/* Trust indicators */}
          <p className="text-slate-500 text-sm">
            Free forever • No credit card required • Upgrade anytime
          </p>
        </div>
      </section>

      {/* Example Profiles */}
      <section id="examples" className="px-4 sm:px-6 lg:px-8 py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              See what others are building
            </h2>
            <p className="text-slate-400 text-lg">
              Your Aylae page, your way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Example 1 - Green Theme */}
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/30 rounded-3xl p-4">
              <div className="min-h-[420px] bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl p-6">
                <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-lg mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-2xl font-bold text-white mb-3 ring-4 ring-emerald-200">
                      S
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Sarah Chen</h3>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                      @sarahcreates
                    </span>
                    <p className="text-center text-sm text-slate-600">Digital creator & coffee enthusiast</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      <div className="p-2 rounded-full bg-slate-100 text-emerald-600"><Instagram className="w-4 h-4" /></div>
                      <div className="p-2 rounded-full bg-slate-100 text-emerald-600"><Youtube className="w-4 h-4" /></div>
                      <div className="p-2 rounded-full bg-slate-100 text-emerald-600"><Mail className="w-4 h-4" /></div>
                      <div className="p-2 rounded-full bg-slate-100 text-emerald-600"><Share2 className="w-4 h-4" /></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl flex items-center gap-3 bg-white/80 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">🎨</div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">Portfolio</p>
                      <p className="text-xs text-slate-500">My latest work</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="p-3 rounded-2xl flex items-center gap-3 bg-white/80 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">📹</div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">YouTube</p>
                      <p className="text-xs text-slate-500">Behind the scenes</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Example 2 - Purple Theme */}
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/30 rounded-3xl p-4">
              <div className="min-h-[420px] bg-gradient-to-br from-violet-100 to-purple-200 rounded-2xl p-6">
                <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-lg mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-violet-500 flex items-center justify-center text-2xl font-bold text-white mb-3 ring-4 ring-violet-200">
                      M
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Marcus Rivera</h3>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-violet-100 text-violet-600 mb-2">
                      @marcus_codes
                    </span>
                    <p className="text-center text-sm text-slate-600">Full-stack developer • Open source</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      <div className="p-2 rounded-full bg-slate-100 text-violet-600"><Twitter className="w-4 h-4" /></div>
                      <div className="p-2 rounded-full bg-slate-100 text-violet-600"><Linkedin className="w-4 h-4" /></div>
                      <div className="p-2 rounded-full bg-slate-100 text-violet-600"><Mail className="w-4 h-4" /></div>
                      <div className="p-2 rounded-full bg-slate-100 text-violet-600"><Share2 className="w-4 h-4" /></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl flex items-center gap-3 bg-white/80 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-lg">💻</div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">GitHub</p>
                      <p className="text-xs text-slate-500">Open source projects</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="p-3 rounded-2xl flex items-center gap-3 bg-white/80 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-lg">💼</div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">LinkedIn</p>
                      <p className="text-xs text-slate-500">Connect with me</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-violet-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Example 3 - Rose Theme */}
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/30 rounded-3xl p-4">
              <div className="min-h-[420px] bg-gradient-to-br from-rose-100 to-pink-200 rounded-2xl p-6">
                <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-lg mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center text-2xl font-bold text-white mb-3 ring-4 ring-rose-200">
                      E
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Emma Wilson</h3>
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-rose-100 text-rose-600 mb-2">
                      @emmabakes
                    </span>
                    <p className="text-center text-sm text-slate-600">Baker • Food photographer</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      <div className="p-2 rounded-full bg-slate-100 text-rose-600"><Instagram className="w-4 h-4" /></div>
                      <div className="p-2 rounded-full bg-slate-100 text-rose-600"><Music className="w-4 h-4" /></div>
                      <div className="p-2 rounded-full bg-slate-100 text-rose-600"><Mail className="w-4 h-4" /></div>
                      <div className="p-2 rounded-full bg-slate-100 text-rose-600"><Share2 className="w-4 h-4" /></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl flex items-center gap-3 bg-white/80 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-lg">🧁</div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">Recipes</p>
                      <p className="text-xs text-slate-500">Latest creations</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="p-3 rounded-2xl flex items-center gap-3 bg-white/80 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-lg">🛒</div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">Shop</p>
                      <p className="text-xs text-slate-500">Baking tools</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-rose-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need
            </h2>
            <p className="text-slate-400 text-lg">
              Features that actually matter.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-8 bg-slate-800/30 border border-slate-700/30 rounded-2xl hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  {feature.title === "Stunning Themes" && (
                    <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                      Premium
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-emerald-950/30 to-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Premium</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Go Premium
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              For creators who want more.
            </p>

            {/* Pricing */}
            <div className="inline-block bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <div className="text-center">
                <span className="text-5xl font-bold text-white">$5</span>
                <span className="text-slate-400">/month</span>
                <p className="text-slate-400 mt-2">Cancel anytime</p>
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {premiumFeatures.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Crown className="w-5 h-5" />
              Start Free, Upgrade Later
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Ready to simplify your links?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of creators who trust Aylae to share their world.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {["Free to start", "No ads", "Upgrade anytime"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-5 h-5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold text-lg transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Aylae</span>
            <span className="text-slate-500">— All Your Links, Accessed Easily.</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Aylae. Built with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
