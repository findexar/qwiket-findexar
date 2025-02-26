// ./lib/context.js
import { createContext, useContext } from 'react';

interface AppContextProps {
    children: React.ReactNode;
    isMobile: boolean;
    params: any;
    params2: any;
    tp: any;
    tp2: any;
    findexarxid: string;
    m: string;
    slug: string;
    fbclid: string;
    utm_content: string;
    bot: boolean;
    view: string;
    tab: string;
    rtab: string;
    league: string;
    setView: (view: string) => void;
    setTab: (tab: string) => void;
    setRtab: (rtab: string) => void;
    fallback: any;
    setLeague: (league: string) => void;
    page: string;
    setPage: (page: string) => void;
    teamid: string;
    player: string;
    athleteUUId: string;
    setAthleteUUId: (id: string) => void;
    setTeamid: (id: string) => void;
    setPlayer: (player: string) => void;
    pagetype: string;
    setPagetype: (type: string) => void;
    mode: string;
    setMode: (mode: string) => void;
    teamName: string;
    setTeamName: (name: string) => void;
    teamLogo: string;
    setTeamLogo: (logo: string) => void;
    setFindexarxid: (id: string) => void;
    setM: (m: string) => void;
    setSlug: (slug: string) => void;
    user: any;
    userAccount: any;
    userAccountMutate: any;
    prompt: string;
    promptUUId: string;
    feedback: any;
    setFeedback: (feedback: any) => void;
    relatedContent: any;
    setRelatedContent: (content: any) => void;
    cstory: string;
    setCstory: (cstory: string) => void;
    cm: string;
    setCm: (cm: string) => void;
    today: Date;
    b: string;
    setB: (b: string) => void;
}

type AppContextState = Omit<AppContextProps, 'children'>;

const AppContext = createContext<AppContextState>({} as AppContextState);

export function AppWrapper({ children, ...props }: AppContextProps) {
    let sharedState: AppContextState = props;
    return (
        <AppContext.Provider value={sharedState}>{children}</AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}