import style from './container.module.css'

function Container ({children}: {children: React.ReactNode}) {
    return (
        <div className={`${style.container} w-full px-4 sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px]`}>
            {children}
        </div>
    )
}

export default Container