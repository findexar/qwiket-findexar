import React, { ReactNode } from 'react';
import { styled } from 'styled-components';

const WelcomeWrap = styled.div`
    paddWelcomeWraping-top:18px;
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

const Container = ({ children }: { children: ReactNode }) => (
    <div className="p-5 bg-background text-text pb-[100vw]">
        {children}
    </div>
);

const Readme = () => {
    return (
        <Container>
            <WelcomeWrap className="text-left">
                <span style={{ fontSize: 18 }}> Welcome to Qwiket AI!</span><br /><br /><hr />
                <br />

                <p>We believe that knowledge elevates the quality of our reasoning, improves our productivity and decision-making, and creates wealth and fulfillment in every endeavor we pursue.</p>

                <p>It is our quest for knowledge that was the driving force behind the digital revolution from its earliest days. First, it delivered access to raw information, then the content created by people with more knowledge than ourselves that we could consume and process to develop knowledge. And now, the age of AI finally delivers direct interactive access to knowledge, allowing us to interrogate the knowledge, follow up, and &quot;surf&quot; the knowledge, just like we used to surf the content in the old days, before ChatGPT.</p>

                <p>While tools like ChatGPT are very good at providing access to generic and static knowledge, they are completely inadequate in areas such as sports, where content is added daily and the information is very specific and real-time. That&apos;s where Qwiket AI comes in&mdash;it &quot;reads&quot; hundreds of articles daily, &quot;listens&quot; to dozens of knowledgeable podcasts, and adds the resulting knowledge to the static and stale knowledge of ChatGPT. It also augments it with real-time data feeds&mdash;stats, schedules, rosters, etc. And it provides interactive access to all this knowledge, which would require our users to spend hours and hours daily consuming and processing raw content and still get only a fraction of the value. It also uses its knowledge to structure the access to source content in the most efficient form.</p>

                <p>Take a look and explore Qwiket AI. You can also use its AI Chat to ask questions about Qwiket itself. Let us know if it elevates your fantasy or betting game; after all, this is why we created Qwiket AI.</p>
                <hr />Copyright &#169; 2024,2025 Qwiket AI <br />Made in Minnesota. L&apos;Étoile du Nord.
            </WelcomeWrap>
        </Container >
    )
}

export default Readme;

