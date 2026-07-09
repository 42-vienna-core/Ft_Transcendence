import Hero from "@/src/components/hero/Hero"

export default async function Page() {

  console.log("Home page loaded")
  return (
    <main className="bg-black text-white h-screen">
        <Hero />
    </main>
  )
}
