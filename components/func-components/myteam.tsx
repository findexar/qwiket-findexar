'use client';
import React, { use, useCallback, useEffect, useState } from "react";
import Link from 'next/link'
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import { SignInButton, SignedOut, SignedIn, RedirectToSignIn } from "@clerk/nextjs";

import { styled, useTheme } from "styled-components";

import { useAppContext } from '@/lib/context';

import { MyTeamRosterKey } from '@/lib/keys';
import TeamAddIcon from "@/components/icons/usergroup-add";
import TeamRemoveIcon from "@/components/icons/usergroup-delete";
import { actionFetchMyTeam, actionRemoveMyTeamMember } from "@/lib/fetchers/my-team-actions";
import { actionRecordEvent } from "@/lib/actions";
import { FetchMyFeedKey } from '@/lib/keys';
import { actionMyFeed } from '@/lib/fetchers/myfeed';
import Toast from './toaster';

declare global {
    interface Window {
        Clerk: any;
    }
}

const SidePlayer = styled.div<SideProps>`
    color:${props => props.$highlight ? 'var(--myteam)' : 'var(--text)'};
    font-size: 14px;
    padding-left:20px;
    &:hover{
        color:var(--highlight);
    }
    margin: 4px;
    a{
      color:${props => props.$highlight ? 'var(--myteam)' : 'var(--text)'} !important;//#ff8 !important;
      text-decoration: none;
      background-color:${props => props.$highlight ? 'var(--myteam-bg)' : 'var(--background)'} !important;
      &:hover{
        color:var(--highlight) !important;
      }
    }
`;

const TeamName = styled.div`
    height: 30px;
    width: 100%; 
    font-size: 20px;
    padding-top:2px;
    padding-bottom:35px;
`;

const MobileTeamName = styled.div`
    height: 40px;
    color:var(--text); 
    text-align: center;
    font-size: 20px;
    padding-top:12px;
    padding-bottom:35px;
`;

const SideGroup = styled.div`
    display:flex;
    width: 260px;
    height:30px;
    flex-direction:row;
    justify-content:space-between;
    padding-right:20px;
    align-items:center;
    border-left: 1px solid #aaa;
`;

interface SideProps {
    $highlight?: boolean;
}
const SideIcon = styled.div<SideProps>`
    width:20px;
    height:20px;
    color:${props => props.$highlight ? 'var(--selected))' : 'var(--link)'};  
`;

const SideButton = styled.div`
    width:40px;
`;

const RightExplanation = styled.div`
    width: 270px; 
    line-height:1.5;
    font-size: 14px;
    display:inline-block;
    flex-direction:row;
    margin-bottom:10px;
`;

const MobileRightExplanation = styled.div`
    max-width: 280px; 
    line-height:1.5;
    font-size: 14px;
    margin-bottom:10px;
    padding-right:20px;
`;

const MobilePlayersPanel = styled.div`
    height:100%;
    width:100%;
    min-height:180vw;
    color:var(--text);
    display:flex;
    padding-left:20px;
    padding-top:10px;
    flex-direction:column;
    justify-content:flex-start;
    align-items:flex-start; 
    a{
        color:var(--text);
        text-decoration: none;
        &:hover{
        color: var(--highlight);
        }
    }
    @media screen and (min-width: 1200px) {
            display: none;
    }
`;

const MobileSideGroup = styled.div`
    display:flex;
    width: 260px;
    margin-left:20px;
    height:40px;
    flex-direction:row;
    justify-content:space-around;
    align-items:center;
    padding-left:20px;
    padding-right:20px;
    border-left: 1px solid #aaa;
`;

const MobileSidePlayer = styled.div`
    width:240px; 
    font-size: 16px;
`;

