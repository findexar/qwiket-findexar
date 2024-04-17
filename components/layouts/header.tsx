'use client';
import ThemeSwitch from './theme-switch';
import LeagueTabs from '../nav/league-tabs';
interface HeaderProps{
    context:any
}
const Header: React.FC<HeaderProps> = ({context}) => {
    const {fallback} = context;
    return <div>
        <div className="flex items-center md:px-8 justify-between dark:bg-slate-700 bg-slate-100 w-full m-0 p-4">


            <div className="flex">
                <div className="flex m-2 md:my-4 md:ml-4 md:mr-20 items-center justify-center h-14 w-14 rounded-full bg-blue-500 text-white text-2xl font-medium">
                    Q
                </div>
                <div className="p-2 md:p-4">
                    <div className="text-xl md:text-3xl">QWIKET</div>
                    <div className="text-sm">Sports Media Index</div>
                </div>
            </div>

            <div className="m-4"><ThemeSwitch /></div>
        </div>
        <div> <LeagueTabs fallback={fallback}/> </div>
    </div>
}
export default Header;