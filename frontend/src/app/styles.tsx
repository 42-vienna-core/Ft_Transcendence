
let Styles = {
    formStyle: 
    {
        inputDiv: "flex justify-between border-b-black border-b-2 max-5 my-4 py-1 m-4",
        inputs: " bg-transparent outline-none placeholder-black text-3xl placeholder:text-xl",
        imgDiv: " flex items-center justify-center",
        btn_submit:  "border border-blue-300 rounded-2xl cursor-pointer text-center text-lg font-bold hover:bg-blue-400 transition-all duration-600 hover:text-blue-100 hover:border-gray-800 p-3 w-2/2 ",
        btn_sin_log: "border border-blue-300 rounded-2xl cursor-pointer text-center text-lg font-bold hover:bg-blue-400 transition-all duration-600 hover:text-blue-100 hover:border-gray-800 text-center p-3 py-1 ml-1"
    },
    hero: {
        hero: "py-20 px-8 pb-[120px] text-center relative",
        heroEyebrow: "inline-block font-jetbrains text-xs text-neon-green tracking-[0.2em] uppercase py-1.5 px-3.5 border border-neon-green rounded-full mb-8 bg-[rgba(0,255,156,0.05)]",
        heroTitle: "mb-6",
        heroAccent: "text-neon-green drop-shadow-[0_0_40px_var(--neon-green-glow)]",
        heroSub: "text-xl text-text-base max-w-[600px] mx-auto mb-12 mt-5",
        heroActions: "flex gap-4 justify-center mb-20 flex-wrap",
        heroGamePreview: "max-w-[720px] mx-auto bg-bg-card border border-border-strong rounded-2xl p-6 relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(0,255,156,0.08),transparent_50%)] before:pointer-events-none",
        previewCanvas: "w-full aspect-video bg-bg-deep rounded-lg relative overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:24px_24px]",
        previewSnake: "absolute w-4 h-4 rounded-[3px] bg-neon-green shadow-[0_0_12px_var(--neon-green-glow)]",
        previewFood: "absolute w-3 h-3 bg-neon-pink rounded-full shadow-[0_0_16px_rgba(255,42,109,0.6)] animate-pulse",
    },
    features: 
    {
        sectionEyebrow: "font-jetbrains text-xs text-neon-green tracking-[0.2em] uppercase mb-4",
        sectionTitle: "text-[clamp(2rem,4vw,3rem)] mb-4 tracking-tight",
        features: "py-20 px-8 pb-[120px]",
        featuresGrid: "grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mt-16",
        featureCard: "bg-bg-card border border-border-subtle rounded-2xl p-8 transition-all duration-200 ease-in-out relative overflow-hidden hover:border-border-strong hover:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-px before:bg-[linear-gradient(90deg,transparent,var(--neon-green),transparent)] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100",
        featureIcon: "w-12 h-12 bg-bg-elevated border border-border-strong rounded-xl flex items-center justify-center text-2xl mb-6",
        featureTitle: "mb-3",
        featureText: "text-text-muted text-[0.9375rem]",
        titleGrid: "text-center max-w-[600px] mx-auto"
    },
    Nav: 
    {
        logo: "font-bungee text-2xl text-text-bright tracking-wider cursor-pointer select-none flex items-center gap-2.5",
        logoMark: "w-8 h-8 bg-neon-green rounded-md relative shadow-[0_0_24px_var(--neon-green-glow)] before:content-[''] before:absolute before:bg-bg-void before:rounded-full before:w-[5px] before:h-[5px] before:top-2 before:left-2 after:content-[''] after:absolute after:bg-bg-void after:rounded-full after:w-[5px] after:h-[5px] after:top-2 after:right-2",
        navLinks: "flex items-center gap-2",
        navLink: "py-2 px-4 text-text-muted no-underline font-medium text-sm tracking-wide rounded-md cursor-pointer transition-all duration-150 ease-in-out bg-transparent border-0 font-inherit hover:text-text-bright hover:bg-bg-card data-[active=true]:text-neon-green",
        btn: "inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-inherit text-[0.9375rem] font-semibold tracking-wide cursor-pointer border border-transparent transition-all duration-150 ease-in-out no-underline whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:!transform-none disabled:!shadow-none",
    },
    btnPrimary: "btn  bg-neon-green text-bg-void shadow-[0_0_0_0_var(--neon-green-glow),inset_0_-2px_0_rgba(0,0,0,0.2)] hover:-translate-y-px hover:shadow-[0_0_32px_var(--neon-green-glow),inset_0_-2px_0_rgba(0,0,0,0.2)] active:translate-y-0",
    btnSecondary: "btn  bg-bg-card text-text-bright border-border-strong hover:bg-bg-elevated hover:border-text-muted"
}

export default Styles;