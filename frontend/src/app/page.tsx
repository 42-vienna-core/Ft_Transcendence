import Hero from "@/src/components/hero/Hero"
import Features from "@/src/components/features/Features"

export default async function Page() {

  console.log("Home page loaded")
  return (
    <main className="bg-black text-white">
          <Hero />
          <Features/>
    </main>
  )
}
