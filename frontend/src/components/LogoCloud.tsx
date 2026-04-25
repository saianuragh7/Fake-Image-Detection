import { InfiniteSlider } from "./ui/infinite-slider"

const logos = [
  { name: "OpenAI", url: "https://html.tailus.io/blocks/customers/openai.svg" },
  { name: "Nvidia", url: "https://html.tailus.io/blocks/customers/nvidia.svg" },
  { name: "GitHub", url: "https://html.tailus.io/blocks/customers/github.svg" },
  { name: "Vercel", url: "https://html.tailus.io/blocks/customers/vercel.svg" },
  { name: "Stripe", url: "https://html.tailus.io/blocks/customers/stripe.svg" },
  { name: "Linear", url: "https://html.tailus.io/blocks/customers/linear.svg" },
  { name: "Supabase", url: "https://html.tailus.io/blocks/customers/supabase.svg" },
  { name: "PostHog", url: "https://html.tailus.io/blocks/customers/posthog.svg" },
]

export default function LogoCloud() {
  return (
    <section
      id="trusted-teams"
      className="relative z-20 w-full scroll-mt-24 border-t border-white/5 bg-black/20 py-8 backdrop-blur-sm sm:py-10"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-5 sm:px-8 lg:flex-row lg:gap-10">
        <div className="flex w-full flex-col items-center justify-center text-center lg:w-auto lg:flex-row lg:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/60 sm:text-sm">
            Powering the best teams
          </p>
          <span className="mt-4 hidden h-10 w-px bg-white/10 lg:ml-8 lg:mt-0 lg:block" />
        </div>

        <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <InfiniteSlider speed={75}>
            {logos.map((logo) => (
              <img
                key={logo.name}
                src={logo.url}
                alt={logo.name}
                loading="lazy"
                className="h-7 w-auto shrink-0 object-contain brightness-0 invert opacity-65 transition-opacity duration-300 hover:opacity-100 sm:h-8"
              />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  )
}
