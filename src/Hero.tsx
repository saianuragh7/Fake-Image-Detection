import { VideoBackground } from './components/ui/video-background'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative z-20 mx-auto max-w-4xl px-6 pb-32 pt-24 text-center md:pb-40 md:pt-32">
        <h1 className="bg-gradient-to-r from-[#FA93FA] via-[#C967E8] to-[#983AD6] bg-clip-text text-4xl font-semibold tracking-tight text-transparent md:text-6xl">
          <span className="block">Your Vision</span>
          <span className="block">Our Digital Reality</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-white/80 md:text-lg">
          Modern AI experiences powered by motion and design.
        </p>
      </div>
      <VideoBackground />
    </section>
  )
}
