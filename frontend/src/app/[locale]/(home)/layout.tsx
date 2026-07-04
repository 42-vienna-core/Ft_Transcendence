import Background from "@/ui/bg";
import Nav from "@/ui/nav";
import { ReactNode } from "react";
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";


async function HomeLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);
    const isAuthorized = session?.user ? true : false;

    return (
        <>
            <header className="bg-[var(--color-bg-base)]">
                <Nav isAuthorized={isAuthorized}/>
            </header>
            <main>
                {children}
            </main>
        </>
 );
}

export default HomeLayout;