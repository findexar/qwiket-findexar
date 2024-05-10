import { useEffect, useState } from "react";
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import 'material-icons/iconfont/outlined.css';

import { styled} from "styled-components";

import { recordEvent } from '@/lib/api';
const OuterContainer = styled.div`
    background-color:var(--background);
    padding-bottom:200px;
`;

const ContainerWrap = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 100%;
    width: 100%;
    font-family: 'Roboto', sans-serif;
    color:var(--text);
    @media screen and (max-width: 1199px) {
        display: none;
    }
    a{
        color:var(--text);
        text-decoration: none;
        &:hover{
        color:var(--highlight);
        }
    }
`;
const TextContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 600px;
    line-height: 1.5;
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    @media screen and (max-width: 1199px) {
        display: none;
    }   
`;
const MobileTextContainer = styled.div`
    margin-top:0px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 250px;
    line-height: 1.5;
    font-family: 'Roboto', sans-serif;
    color:var(--text);
    @media screen and (min-width: 1200px) {
        display: none;
    }
`;

const TextContainerCenter = styled.div`
    text-align:center;
    color:var(--text);   
`;

const MobileVContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    @media screen and (min-width: 1200px) {
        display: none;
    }
`;

const MobileContainerWrap = styled.div`  
    display: flex;
    flex-direction: row;
    justify-content: center;
    line-height: 1.5;
    font-family: 'Roboto', sans-serif;
    @media screen and (min-width: 1200px) {
        display: none;
    }
    a{
        color: var(--text);
        text-decoration: none;
        &:hover{
        color: var(--highlight);
        }
    }
`;

const NegativeAnswer = styled.div`
    margin-bottom:10px;
    color:var(--text);
    height:60px;
    width:600px;
    border:1px solid red;
    border-radius:15px;
    padding:17px;
    text-align: center;
    &:hover{
        color:var(--highlight);
        background-color:var(--highBackground) ;     
    }
    a{
        &:hover{
            color:var(--highlight);
            background-color:var(--highBackground) ;  
        }
    }
`;

const PositiveAnswer = styled.div`
    display:flex;
    flex-direction:row;
    justify-content:center;
    align-items:center;
    margin-top:10px;
    margin-bottom:50px;
    color:var(--text);
    text-decoration:none;
    height:60px;
    width:600px;
    border:1px solid var(--qwiket-border-new);
    border-radius:15px;
    text-align: center;
    &:hover{
        color:var(--highlight);
        background-color:var(--highBackground);
    }
    a{
        &:hover{
            color:var(--highlight);
            background-color:var(--highBackground);
        }
    }
`;

const MobileNegativeAnswer = styled.div`
    margin-bottom:10px;
    color:var(--text);
    height:60px;
    width:300px;
    border:1px solid red;
    border-radius:15px;
    padding:10px;
    text-align: center;
    display:flex;
    flex-direction:column;
    justify-content:center;
`;

const MobilePositiveAnswer = styled.div`
    margin-top:10px;
    margin-bottom:40px;
    color:var(--text);
    text-decoration:none;
    height:60px;
    width:300px;
    border:1px solid var(--qwiket-border-new);
    border-radius:15px;
    display:flex;
    flex-direction:column;
    justify-content:center; 
`;

const MobileAnswerText = styled.div`
    width:300px;
    text-align: center;
    display:flex;
    flex-direction:row;
    justify-content:center;
    align-items:center;
    flex-wrap: wrap;

