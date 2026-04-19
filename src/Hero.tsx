import clsx, { type ClassValue } from 'clsx'
import { motion } from 'motion/react'
import { twMerge } from 'tailwind-merge'
import { VideoBackground } from './components/ui/VideoBackground'

const mergeClassNames = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#010101]">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8"
      >
        <div className="font-display text-xl font-bold text-white">visualjoy®</div>
        <div className="font-body hidden items-center gap-7 text-sm font-normal text-white/80 lg:flex">
          {['Home', 'About Us', 'Services', 'Pricing', 'Case study', 'Blogs'].map((item) => (
            <a
              key={item}
              href="#"
              className={mergeClassNames(
                'transition-colors duration-300 hover:text-white',
                item === 'Home' && 'text-white',
              )}
            >
              {item}
            </a>
          ))}
        </div>
        <button className="font-body rounded-full border border-white/30 px-5 py-2 text-sm text-white transition-colors hover:border-white/70">
          Contact Us
        </button>
      </motion.nav>

      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pt-12 text-center md:pt-20">
        <div className="font-body text-sm font-normal uppercase tracking-[0.24em] text-white/45">
          Next-generation product studio
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="font-display mt-6 text-[clamp(3rem,8vw,7rem)] leading-[1.05] font-extrabold tracking-[-0.02em] text-white"
        >
          <span className="block">Your Vision</span>
          <span className="block">Our Digital Reality.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          className="font-body mx-auto mt-6 max-w-[520px] text-[clamp(1rem,2vw,1.25rem)] font-light text-white/[0.55]"
        >
          We turn bold ideas into modern designs that don't just look amazing, they
          grow your business fast.
        </motion.p>
      </div>

      <VideoBackground />
    </section>
  )
}
