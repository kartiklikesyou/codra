import React from "react";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Hobby",
    price: "$0",
    period: "forever",
    description: "For individual builders and developers exploring AI-assisted workflows.",
    features: [
      "Up to 3 active projects",
      "Standard code generation engine",
      "Public GitHub exports",
      "Community support",
    ],
    buttonText: "Start free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "per month",
    description: "For professionals who ship production-grade software daily.",
    features: [
      "Unlimited projects & generations",
      "Advanced Codra v1 Agent",
      "Private repository sync",
      "Custom system prompts & rules",
      "Priority background execution",
    ],
    buttonText: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "tailored",
    description: "For engineering teams requiring dedicated compute, security, and SSO.",
    features: [
      "Dedicated sandboxed clusters",
      "Custom LLM fine-tuning",
      "SAML SSO & audit logs",
      "99.9% uptime SLA & dedicated lead",
    ],
    buttonText: "Contact sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20 border-t border-zinc-800/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-14 space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
            Predictable, developer-friendly tiers
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Start building for free, scale as your projects grow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl border p-6 sm:p-8 flex flex-col justify-between transition-all ${
                tier.popular
                  ? "border-zinc-700 bg-zinc-950/90 ring-1 ring-zinc-700/50 shadow-xl"
                  : "border-zinc-800/60 bg-zinc-950/30 hover:border-zinc-700/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-zinc-100">{tier.name}</h3>
                  {tier.popular && (
                    <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                      Popular
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 mb-6 min-h-[32px]">{tier.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
                    {tier.price}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">/{tier.period}</span>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-xs font-medium text-zinc-300">Includes:</p>
                  <ul className="space-y-2.5 text-xs text-zinc-400">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5">
                        <Check className="size-3.5 text-zinc-300 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button (strictly NO redirect) */}
              <button
                type="button"
                className={`w-full h-9 rounded-lg text-xs font-semibold shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                  tier.popular
                    ? "bg-zinc-100 text-zinc-900 hover:bg-white active:scale-[0.98]"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800/80 hover:text-white"
                }`}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
