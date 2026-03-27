"use client";

import Link from "next/link";
import { 
  ExternalLink, 
  Share2, 
  Palette, 
  MousePointerClick,
  Sparkles,
  ArrowRight,
  Check,
  BarChart3,
  Crown,
  Palette as PaletteIcon
} from "lucide-react";

const exampleProfiles = [
  {
    name: "Sarah Chen",
    handle: "@sarahcreates",
    bio: "Digital creator & coffee enthusiast",
    links: [
      { title: "Portfolio", subtitle: "My latest work", color: "#dc2626", icon: "🎨" },
      { title: "YouTube", subtitle: "Behind the scenes", color: "#ef4444", icon: "📹" },
      { title: "Newsletter", subtitle: "Weekly tips", color: "#f87171", icon: "✉️" },
    ],
    avatarColor: "#dc2626"
  },
  {
    name: "Marcus Rivera",
    handle: "@marcus_codes",
    bio: "Full-stack developer • Open source",
    links: [
      { title: "GitHub", subtitle: "Open source projects", color: "#1f2937", icon: "💻" },
      { title: "Twitter", subtitle: "Dev thoughts", color: "#374151", icon: "🐦" },
      { title: "Buy Me Coffee", subtitle: "Support my work", color: "#4b5563", icon: "☕" },
    ],
    avatarColor: "#1f2937"
  },
  {
    name: "Emma Wilson",
    handle: "@emmabakes",
    bio: "Baker • Food photographer",
    links: [
      { title: "Recipes", subtitle: "Latest creations", color: "#991b1b", icon: "🧁" },
      { title: "Book", subtitle: "Sweet Secrets", color: "#b91c1c", icon: "📚" },
      { title: "Shop", subtitle: "Baking tools", color: "#dc2626", icon: "🛒" },
    ],
    avatarColor: "#991b1b"
  }
];

const features = [
  {
    icon: Share2,
    title: "One Link for Everything",
    description: "Share all your social profiles, websites, and content in one beautiful link."
  },
  {
    icon: Palette,
    title: "Customizable Design",
    description: "Choose colors, icons, and layouts that match your personal brand."
  },
  {
    icon: MousePointerClick,
    title: "Drag & Drop Editor",
    description: "Easily rearrange your links with our intuitive drag-and-drop interface."
  }
];

const premiumFeatures = [
  {
    icon: Crown,
    title: "Unlimited Links",
    description: "Free plan limited to 5 links. Premium gives you unlimited."
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track clicks and see which links perform best."
  },
  {
    icon: PaletteIcon,
    title: "Premium Themes",
    description: "8 beautiful themes including Ocean, Sunset, Forest, and more."
  },
  {
    icon: Sparkles,
    title: "Remove Branding",
    description: "Hide the 'Made with Home' badge on your public page."
  }
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Sign up in seconds and choose a unique username for your Home page."
  },
  {
    step: "02",
    title: "Add Your Links",
    description: "Add your social profiles, websites, portfolio, or anything you want to share."
  },
  {
    step: "03",
    title: "Customize & Share",
    description: "Pick colors and icons that match your style, then share your unique URL."
  }
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(22,163,74,0.3),transparent_70%)]" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight">
            Your digital home,
            <br />
            <span className="bg-gradient-to-r from-green-400 to-orange-400 bg-clip-text text-transparent">
              all in one link.
            </span>
          </h1>

          <p className="text-xl text-green-200/80 max-w-2xl mx-auto mb-10">
            Create a beautiful link page that showcases everything you create, 
            share, and love. Perfect for creators, developers, and entrepreneurs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="group flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-all hover:scale-105"
            >
              Create Your Home
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#examples"
              className="px-8 py-4 bg-green-950/50 hover:bg-green-900/50 text-green-200 border border-green-800/50 rounded-xl font-semibold transition-all"
            >
              See Examples
            </a>
          </div>
        </div>
      </section>

      {/* Example Profiles Section */}
      <section id="examples" className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              See what others are building
            </h2>
            <p className="text-green-200/70 text-lg">
              Join thousands of creators sharing their world with Home.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {exampleProfiles.map((profile, index) => (
              <div 
                key={index}
                className="group bg-gradient-to-b from-green-950/50 to-green-900/30 border border-green-800/30 rounded-3xl p-6 hover:border-green-600/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Mock Phone Screen */}
                <div className="bg-black rounded-2xl p-4 border border-green-900/30">
                  {/* Profile Header */}
                  <div className="text-center mb-4">
                    <div 
                      className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3"
                      style={{ backgroundColor: profile.avatarColor }}
                    >
                      {profile.name.charAt(0)}
                    </div>
                    <h3 className="text-white font-semibold">{profile.name}</h3>
                    <p className="text-green-400 text-sm">{profile.handle}</p>
                    <p className="text-gray-400 text-xs mt-1">{profile.bio}</p>
                  </div>

                  {/* Links */}
                  <div className="space-y-2">
                    {profile.links.map((link, linkIndex) => (
                      <div
                        key={linkIndex}
                        className="flex items-center gap-3 p-3 rounded-xl text-left"
                        style={{ backgroundColor: link.color + "20" }}
                      >
                        <span className="text-xl">{link.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{link.title}</p>
                          <p className="text-gray-400 text-xs truncate">{link.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-green-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need
            </h2>
            <p className="text-green-200/70 text-lg">
              Powerful features, beautifully simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-8 bg-gradient-to-br from-green-950/30 to-transparent border border-green-800/20 rounded-2xl hover:border-green-700/40 transition-all"
              >
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-green-200/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-green-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-400/30 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Premium Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Unlock more with Premium
            </h2>
            <p className="text-green-200/70 text-lg max-w-2xl mx-auto">
              Upgrade for $5/month and get unlimited links, analytics, premium themes, and more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumFeatures.map((feature, index) => (
              <div 
                key={index}
                className="p-6 bg-gradient-to-br from-amber-950/20 to-transparent border border-amber-800/20 rounded-2xl hover:border-amber-600/40 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-green-200/60 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-green-950 rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-green-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-green-200/70 text-lg">
              Get your Home page live in under 2 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="p-8 bg-gradient-to-br from-green-950/40 to-black border border-green-800/30 rounded-2xl">
                  <span className="text-6xl font-bold text-green-600/30 absolute top-4 right-4">{step.step}</span>
                  <h3 className="text-xl font-semibold text-white mb-3 mt-2">{step.title}</h3>
                  <p className="text-green-200/60">{step.description}</p>
                </div>
                
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-green-600 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-green-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-green-600/20 to-orange-600/20 border border-green-500/30 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              Ready to create your Home?
            </h2>
            <p className="text-xl text-green-200/80 mb-8 max-w-2xl mx-auto">
              Join thousands of creators, developers, and entrepreneurs 
              who trust Home to share their digital presence.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {["Free to start", "No ads", "Upgrade anytime"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-green-300">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-green-900 hover:bg-green-50 rounded-xl font-bold text-lg transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-12 border-t border-green-900/30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Home</span>
            <span className="text-green-400">— Your link, your way.</span>
          </div>
          <p className="text-green-400/60 text-sm">
            © 2026 Home. Built with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
