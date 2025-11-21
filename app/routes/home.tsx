import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Formula 1 Hub - Your Racing Portal" },
    { name: "description", content: "Explore Formula 1 data, results, and more!" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white">

      {/* HERO */}
      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0 opacity-20 bg-[url('/f1_pattern.svg')] bg-cover bg-center pointer-events-none" />

        <div className="relative container mx-auto px-4 text-center">
          <Badge className="bg-red-600/80 text-white px-4 py-1 text-sm rounded-full tracking-wider">
            Formula 1 Data Hub
          </Badge>

          <h1 className="mt-8 text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Dive Into the <span className="text-red-500">World of Speed</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            The ultimate platform for Formula 1 statistics, results, drivers, constructors and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg">
              <Link to="/database">Start Exploring</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-lg px-10 py-6 rounded-xl">
              <Link to="/chart">View Charts</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-neutral-950">
        <div className="container mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Core Features
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              The essential tools every Formula 1 enthusiast needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">

            {/* Feature Card */}
            {[
              {
                icon: "📊",
                title: "Database Explorer",
                text: "Browse drivers, races, circuits and results.",
                link: "/database"
              },
              {
                icon: "📈",
                title: "Interactive Charts",
                text: "Visualize performance trends and race statistics.",
                link: "/chart"
              },
              {
                icon: "✏️",
                title: "CRUD Operations",
                text: "Manage and update database entries with ease.",
                link: "/crud"
              },
              {
                icon: "💬",
                title: "Messages",
                text: "Handle contact messages and user feedback.",
                link: "/messages"
              },
              {
                icon: "📧",
                title: "Contact",
                text: "Get support or send feedback.",
                link: "/contact"
              },
              {
                icon: "🔐",
                title: "Admin Panel",
                text: "Access admin tools and platform controls.",
                link: "/admin"
              }
            ].map((f, i) => (
              <Card key={i} className="bg-neutral-900/60 border border-neutral-800 hover:border-red-600 transition-all duration-300 rounded-xl">
                <CardHeader>
                  <div className="w-14 h-14 text-3xl bg-neutral-800 rounded-xl flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <CardTitle className="text-xl">{f.title}</CardTitle>
                  <CardDescription className="text-gray-400">{f.text}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="link" className="text-red-500 p-0">
                    <Link to={f.link}>Explore →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-lg text-red-100 max-w-xl mx-auto mb-10">
            Explore real race data, compare drivers and analyze performance like never before.
          </p>

          <Button asChild size="lg" className="bg-white text-red-700 font-bold text-lg px-10 py-6 rounded-xl shadow-lg hover:bg-gray-100">
            <Link to="/database">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-12 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Formula 1 Hub. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
