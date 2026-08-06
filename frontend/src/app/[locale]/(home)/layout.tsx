import Nav, { NavAuthLinks, NavLinks } from "@/ui/nav";
import { ReactNode } from "react";
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

async function HomeLayout({ children }: { children: ReactNode }) {
    let isAuthorized: boolean = false;
    const session = await getServerSession(authOptions);
    isAuthorized = !!session;

    return (
        <>
            <header className="bg-[var(--color-bg-base)]">
                <Nav>
                    {isAuthorized ? (
                        <NavLinks/>
                        ):(
                        <NavAuthLinks/>
                        )
                    }
                </Nav>
            </header>
            <main>
                {children}
            </main>
        </>
 );
}

export default HomeLayout;