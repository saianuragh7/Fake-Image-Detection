import { Navbar } from "@/components/layout/Navbar";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Eye, Cpu, Lock, ChevronRight, Activity, Database, CheckCircle2 } from "lucide-react";

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <Navbar />

      {/* Hero Section — sits over the global video background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Soft vignette at the very bottom so the next section blends in */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />

        <div className="relative z-10 px-6 w-full max-w-5xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="glass-panel rounded-3xl p-8 md:p-14 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono mb-8 uppercase tracking-widest"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>V2.4 Model · Live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
            >
              Don't Believe{" "}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                Every Pixel.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.35 }}
              className="text-base md:text-lg text-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Deepfake forensics for the misinformation era. Instantly verify
              the authenticity of any image using our hybrid CNN and
              feature-extraction models.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Button
                asChild
                size="lg"
                className="text-base h-14 px-8 rounded-full shadow-[0_0_24px_rgba(0,255,255,0.35)] hover:shadow-[0_0_36px_rgba(0,255,255,0.55)] transition-all group"
              >
                <Link href="/detect">
                  Verify an Image
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="text-base h-14 px-6 rounded-full text-foreground/80 hover:text-foreground hover:bg-white/5"
              >
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features / Value Prop */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">Uncover the Invisible</h2>
          <p className="text-muted-foreground text-lg">
            Generative AI has crossed the uncanny valley. Our detection pipeline looks for artifacts that human eyes cannot see.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Sub-pixel Analysis</h3>
            <p className="text-muted-foreground">
              Analyzes noise patterns, blending artifacts, and edge compression anomalies inherent to diffusion models.
            </p>
          </motion.div>
          <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="glass-card p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Hybrid Architecture</h3>
            <p className="text-muted-foreground">
              Combines traditional error level analysis (ELA) with a deep convolutional neural network trained on 10M+ images.
            </p>
          </motion.div>
          <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="glass-card p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Cryptographic Proof</h3>
            <p className="text-muted-foreground">
              Every scan is securely logged, creating a forensic trail that media organizations can rely on for fact-checking.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it Works / Architecture */}
      <section className="py-24 border-y border-white/5 bg-background/80 backdrop-blur-md relative z-10 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn}>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-6">Inside the Black Box</h2>
            <div className="space-y-6">
              {[
                { title: "Frequency Domain Shift", desc: "Transforms the image to the frequency domain to detect synthetic grid structures." },
                { title: "Semantic Consistency", desc: "Checks lighting, shadow vectors, and physical geometry for structural impossibilities." },
                { title: "Generator Fingerprinting", desc: "Identifies unique noise signatures left by Midjourney, DALL-E, and Stable Diffusion." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-8 border-primary/30 text-primary hover:bg-primary hover:text-black">
              Read the Whitepaper
            </Button>
          </motion.div>

          <motion.div {...fadeIn} className="relative aspect-square md:aspect-video rounded-xl border border-white/10 bg-card/30 overflow-hidden flex items-center justify-center p-8">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent" />
             <div className="relative w-full max-w-sm space-y-4">
               <div className="glass-card p-4 flex items-center gap-4 text-sm font-mono border-l-4 border-l-primary">
                 <Database className="w-5 h-5 text-primary" />
                 <span>Extracting Spatial Features</span>
                 <Activity className="w-4 h-4 ml-auto text-primary animate-pulse" />
               </div>
               <div className="glass-card p-4 flex items-center gap-4 text-sm font-mono border-l-4 border-l-chart-3 ml-8">
                 <Database className="w-5 h-5 text-chart-3" />
                 <span>Analyzing Noise Residuals</span>
                 <Activity className="w-4 h-4 ml-auto text-chart-3 animate-pulse" />
               </div>
               <div className="glass-card p-4 flex items-center gap-4 text-sm font-mono border-l-4 border-l-destructive ml-16">
                 <Database className="w-5 h-5 text-destructive" />
                 <span>Cross-referencing Signatures</span>
                 <Activity className="w-4 h-4 ml-auto text-destructive animate-pulse" />
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center relative z-10">
        <motion.div {...fadeIn}>
          <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-6">Restoring Trust in Media</h2>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            In a world where seeing is no longer believing, Verisight provides the ground truth. Built for newsrooms, intelligence agencies, and social platforms fighting targeted disinformation campaigns.
          </p>
          <Button asChild size="lg" className="h-12 px-8 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <Link href="/dashboard">View Global Analytics</Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background/85 backdrop-blur-md py-12 px-6 md:px-12 relative z-10 text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground tracking-tight">VERISIGHT</span>
          </div>
          <div className="flex gap-6">
            <Link href="/detect" className="hover:text-primary transition-colors">Detect</Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Analytics</Link>
            <span className="cursor-not-allowed opacity-50">API Documentation</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Verisight Intelligence. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
