import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import LogoCloud from "./components/LogoCloud"
import HowItWorks from "./components/HowItWorks"
import ModelStats from "./components/ModelStats"
import TryIt from "./components/TryIt"
import Footer from "./components/Footer"

export default function App() {
  return (
    <div className="min-h-screen bg-[#050816] text-white selection:bg-cyan-300/25 selection:text-white">
      <Navbar />

      <main className="relative flex w-full flex-col overflow-x-clip">
        <Hero />
        <LogoCloud />
        <HowItWorks />
        <ModelStats />
        <TryIt />
      </main>

      <Footer />
    </div>
  )
}