`;

let s = false;

const Landing = () => {
    const [fbclid, setFbclid] = useState("");
    const [utm_content, setUtm_content] = useState("");
    const [params, setParams] = useState("");
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const listener = () => {
            if (window.scrollY > 0) {
                if (!scrolled && !s) {
                    try {
                        s = true;
                        setScrolled(true);
                        recordEvent( `landing-scrolled`, `{"fbclid":"${fbclid}", "utm_content":"${utm_content}"}`)
                            .then((r: any) => {
                               // console.log("recordEvent", r);
                            });
                    } catch (x) {
                        console.log('recordEvent', x);
                    }
                }
                setScrolled(true);
            }
        }
        window.addEventListener('scroll', listener);
        return () => window.removeEventListener("scroll", listener);
    }, [fbclid, utm_content, scrolled]);



    const onClick = () => {
        try {
            recordEvent(`enter-clicked`, `{"fbclid":"${fbclid}", "utm_content":"${utm_content}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
        }
    }
    const onFarSide = () => {
        try {
            recordEvent( `far-side`, `{"fbclid":"${fbclid}", "utm_content":"${utm_content}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
        }
    }

    const onHover = (label: string) => {
        try {
            recordEvent( `hover`, `{"label","${label}","fbclid":"${fbclid}", "utm_content":"${utm_content}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
        }
    }

    return (
        <OuterContainer>
            <ContainerWrap>
                <TextContainer>
                    <h4>Do you want to know when your favorite athletes or teams are mentioned in the media?</h4>
                    <ul>
                        <NegativeAnswer onMouseEnter={() => onHover('D-N1')}>
                            No, I am in the wrong place.
                        </NegativeAnswer>
                        <Link href={`/pub${params}`} onClick={onClick}><PositiveAnswer onMouseEnter={() => onHover('D-P1')}>

                            Yes, &nbsp;<b>Enter {process.env.NEXT_PUBLIC_APP_NAME}.</b>

                        </PositiveAnswer></Link>
                    </ul>

                    <h4>Do you want to peruse an annotated real-time index of media mentions for NFL, NHL, MLB and NBA athletes and teams?</h4>
                    <ul>
                        <NegativeAnswer onClick={() => onFarSide()} onMouseEnter={() => onHover('D-N2')}>
                            No, I am definitely in the wrong place. <a href="https://www.thefarside.com/">Take me to the Far Side.</a>
                        </NegativeAnswer>
                        <Link href={`/pub${params}`} onClick={onClick}>
                            <PositiveAnswer onClick={() => onClick()} onMouseEnter={() => onHover('D-P2')}>
                                Yes,&nbsp;<b>Enter {process.env.NEXT_PUBLIC_APP_NAME}.</b>
                            </PositiveAnswer>
                        </Link>
                    </ul>

                    <h4>Need the capability to monitor all media stories mentioning the athletes from your fantasy team?</h4>
                    <ul>
                        <NegativeAnswer onMouseEnter={() => onHover('D-N3')}>

                            What&apos;s a &ldquo;fantasy team&ldquo;?
                        </NegativeAnswer>

                        <Link href={`/pub${params}`} onClick={onClick}>
                            <PositiveAnswer onClick={onClick} onMouseEnter={() => onHover('D-P31')}>
                                Yes,&nbsp;<b>Enter {process.env.NEXT_PUBLIC_APP_NAME}.</b>

                            </PositiveAnswer></Link>
                    </ul>
                    <p>
                        Effortlessly stay in touch with the latest news about your fantasy sports stars.
                        Create &ldquo;My Team&rdquo; &mdash; a custom list of your Fantasy Team athletes,
                        and Findexar will track and index media mentions of them from over
                        a hundred different sources.<br /><br />
                        Alternatively, browse leagues, teams, and athletes to quickly scroll through their media mentions.</p>

                </TextContainer>
            </ContainerWrap>
            <MobileVContainer>
                <MobileContainerWrap>
                    <MobileTextContainer>
                        <h4>Do you want to know when your favorite athletes or teams are mentioned in the media?</h4>
                    </MobileTextContainer>
                </MobileContainerWrap>
                <MobileNegativeAnswer onMouseEnter={() => onHover('M-N1')}>
                    <MobileAnswerText>
                        No, I am in the wrong place.
                    </MobileAnswerText>
                </MobileNegativeAnswer>
                <Link href={`/pub${params}`} onClick={onClick}><MobilePositiveAnswer onClick={onClick} onMouseEnter={() => onHover('M-P1')}>
                    <MobileAnswerText>
                        Yes, &nbsp;<b>Enter {process.env.NEXT_PUBLIC_APP_NAME}.</b>
                    </MobileAnswerText>
                </MobilePositiveAnswer></Link>

                <MobileContainerWrap>
                    <MobileTextContainer>
                        <h4>Do you want to peruse an annotated real-time index of media mentions for NFL, NHL, MLB and NBA athletes and teams?</h4>
                    </MobileTextContainer>
                </MobileContainerWrap>
                <MobileNegativeAnswer onMouseEnter={() => onHover('M-N2')}>
                    <MobileAnswerText>
                        No, I am definitely in the wrong place. <a href="https://www.thefarside.com/">Take me to the Far Side.</a>
                    </MobileAnswerText>
                </MobileNegativeAnswer>
                <Link href={`/pub${params}`} onClick={onClick}><MobilePositiveAnswer onClick={onClick} onMouseEnter={() => onHover('M-P2')}>
                    <MobileAnswerText>
                        Yes, &nbsp;<b>Enter {process.env.NEXT_PUBLIC_APP_NAME}.</b>
                    </MobileAnswerText>
                </MobilePositiveAnswer></Link>
                <MobileContainerWrap>
                    <MobileTextContainer>
                        <h4>Need the capability to monitor all media stories mentioning the athletes from your fantasy team?</h4>
                    </MobileTextContainer></MobileContainerWrap>
                <MobileNegativeAnswer onMouseEnter={() => onHover('M-N3')}>
                    <MobileAnswerText>
                        What&apos;s a &ldquo;fantasy team&ldquo;?
                    </MobileAnswerText>
                </MobileNegativeAnswer>

                <Link href={`/pub${params}`} onClick={onClick}><MobilePositiveAnswer onClick={onClick} onMouseEnter={() => onHover('M-P3')}>
                    <MobileAnswerText>
                        Yes, &nbsp;<b>Enter {process.env.NEXT_PUBLIC_APP_NAME}.</b>
                    </MobileAnswerText>
                </MobilePositiveAnswer></Link>
                <MobileContainerWrap>
                    <MobileTextContainer>
                        <p>
                            Effortlessly stay in touch with the latest news about your fantasy sports stars.
                            Create &ldquo;My Team&rdquo; &mdash; a custom list of your Fantasy Team athletes,
                            and Findexar will track and index media mentions of them from over
                            a hundred different sources.<br /><br />
                            Alternatively, browse leagues, teams, and athletes to quickly scroll through their media mentions.</p>

                    </MobileTextContainer>
                </MobileContainerWrap>
                <MobileContainerWrap>
                    <TextContainerCenter>
                        <br /><br /><hr /> Copyright &#169; 2024, Findexar, Inc.<br />Made in Minnesota, USA.
                    </TextContainerCenter>
                </MobileContainerWrap>
            </MobileVContainer>
            <ContainerWrap><TextContainerCenter>
                <br /><br /><hr />Copyright &#169; 2024, Findexar, Inc.<br />Made in USA.
            </TextContainerCenter></ContainerWrap>
        </OuterContainer>
    )
}

export default Landing;