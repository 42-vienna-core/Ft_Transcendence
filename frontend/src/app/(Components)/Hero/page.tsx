// import { cookies } from 'next/headers';
// import {redirect } from 'next/navigation';

import Hero from './Hero';

export default async function Page() {

    // const cookieStore = await cookies();
    // const token = cookieStore.get("token");

    // if (!token) {
    //     redirect("/Register");
    // }
    return <Hero />;
}