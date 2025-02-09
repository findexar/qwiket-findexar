'use client'
import React, { useCallback } from 'react';
import Link from 'next/link';
import { actionRecordEvent } from "@lib/server-actions/event";
interface TeamLinkProps {
    id: string;
    name: string;
    logo: string;
    league: string;
    params: string;
    bot: boolean;
    isSelected: boolean;
}

const TeamLink: React.FC<TeamLinkProps> = ({ id, name, logo, league, params, bot, isSelected }) => {
    const onTeamNav = useCallback(async (id: string, name: string, logo: string) => {
        /*setPagetype("team");
        setPlayer("");
        setTeamid(id);
        setTeamName(name);
        setTeamLogo(logo);
        setView("mentions");
        setTab("");
        //  const url = `/${league}/${teamid}/${encodeURIComponent(name)}${params}${tp}`;
        const url = `/${league}/${id}${params}${tp}`;
        console.log("replaceState", url)
        window.history.replaceState({}, "", url); */

        if (!bot) {
            await actionRecordEvent(
                'team-nav',
                `{"params":"${params}","teamid":"${name}"}`
            );
        }
    }, [bot, params, actionRecordEvent]);
    return (
        <Link
            onClick={async () => { await onTeamNav(id, name, logo); }}
            href={`/${league}/${id}${params}`}
            className={`no-underline hover:text-highlight ${isSelected ? 'text-selected' : ''}`}
        >
            {name}
        </Link>
    );
}

export default TeamLink;