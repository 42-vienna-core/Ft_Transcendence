
export const NavStyles = {
    search: {
        div: "flex items-center gap-2 bg-zinc-900/80 border border-zinc-700 rounded-full px-2 py-2 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500/20 transition-all duration-200  relative",
        input: "bg-transparent border-none outline-none text-sm text-zinc-200 placeholder-zinc-500 w-28 focus:w-34 transition-all duration-300 max-sm:w-20 max-sm:focus:w-24 sm:w-28 ",
    },
    nav: "sticky top-0 z-100 backdrop-blur-xl bg-black border-b border-border-subtle py-4.5 px-8 flex items-center justify-between max-sm:px-4 max-sm:py-3",
    logo: " font-bungee text-2xl text-text-bright tracking-wider cursor-pointer select-none flex items-center gap-2.5 max-sm:text-xl max-sm:gap-1.5",
    logoMark: "w-8 h-8 bg-neon-green rounded-md relative shadow-[0_0_24px_var(--neon-green-glow)] before:content-[''] before:absolute before:bg-bg-void before:rounded-full before:w-1.25 before:h-1.25 before:top-2 before:left-2 after:content-[''] after:absolute after:bg-bg-void after:rounded-full after:w-1.25 after:h-1.25 after:top-2 after:right-2 max-sm:w-6 max-sm:h-6 max-sm:before:w-1 max-sm:before:h-1 max-sm:before:top-1.5 max-sm:before:left-1.5 max-sm:after:w-1 max-sm:after:h-1 max-sm:after:top-1.5 max-sm:after:right-1.5",
    
    navLinks: "flex items-center gap-2 max-sm:gap-1 max-sm:hidden sm:flex",
    navLink: "py-2 px-4 text-text-muted no-underline font-medium text-sm tracking-wide rounded-md cursor-pointer transition-all duration-150 ease-in-out bg-transparent border-0 font-inherit hover:text-text-bright hover:bg-bg-card data-[active=true]:text-neon-green max-sm:px-2 max-sm:text-xs",
    btn: "inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-inherit text-[0.9375rem] font-semibold tracking-wide cursor-pointer border border-transparent transition-all duration-150 ease-in-out no-underline whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:!transform-none disabled:!shadow-none max-sm:py-2 max-sm:px-3 max-sm:text-xs max-sm:gap-1",
    btnPrimary : "btn mr-2 bg-neon-green text-bg-void shadow-[0_0_0_0_var(--neon-green-glow),inset_0_-2px_0_rgba(0,0,0,0.2)] hover:-translate-y-px hover:shadow-[0_0_32px_var(--neon-green-glow),inset_0_-2px_0_rgba(0,0,0,0.2)] active:translate-y-0 px-3 py-1.5 text-sm max-sm:text-xs max-sm:px-2 max-sm:py-1 max-sm:mr-0",
    btnSecondary: "btn ml-2 bg-bg-card text-text-bright border-border-strong hover:bg-bg-elevated hover:border-text-muted px-3 py-1.5 text-sm max-sm:text-xs max-sm:px-2 max-sm:py-1",
   
}