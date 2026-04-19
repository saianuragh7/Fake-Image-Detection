import LiquidBackground from "./components/LiquidBackground"
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Marquee from "./components/Marquee"
import HowItWorks from "./components/HowItWorks"
import ModelStats from "./components/ModelStats"
import TryIt from "./components/TryIt"
import Footer from "./components/Footer"

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05050a] text-white selection:bg-[#D4FF00]/25 selection:text-white">
      <LiquidBackground />
      <Navbar />

      <main className="relative z-10 flex flex-col">
        <Hero />
        <Marquee />
        <HowItWorks />
        <ModelStats />
        <TryIt />
      </main>

      <Footer />
    </div>
  )
}

export default App
