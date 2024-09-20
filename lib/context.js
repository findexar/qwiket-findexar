// ./lib/context.js
import { createContext, useContext } from 'react';

const AppContext = createContext();
//params={params} params2={params2} tp={tp} findexarxid={localFindexarxid} view={view} tab={tab}
//sessionid={sessionid} league={localLeague} team={localTeam} player={localPlayer} setLocalLeague={setLocalLeague} setLocalTeam={setLocalTeam} setLocalPlayer={setLocalPlayer} setLocalPageType={setLocalPageType} setLocalView={setLocalView} setLocalTab={setLocalTab}
export function AppWrapper({ children,
  isMobile,
  params,
  params2,
  tp,
  tp2,
  findexarxid,
  slug,
  fbclid,
  utm_content,
  view,
  tab,
  league,
  setView,
  setTab,
  fallback,
  setLeague,
  teamid,
  player,
  athleteUUId,
  setAthleteUUId,
  setTeamid,
  setPlayer,
  pagetype,
  setPagetype,
  mode,
  setMode,
  teamName,
  setTeamName,
  setFindexarxid,
  setSlug,
  user,
  userAccount,
  userAccountMutate,
  prompt,
  promptUUId



}) {

  let sharedState = { fallback, isMobile, params, params2, tp, tp2, findexarxid, slug, view, tab, league, setView, setTab, fbclid, utm_content, setLeague, teamid, player, athleteUUId, setAthleteUUId, setTeamid, setPlayer, pagetype, setPagetype, mode, setMode, teamName, setTeamName, setFindexarxid, setSlug, user, userAccount, userAccountMutate, prompt, promptUUId };

  return (
    <AppContext.Provider value={sharedState}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}