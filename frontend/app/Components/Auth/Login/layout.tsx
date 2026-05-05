
export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main lang="en" className=" h-full antialiased">
        {children}
    </main>
  );
}