const RightScroll = styled.div`
    position:sticky;
    height:auto !important;
    top:-110px;
    overflow-y: hidden;
`;
interface Props {
}
const MyTeam: React.FC<Props> = () => {
    const { fallback, mode, isMobile, noUser, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, team, player, teamName, setTeamName } = useAppContext();
    const [toastMessage, setToastMessage] = useState("");
    const [toastIcon, setToastIcon] = useState(<></>);
    const trackerListMembersKey: MyTeamRosterKey = { type: "my-team-roster", league };
    // console.log("MyTeam:trackerListMemebrsKey", trackerListMembersKey)
    const { data: trackerListMembers, error: trackerListError, isLoading: trackerListLoading, mutate: trackerListMutate } = useSWR(trackerListMembersKey, actionFetchMyTeam, { fallback });
    //to get mutateMyFeed
    // Function to fetch my feed with pagination:
    const fetchMyFeedKey = (pageIndex: number, previousPageData: any): FetchMyFeedKey | null => {
        if (previousPageData && !previousPageData.length) return null; // reached the end
        let key: FetchMyFeedKey = { type: "fetch-my-feed", page: pageIndex, league };
        return key;
    }
    // now swrInfinite code:
    const { data, error, mutate: mutateMyFeed, size, setSize, isValidating, isLoading } = useSWRInfinite(fetchMyFeedKey, actionMyFeed, { initialSize: 1, revalidateAll: true, parallel: true, fallback })


    // const theme = useTheme();
    //@ts-ignore
    //const mode = theme.palette.mode;

    //const palette = theme[mode||'dark'].colors;
    return (
        <>{!isMobile ? <RightScroll>
            <TeamName>My Fantasy Team{league ? ` for ${league}` : ``}: </TeamName>
            {(!trackerListMembers || trackerListMembers.length == 0) && <><RightExplanation>
                <b>My Fantasy Team</b> is a feature designed for Fantasy Sports fans who need to track media
                mentions of their&apos;s fantasy teams members.<br /><br />    <hr />
            </RightExplanation>
                <RightExplanation>Use  &nbsp;<TeamAddIcon className="text-2xl inline" />&nbsp;  icon to the right of the<br /> player&apos;s name wherever available,<br />to add an athlete to the &ldquo;Fantasy Team&ldquo; tracking list.<br /><br />
                </RightExplanation></>}
            {trackerListMembers && trackerListMembers.map(({ member, athleteUUId, teamid, league }: { member: string, athleteUUId: string, teamid: string, league: string }, i: number) => {
                return <SideGroup key={`3fdsdvb-${member}`}>
                    <SidePlayer>
                        <Link onClick={() => { setLeague(league); setTeam(teamid); setPlayer(member); setView("mentions"); }} href={`/${league}/${teamid}/${encodeURIComponent(member)}${params}`}>
                            {member}
                        </Link>
                    </SidePlayer>
                    {false && <SideButton>
                        <div
                            onClick={async () => {
                                const newTrackerListMembers = trackerListMembers.filter((p: any) => p.member != member);
                                trackerListMutate(newTrackerListMembers, true);
                                await actionRemoveMyTeamMember({ member, teamid, athleteUUId });
                            }} aria-label="Add new list">
                            <SideIcon>
                                <TeamRemoveIcon className="text-amber-400 hover:text-green-400" />
                            </SideIcon>
                        </div>
                    </SideButton>}
                    <SideButton>
                        <div className="mt-2"
                            onClick={async () => {
                                console.log("TRACKED", member)
                                setToastIcon(<TeamRemoveIcon className="h-6 w-6 opacity-60 hover:opacity-100 text-grey-4000" />);

                                setToastMessage("Player removed from the Fantasy Team");

                                await actionRemoveMyTeamMember({ member, teamid, athleteUUId });
                                //const newTrackerListMembers = trackerListMembers.filter((p: any) => p.member != member);
                                trackerListMutate();
                                /*mutatePlayers(async (players: any) => {
                                    return players.map((player: any) => {
                                        if (player.name == p.name) {
                                            player.tracked = false;
                                        }
                                        return player;
                                    })
                                }, {revalidate:true});*/
                                await actionRemoveMyTeamMember({ member, teamid, athleteUUId });

                                // mutateMentions();
                                mutateMyFeed();
                                //mutatePlayerMentions();
                                await actionRecordEvent(
                                    'player-remove-myteam',
                                    `{"params":"${params}","team":"${teamid}","player":"$member}"}`
                                );


                            }} aria-label="Add new list">
                            <SideIcon $highlight={false}>
                                {<TeamRemoveIcon className="h-6 w-6 opacity-70  hover:opacity-100 text-amber-800 dark:text-amber-200" />}

                            </SideIcon>
                        </div>
                    </SideButton>

                </SideGroup>
            })}
            {toastMessage && <Toast icon={toastIcon} message={toastMessage} onClose={() => setToastMessage("")} />}
        </RightScroll> :
            <MobilePlayersPanel>
                <MobileTeamName>My Fantasy Team: </MobileTeamName>
                {(!trackerListMembers || trackerListMembers.length == 0) &&
                    <><MobileRightExplanation>
                        Track sports media mentions of your fantasy athletes across media markets and publications.<br /><br />
                        <RightExplanation>Use  &nbsp;<TeamAddIcon className="text-2xl inline" />&nbsp;  icon to the right of the<br /> player&apos;s name at the bottom of a mention,<br />to add an athlete to the &ldquo;Fantasy Team&ldquo; tracking list.<br /><br />
                        </RightExplanation> <hr />
                    </MobileRightExplanation>
                    </>}
                {trackerListMembers && trackerListMembers.map(({ member, athleteUUId, teamid, league }: { member: string, athleteUUId: string, teamid: string, league: string }, i: number) => {
                    return <MobileSideGroup key={`3fdsdvb-${i}`}>
                        <MobileSidePlayer>
                            <Link onClick={() => { setPlayer(member); setView("mentions"); }} href={`/${league}/${teamid}/${encodeURIComponent(member)}${params}`}>
                                {member}
                            </Link>
                        </MobileSidePlayer>
                        <SideButton>
                            <div
                                onClick={async () => {
                                    console.log("TRACKED", member)
                                    const newTrackerListMembers = trackerListMembers.filter((p: any) => p.member != member);
                                    trackerListMutate(newTrackerListMembers, false);
                                    await actionRemoveMyTeamMember({ member, teamid, athleteUUId });
                                    setToastMessage("Player removed from the Fantasy Team");
                                }} >
                                <SideIcon>
                                    <TeamRemoveIcon className="opacity-80 text-yellow-800 dark:text-yellow-200 hover:opacity-100" />
                                </SideIcon>
                            </div>
                        </SideButton>
                    </MobileSideGroup>
                })}
                {toastMessage && <Toast icon={toastIcon} message={toastMessage} onClose={() => setToastMessage("")} />}
            </MobilePlayersPanel>}
        </>
    );
}

export default MyTeam;