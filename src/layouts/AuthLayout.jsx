import { Outlet } from "react-router-dom";
import { authSlides } from "../data/themeContent";

function AuthLayout() {
  return (
    <div className="ui-shell overflow-hidden px-4 py-4 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-5 lg:grid-cols-[1.15fr_420px]">
        <section className="relative hidden min-h-[680px] overflow-hidden rounded-luxe border border-line bg-card shadow-float lg:block">
          {authSlides.map((slide, index) => (
            <div
              key={slide.title}
              className="auth-slide absolute inset-0 flex items-end"
              style={{ animationDelay: `${index * 5}s` }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${slide.image}')` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(54,38,27,0.1)_0%,rgba(54,38,27,0.16)_24%,rgba(54,38,27,0.66)_100%)]" />
              <div className="absolute left-10 top-10 h-24 w-24 rounded-full border border-white/35 bg-white/10 backdrop-blur-sm" />
              <div className="absolute right-12 top-10 h-44 w-36 rounded-[2rem] border border-white/30 bg-white/10 backdrop-blur-sm" />
              <div className="absolute right-24 top-40 h-24 w-52 rounded-[2rem] border border-white/25 bg-white/10 backdrop-blur-sm" />

              <div className="relative z-10 p-10">
                <p className="text-[11px] uppercase tracking-[0.38em] text-white/80">{slide.eyebrow}</p>
                <h1 className="mt-5 max-w-2xl font-display text-5xl leading-[0.95] text-white xl:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-white/85">{slide.text}</p>

                <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/20 px-4 py-2.5 backdrop-blur-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  <span className="text-sm font-medium text-white">{slide.label}</span>
                </div>

                <div className="mt-8 flex gap-2">
                  {authSlides.map((_, dotIndex) => (
                    <span
                      key={dotIndex}
                      className={`h-2.5 rounded-full ${
                        dotIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/45"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="flex items-center justify-end">
          <div className="w-full max-w-[420px]">
            <div className="mb-5 lg:hidden">
              <p className="ui-eyebrow">Clothing Brand CRM</p>
              <h1 className="mt-3 max-w-sm font-display text-4xl leading-none text-ink">
                Fashion operations with one shared visual language.
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted">
                Sign in or create an account to enter your brand workspace.
              </p>
            </div>

            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthLayout;
