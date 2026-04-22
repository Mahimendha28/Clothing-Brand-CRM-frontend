import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, User } from "lucide-react";

import Button from "../components/common/Button";
import { landingContent } from "../data/themeContent";

function LandingPage() {
  const [activeTabs, setActiveTabs] = useState(() =>
    landingContent.shoppingSections.reduce((acc, section) => {
      acc[section.id] = section.tabs[0]?.label ?? "";
      return acc;
    }, {})
  );

  return (
    <div className="ui-shell relative">
      <header className="absolute top-0 z-50 w-full">
        <div className="ui-container flex items-center justify-between py-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {landingContent.brand}
          </h1>

          <nav className="hidden items-center gap-10 text-[10px] font-semibold uppercase tracking-[0.24em] text-secondary md:flex">
            {landingContent.navigation.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-ink">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-ink transition-colors hover:text-secondary">
              <User className="h-5 w-5" />
            </Link>
            <button className="text-ink transition-colors hover:text-secondary">
              <ShoppingBag className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="ui-container grid min-h-[92vh] items-center gap-8 pt-28 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-xl">
            <p className="ui-eyebrow">{landingContent.hero.eyebrow}</p>
            <h2 className="mt-4 font-display text-6xl leading-[0.92] text-ink md:text-7xl">
              {landingContent.hero.title}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-8 text-secondary">
              {landingContent.hero.description}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/login">
                <Button>{landingContent.hero.primaryAction}</Button>
              </Link>
              <a href="#collections">
                <Button variant="secondary">{landingContent.hero.secondaryAction}</Button>
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-luxe border border-line bg-card shadow-float">
            <div className="absolute left-8 top-8 z-10 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-ink backdrop-blur-sm">
              Campaign visual
            </div>
            <img
              src={landingContent.hero.image}
              alt="Hero Fashion"
              className="h-[680px] w-full object-cover"
            />
          </div>
        </section>

        <section id="collections" className="ui-container py-24">
          <div className="space-y-20">
            {landingContent.shoppingSections.map((section) => {
              const currentTabLabel = activeTabs[section.id] || section.tabs[0]?.label;
              const activeTab =
                section.tabs.find((tab) => tab.label === currentTabLabel) || section.tabs[0];

              return (
                <div key={section.id}>
                  <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                        {section.subtitle}
                      </p>
                      <h3 className="mt-2 font-display text-4xl text-ink">{section.title}</h3>
                    </div>
                    <a
                      href="#archive"
                      className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-ink"
                    >
                      {section.ctaLabel} <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="mb-8 flex flex-wrap gap-3">
                    {section.tabs.map((tab) => {
                      const isActive = tab.label === activeTab?.label;
                      return (
                        <button
                          key={`${section.id}-${tab.label}`}
                          type="button"
                          onClick={() =>
                            setActiveTabs((prev) => ({
                              ...prev,
                              [section.id]: tab.label
                            }))
                          }
                          className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                            isActive
                              ? "border-ink bg-ink text-white"
                              : "border-line bg-transparent text-secondary hover:border-ink hover:text-ink"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {activeTab?.items.map((item) => (
                      <article key={item.title} className="group">
                        <div className="overflow-hidden rounded-card border border-line bg-card shadow-soft">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="mt-4 flex items-start justify-between">
                          <div>
                            <h4 className="font-display text-2xl text-ink">{item.title}</h4>
                            <p className="mt-1 text-sm text-secondary">{item.note}</p>
                          </div>
                          <span className="text-sm font-semibold text-ink">{item.price}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="atelier" className="bg-sidebar py-24">
          <div className="ui-container">
            <div className="mb-16 text-center">
              <p className="ui-eyebrow">Visual direction</p>
              <h3 className="mt-3 font-display text-5xl text-ink">Two campaign stories</h3>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {landingContent.featureStories.map((story) => (
                <article key={story.title} className="group relative h-[420px] overflow-hidden rounded-luxe bg-black shadow-float">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(33,24,19,0.08)_0%,rgba(33,24,19,0.58)_100%)]" />
                  <div className="absolute bottom-10 left-10 max-w-[70%]">
                    <p className="mb-3 inline-block rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white">
                      {story.eyebrow}
                    </p>
                    <h4 className="font-display text-4xl text-white">{story.title}</h4>
                    <p className="mt-3 text-sm leading-6 text-white/80">{story.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="archive" className="ui-container py-28">
          <div className="grid items-center gap-16 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="ui-eyebrow">Archive</p>
              <h3 className="mb-10 mt-3 font-display text-[52px] leading-tight text-ink">
                Explore the visual archive.
              </h3>
              <ul className="space-y-6">
                {["Women", "Men", "Kids"].map((cat) => (
                  <li key={cat} className="group flex items-center gap-4">
                    <span className="text-2xl font-display text-secondary transition-colors group-hover:text-ink">
                      {cat}
                    </span>
                    <div className="h-px w-12 bg-line transition-colors group-hover:bg-ink" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative grid grid-cols-2 gap-6">
              <img
                src={landingContent.archiveImages[0]}
                alt="Archive 1"
                className="mt-16 h-[500px] w-full rounded-card object-cover shadow-soft"
              />
              <img
                src={landingContent.archiveImages[1]}
                alt="Archive 2"
                className="-mt-8 h-[500px] w-full rounded-card object-cover shadow-soft"
              />
            </div>
          </div>
        </section>

        <section id="journal" className="bg-sidebar px-8 py-32 text-center">
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <p className="font-display text-2xl italic text-secondary">The Atelier Philosophy</p>
            <h3 className="mb-8 mt-4 font-display text-6xl leading-tight text-ink">
              Crafting quiet luxury.
            </h3>
            <p className="max-w-lg text-sm leading-8 text-secondary">
              Founded around tactile storytelling, the experience balances editorial brand expression with practical CRM workflows. The same palette, spacing, and component language now carries from landing page to protected admin screens.
            </p>
            <img
              src={landingContent.philosophyImage}
              alt="Craft Process"
              className="mt-10 h-32 w-32 rounded-card object-cover grayscale"
            />
          </div>
        </section>
      </main>

      <footer className="bg-charcoal px-8 py-16 text-[#e4e1db]">
        <div className="ui-container grid gap-16 border-b border-white/10 pb-16 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-4xl">Join the journal.</h3>
            <p className="mt-4 max-w-sm text-sm text-white/60">
              Receive occasional editorial-led updates on campaign drops, client styling, and atelier notes.
            </p>
          </div>
          <div className="flex flex-col justify-end">
            <div className="flex gap-4 border-b border-white/20 pb-2">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
              <button className="bg-white px-6 py-2 text-xs font-bold uppercase tracking-widest text-charcoal">
                Subscribe
              </button>
            </div>
            <p className="mt-3 text-[9px] text-white/40">By subscribing, you agree to our Privacy Policy.</p>
          </div>
        </div>

        <div className="ui-container grid gap-8 pt-12 md:grid-cols-4">
          <div className="pr-6 md:col-span-1">
            <h3 className="font-display text-2xl italic">{landingContent.brand}</h3>
            <p className="mt-4 text-xs leading-relaxed text-white/40">
              Designed for a warmer premium retail experience with a matching CRM workspace.
            </p>
          </div>
          <div>
            <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em]">Support</p>
            <ul className="space-y-3 text-xs text-white/60">
              <li><a href="#" className="transition-colors hover:text-white">Shipping</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Returns</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em]">Legal</p>
            <ul className="space-y-3 text-xs text-white/60">
              <li><a href="#" className="transition-colors hover:text-white">Sustainability</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Privacy</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Terms</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em]">Follow</p>
            <ul className="flex gap-4 text-xs text-white/60">
              <li><a href="#" className="transition-colors hover:text-white">Instagram</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Pinterest</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
