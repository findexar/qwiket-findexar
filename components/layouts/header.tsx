import ThemeSwitch from '../layouts/theme-switch';
const Header: React.FC = () => {

    return <div className="flex items-center h-32 justify-between dark:bg-slate-700 bg-slate-100 w-full m-0 p-4">
        <div className="flex">
            <div className="flex m-4 items-center justify-center h-14 w-14 rounded-full bg-blue-500 text-white text-2xl font-medium">
                Q
            </div>
            <div className="p-4">
                <div className="text-3xl">QWIKET</div>
                <div>Sports Media Index</div>
            </div>
        </div>

        <div className="m-4"><ThemeSwitch /></div>
    </div>
}
export default Header;