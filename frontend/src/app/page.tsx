import Hero from '@/components/landingPage/hero'
import HowItWorks from '@/components/landingPage/how-it-works'
import WhyChooseUs from '@/components/landingPage/why-choose-us'

export default function Home() {
  return (
    <>
      <Hero />
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="features">
        <WhyChooseUs />
      </section>

    </>
  )
}
