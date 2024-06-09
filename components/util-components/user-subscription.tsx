import { createCheckoutSession } from "@/lib/actions/stripe";
import getStripe from "@/lib/get-stripejs";
/*
Create a responsive (full screen on small screen) modal dialog governed by "openCreateUser" state that tells user that he needs to create the user account or login if he wants to have more than 10 fantasy players in his My Team.
*/
interface SignInModalProps {
    setOpenLimitSubscriptionModal: (open: boolean) => void;
    subscrLevel: number;
}
const LimitSubscriptionModal = ({ setOpenLimitSubscriptionModal, subscrLevel }: SignInModalProps) => {

    const handleClose = () => {
        console.log("handleClose")
        setOpenLimitSubscriptionModal(false);
    };
    const handleRedirect =async  (level:number) => {
        const id=await createCheckoutSession(level,"hosted")
        console.log("id",id)
        const stripe = await getStripe();
        const { error } = await stripe!.redirectToCheckout({
          // Make the id field from the Checkout Session creation API response
          // available to this file, so you can provide it as parameter here
          // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
          sessionId: id,
        });
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer
        // using `error.message`.
        console.warn(error.message);
      
    }
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto ">
            <div className="fixed inset-0 bg-black bg-opacity-50">
                <div className="flex items-center justify-center min-h-screen w-full">

                    <div className="bg-white p-5 rounded-lg w-full max-w-sm mx-auto sm:w-auto dark:bg-gray-800">
                        <h2 className="text-lg font-bold">{process.env.NEXT_PUBLIC_APP_NAME} Subscription</h2>

                        <a href="https://billing.stripe.com/p/login/5kA4gEevO8z41ckcMM" target="_blank" rel="noopener noreferrer"><p className="text-xs text-blue-500">Manage your subscription on Stripe</p></a>
                        <p className="mt-4">Upgrade Subscription:</p>
                        {subscrLevel == 0 && <div className="mt-4 bg-gray-200 text-gray-700 p-2 rounded-lg">
                            <div>Silver, $2.99/month</div>
                            <div className="text-xs mb-2"> Up to 10 players in each league, 20 total.</div>
                            <button className="bg-blue-500 hover:bg-green-700 text-xs text-white font-bold py-2 px-4 rounded" onClick={async () => await handleRedirect(1)}>
                                Upgrade
                            </button>
                        </div>}
                        {subscrLevel < 2 && <div className="mt-4 bg-amber-500 text-gray-100 p-2 rounded-lg">
                            <div>Gold, $5.99/month</div>
                            <div className="text-xs mb-2"> Up to 20 players in each league, 40 total.</div>
                            <button className="bg-blue-500 hover:bg-green-700 text-xs text-white font-bold py-2 px-4 rounded" onClick={async () => await handleRedirect(2)}>
                                Upgrade
                            </button>
                        </div>}
                        {subscrLevel < 3 && <div className="mt-4 bg-green-500 text-gray-100 p-2 rounded-lg" >
                            <div>Unlimited Monthly, $9.99/month</div>
                            <div className="text-xs mb-2"> Unlimited players in MyTeam.</div>
                            <button className="bg-blue-500 hover:bg-green-700 text-xs text-white font-bold py-2 px-4 rounded" onClick={async () => await handleRedirect(3)}>
                                Upgrade
                            </button>
                        </div>}
                        {subscrLevel < 4 && <div className="mt-4 bg-green-500 text-gray-100 p-2 rounded-lg">
                            <div>Unlimited Yearly, $99.99/year</div>
                            <div className="text-xs mb-2"> Unlimited players in MyTeam.</div>
                            <button className="bg-blue-500 hover:bg-green-700 text-xs text-white font-bold py-2 px-4 rounded" onClick={async () => await handleRedirect(4)}>
                                Upgrade
                            </button>
                        </div>}
                        <div className="flex justify-end">
                            <button onClick={handleClose} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LimitSubscriptionModal;


