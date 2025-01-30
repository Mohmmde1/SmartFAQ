import Hero from '@/components/landing-page/hero'
import HowItWorks from '@/components/landing-page/how-it-works'
import WhyChooseUs from '@/components/landing-page/why-choose-us'

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
