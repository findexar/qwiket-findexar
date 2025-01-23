import React from "react";
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SignInButton } from "@clerk/nextjs";
import { styled } from "styled-components";

import HomeIcon from '@/components/icons/home';
import HelpOutlineIcon from '@/components/icons/help';

import LoginIcon from '@/components/icons/login';
import { useAppContext } from '@/lib/context';
import Button from '@/components/util-components/button';

const WelcomeWrap = styled.div`
    //padding-top:18px;
    padding-right:40px;
    width:100%;
    a{
        text-decoration: none;
        &:hover{
            color:var(--highlight);
        }
    }
    p{
        margin-top:10px;
        margin-bottom:10px;
        margin-right:10px;
    }
    @media screen and (max-width: 1200px) {
        padding-right:30px;
    }
`;

const Favorites = styled.div`
    margin-left:22px;
    width:100%;
    height:40px;
    font-size:12px;
      a{
          text-decoration: none;
          &:hover{
              color: var(--highlight);
          }
      }
`;

const LeftText = styled.div`
    padding-top:28px;
    padding-right:20px;
    line-height:1.5;
    a{
        text-decoration: none;
        &:hover{
            color: var(--highlight);
        }
    }
   
`;
interface Props {
}
const Welcome: React.FC<Props> = () => {
    const router = useRouter();
    const { view, params2, tp2, noUser, mode, userId, isMobile, setLeague, setView, setPagetype, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, team, player, teamName, setTeamName } = useAppContext();
    return <> <WelcomeWrap className="text-left">
        <span style={{ fontSize: 22 }}> Welcome to Qwiket AI!</span><br /><br /><hr />
        {false && <span><em>That&apos;s the ticket!</em> <br /><br /><br /></span>}

        <p>We believe that knowledge elevates the quality of our reasoning, improves our productivity and decision-making, and creates wealth and fulfillment in every endeavor we pursue.</p>

        <p>It is our quest for knowledge that was the driving force behind the digital revolution from its earliest days. First, it delivered access to raw information, then the content created by people with more knowledge than ourselves that we could consume and process to develop knowledge. And now, the age of AI finally delivers direct interactive access to knowledge, allowing us to interrogate the knowledge, follow up, and &quot;surf&quot; the knowledge, just like we used to surf the content in the old days, before ChatGPT.</p>

        <p>While tools like ChatGPT are very good at providing access to generic and static knowledge, they are completely inadequate in areas such as sports, where content is added daily and the information is very specific and real-time. That&apos;s where Qwiket AI comes in&mdash;it &quot;reads&quot; hundreds of articles daily, &quot;listens&quot; to dozens of knowledgeable podcasts, and adds the resulting knowledge to its AI model. It also augments it with real-time data feeds&mdash;stats, schedules, rosters, etc. And it provides interactive access to all this knowledge, which would require our users to spend hours and hours daily consuming and processing raw content and still get only a fraction of the value. It also uses its knowledge to structure the access to source content in the most efficient form.</p>

        <p>Take a look and explore Qwiket AI. You can also use its AI Chat to ask questions about Qwiket itself. Let us know if it elevates your fantasy or betting game; after all, this is why we created Qwiket AI.</p>


    </WelcomeWrap>
        <LeftText><hr />Copyright &#169; 2024,2025 Qwiket AI <br />Made in Minnesota. L&apos;Étoile du Nord.</LeftText>
        <LeftText><hr />Contact: support @ qwiket.com<hr /></LeftText>
        <LeftText><br />League News Digests on X (Twitter):</LeftText>
        <Favorites><LeftText><Link href="https://twitter.com/qwiket_nfl">NFL Digest Twitter Feed</Link></LeftText>
            <LeftText><Link href="https://twitter.com/qwiket_nhl">NHL Digest Twitter Feed</Link></LeftText>
            <LeftText><Link href="https://twitter.com/qwiket_mlb">MLB Digest Twitter Feed</Link></LeftText>
            <LeftText><Link href="https://twitter.com/qwiket_nba">NBA Digest Twitter Feed</Link></LeftText>
        </Favorites>
    </>
}

export default Welcome;