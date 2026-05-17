import Hero from "./(Components)/Hero/page"
import Features from "../app/(Components)/features/page"

const Home = () => {
  return (
    <main className="bg-black text-white">
          <Hero />
          <Features/>
    </main>
  )
}

export default Home;