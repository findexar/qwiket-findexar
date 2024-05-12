import React, { ReactNode } from 'react';

const Container = ({ children }: { children: ReactNode }) => (
    <div className="p-5 bg-background text-text pb-[100vw]">
        {children}
    </div>
);

const Readme = () => {
    return (
        <Container>
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
            <h2 className="text-2xl font-semibold mt-4">What is Findexar?</h2>
            <p className="mt-2">Findexar is a media mention tracking tool focused on professional teams and athletes across the Major Leagues: NFL, NHL, MLB, and NBA.</p>
            <p className="mt-2">Our advanced platform comprehensively scans both print and online media to identify and index every mention of athletes and teams. We go beyond just professional sports commentary, including general interest sections of leading newspapers and websites, to ensure thorough coverage of relevant mentions.</p>
            <p className="mt-2">Typically, such in-depth information was available only to professional teams, sports agents, and athletes with deep pockets, often acquired through large agencies like Nielsen. Findexar offers this invaluable service to a broader audience at a fraction of the cost. We provide not only links to media sources but also brief digests of the mention&apos;s context and summaries of the articles, all powered by the premier AI technology in the industry – OpenAI&apos;s Large Language Model.</p>
            <h2 className="text-2xl font-semibold mt-4">Who is the Target Audience?</h2>
            <p className="mt-2">Findexar is designed for Fantasy Sports enthusiasts who demand a robust media monitoring tool for tracking mentions of their chosen athletes. And a research tool: our platform enables easy browsing for athlete mentions by team and name.</p>
            <p className="mt-2">It is also a vital resource for any sports fan looking to stay informed, particularly those involved in sports betting. It saves hours of valuable time manually searching the internet for mentions.</p>
            <h2 className="text-2xl font-semibold mt-4">What are Findexar&apos;s features?</h2>
            <h3 className="text-xl font-semibold mt-3">Browse by League, Team, and Athlete</h3>
            <p className="mt-2">You can go directly to the level of specificity you are looking for by selecting the league, team, or athlete to review the mentions.</p>
            <h3 className="text-xl font-semibold mt-3">Review the Combined Mentions Feed</h3>
            <p className="mt-2">If you stay at the top level, or the league level, you can jump off to an athlete&apos;s or team&apos;s section by clicking on a mention.</p>
            <h3 className="text-xl font-semibold mt-3">Favorites</h3>
            <p className="mt-2">Click on a star on a mention to add the mention to the Favorites collection.</p>
            <h4 className="text-lg font-semibold mt-3">My Team</h4>
            <p className="mt-2">When in the team area, click on the icon to the right of the athlete&apos;s name to add them to the My Team collection. Use the My Team checkbox to filter mentions by My Team when at the top or league levels.</p>
            <p className="mt-2">Both features require to sign-up and create an account on Findexar.</p>
            <h2 className="text-2xl font-semibold mt-4">How does Findexar work?</h2>
            <p className="mt-2">Suffice it to say, we use AI to create digests for the article with athletes or teams mentions. Then, for every mention in the article, we create a short mention gist, to give you an idea of the nature and context of each mention, as much as possible.</p>
            <h2 className="text-2xl font-semibold mt-4">Are there any social media accounts to follow Findexar on?</h2>
            <p className="mt-2">Yes, to contact us use X (aka Twitter) <a href="https://twitter.com/findexar/" className="text-blue-500">@findexar</a>.</p>
            <p className="mt-2">We also use the following X accounts for full league digests:</p>
            <p className="mt-2">NFL: <a href="https://twitter.com/nflpress_digest" className="text-blue-500">@nflpress_digest</a></p>
            <p className="mt-2">NHL: <a href="https://twitter.com/nhl_digest" className="text-blue-500">@nhl_digest</a></p>
            <p className="mt-2">MLB: <a href="https://twitter.com/mlb_digest" className="text-blue-500">@mlb_digest</a></p>
            <p className="mt-2">NBA: <a href="https://twitter.com/nba_digest" className="text-blue-500">@nba_digest</a></p>
            <h2 className="text-2xl font-semibold mt-4">What&apos;s next?</h2>
            <p className="mt-2">As the product grows and AI technology matures, we will be adding full video mentions and will experiment with AI-based prediction ability, based on the data we collect. Also adding more leagues, such as Premier League and MLS. Join us on this journey!</p>
            <p className="mt-2">Let us know what else you would like to see in our product.</p>
            <p className="mt-2">Copyright © 2024, Findexar, Inc.</p>
            <p className="mt-2">Made in Northern Minnesota, USA.</p>
        </Container>
    )
}

export default Readme;

