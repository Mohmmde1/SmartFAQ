import Header from '@/components/landingPage/header'
import Hero from '@/components/landingPage/hero'
import HowItWorks from '@/components/landingPage/how-it-works'
import WhyChooseUs from '@/components/landingPage/why-choose-us'
import StartToday from '@/components/landingPage/start-today'
import Footer from '@/components/landingPage/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <WhyChooseUs />
        <StartToday />
      </main>
      <Footer />
    </div>
  )
}
