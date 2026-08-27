function Container ({children}: {children: React.ReactNode}) {
    return (
        <div className="mx-auto w-full px-4 py-[15px] sm:max-w-[540px] sm:px-8 md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px]">
            {children}
        </div>
    )
}

export default Container
