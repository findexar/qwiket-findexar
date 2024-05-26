import { SignInButton } from "@clerk/nextjs";

/*
Create a responsive (full screen on small screen) modal dialog governed by "openCreateUser" state that tells user that he needs to create the user account or login if he wants to have more than 10 fantasy players in his My Team.
*/
interface SignInModalProps {
    setOpenCreateUser: (open: boolean) => void;
}
const SignInModal = ({ setOpenCreateUser }: SignInModalProps) => {

    const handleClose = () => {
        setOpenCreateUser(false);
    };

    return (
        <div className={`fixed inset-0 z-50 overflow-y-auto'`}>
            <div className="flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 bg-black opacity-50"></div>
                <div className="bg-white p-5 rounded-lg max-w-sm mx-auto">
                    <h2 className="text-lg font-bold">Create {process.env.NEXT_PUBLIC_APP_NAME} Account or Log In</h2>
                    <p>You need to create an account or log in to manage more than 10 fantasy players in your team.</p>
                    <div className="mt-4">
                        <SignInButton mode="modal">
                            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                Sign In / Register
                            </button>
                        </SignInButton>
                    </div>
                    <button onClick={handleClose} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignInModal;


