'use client';

import Hero from '@/components/hero';
import Features from '@/components/features';
import Container from '@/components/container';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

 function HomePage() {
  // const session = useSession();
  // console.log(session.status);

  // useEffect(() => {
  //   if (session.data?.error === "RefreshAccessTokenError" || session.status === "unauthenticated") {
  //     signOut({callbackUrl: "/login", redirect: true});
  //   } 
  // }, [session]);

  return (
    <Container>
      <Hero/>
      <Features/>
    </Container>
  );
}

export default HomePage