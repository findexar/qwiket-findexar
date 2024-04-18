import React from 'react';
import Link from 'next/link';

const Welcome: React.FC = () => {
    return <div className="w-full h-full p-4">
          Welcome to {process.env.NEXT_PUBLIC_APP_NAME}!<br />
          <hr /><hr />

        {false && <span><em>That&apos;s the ticket!</em> <br /><br /><br /></span>}
        <br />The indispensable Fantasy Sports<br />
        real-time, annotated <br />
        media index.<br /><br />
        As new stories are published <br />in the media, they are sliced and diced <br />
        into annotated indexed mentions of <br />
        individual athletes and teams.<br /><br />

        Track the media mentions across <br />your fantasy teams effortlessly<br />
        using the My Team feature<br /><br />
        <hr />
        Powered by OpenAI.
        <div><hr />Copyright &#169; 2024, Findexar, Inc.<br />Made in Minnesota. L&apos;Étoile du Nord.</div>
        <div><hr />Contact: @findexar on X (Twitter)<hr /></div>
        <div><br />League News Digests on X (Twitter):</div>
       <div><Link href="https://twitter.com/qwiket_nfl">NFL Digest Twitter Feed</Link></div>
            <div><Link href="https://twitter.com/qwiket_nhl">NHL Digest Twitter Feed</Link></div>
            <div><Link href="https://twitter.com/qwiket_mlb">MLB Digest Twitter Feed</Link></div>
            <div><Link href="https://twitter.com/qwiket_nba">NBA Digest Twitter Feed</Link></div>
       
    </div>
}
export default Welcome;