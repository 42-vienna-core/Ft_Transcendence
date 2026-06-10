import Background from "@/ui/bg";
import Nav from "@/ui/nav";
import { ReactNode } from "react";
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";


async function HomeLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);
    const isAuthorized = session ? true : false;
    return (
        <Background>
            <header>
                <Nav isAuthorized={isAuthorized}/>
            </header>
            <main>
                {children}
            </main>
        </Background>
 );
}

export default HomeLayout;