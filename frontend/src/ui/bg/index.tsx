import Image from 'next/image';

function Background({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <Image
          src="/assets/backgroundSnake.webp" 
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}

export default  Background