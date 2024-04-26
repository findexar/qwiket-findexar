import React, { useEffect, useCallback, useRef } from "react";
import Link from 'next/link';
import { recordEvent } from '@/lib/api';
import { convertToUTCDateString, convertToReadableLocalTime } from "@/lib/date-convert";
import { RWebShare } from "react-web-share";
import useCopyToClipboard from '@/lib/copy-to-clipboard';
import { useAppContext } from '@/lib/context';
import { useInView } from 'react-intersection-observer';
import MiniMention from "@/components/func/mini-mention";
declare global {
    interface Window {
        Clerk: any;
    }
}

interface StoryProps{
    story:any;
    handleClose:()=>void;
}
const Story: React.FC<StoryProps> = ({story,handleClose}) => {
    let {slug,title,digest,url,image,site_name,authors,createdTime,mentions}=story;
    let {league,utm_content,fbclid} = useAppContext();
    url = url || "";
    const [localDate, setLocalDate] = React.useState(convertToUTCDateString(createdTime));
    const [digestCopied, setDigestCopied] = React.useState(false);
    const [selectedXid, setSelectedXid] = React.useState("");
    const [value, copy] = useCopyToClipboard();
    const [visible, setVisible] = React.useState(false);

    let prepDigest = digest ? digest.replaceAll('<p>', '').replaceAll('</p>', '\n\n') : "";

    const shareUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${league}?story=${slug}&utm_content=shareslink` : `${process.env.NEXT_PUBLIC_SERVER}/pub?story=${slug}&utm_content=shareslink`;
    const twitterShareUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${league}?story=${slug}&utm_content=xslink` : `${process.env.NEXT_PUBLIC_SERVER}/pub?story=${slug}&utm_content=xslink`;
    const fbShareUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${league}?story=${slug}&utm_content=fbslink` : `${process.env.NEXT_PUBLIC_SERVER}/pub?story=${slug}&utm_content=fbslink`;
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(prepDigest.substring(0, 230) + '...')}&url=${twitterShareUrl}&via=findexar`;
    const fbLink = `https://www.facebook.com/sharer.php?kid_directed_site=0&sdk=joey&u=${encodeURIComponent(fbShareUrl)}&t=${encodeURIComponent('Findexar')}&quote=${encodeURIComponent(prepDigest.substring(0, 140) + '...')}&hashtag=%23findexar&display=popup&ref=plugin&src=share_button`;
    const { ref, inView, entry } = useInView({
        /* Optional options */
        threshold: 0,
    });
    useEffect(() => {
        if (inView && !visible) {
            setVisible(true);
            recordEvent(`story-inview`, `{"slug":"${slug}","url":"${url}","utm_content":"${utm_content}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        }
    }, [inView]);

    useEffect(() => {
        if (!site_name) {
            recordEvent('bad-site_name', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","slug":"${slug}","url":"${shareUrl}"}`).then((r: any) => {
                console.log("recordEvent", r);
            });;
        }
    }, [site_name]);

    useEffect(() => {
        setTimeout(() => {
            setDigestCopied(false);
        }, 2000);
    }, [digestCopied]);

    useEffect(() => {
        try {
            setLocalDate(convertToReadableLocalTime(createdTime));
        }
        catch (x) {
            console.log("EXCEPTION CONVERTING DATE");
        }
    }, [createdTime])

    const onShare = useCallback((url: string) => {
        try {
            recordEvent(`story-share`, `{"url":"${url}","utm_content":"${utm_content}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
        }
    }, [utm_content]);

    const onDigestCopyClick = useCallback(() => {
        setDigestCopied(true);
        copy(digest);
    }, [digest]);

    const onMentionClick = useCallback((mention: any) => {
        try {
            recordEvent(`min-mention-click`, `{"mention","${JSON.stringify(mention)}","utm_content":"${utm_content}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
        }
    }, []);

    const onStoryClick = useCallback(() => {
        try {
            recordEvent(`story-click`, `{"url":"${url}","story","${JSON.stringify(story)}","utm_content":"${utm_content}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
        }
    }, []);

    const Mentions = <div>{mentions && mentions.map((mention: any, i: number) => {
        return (
            <MiniMention handleClose={handleClose} onClick={() => onMentionClick(mention)} key={`mention-${i}`} {...mention} params={params} tp={tp} selectedXid={selectedXid} setSelectedXid={setSelectedXid} mutate={() => { }} />
        )
    })}</div>;

    if (image && image.indexOf("thestar.com/content/tncms/custom/image/f84403b8-7d76-11ee-9d02-a72a4951957f.png") >= 0)
        return null;
    return <div className="w-full h-full ">
      <div className="pl-12 py-4 text-xl"> {title}</div>

        <div className="h-6 ml-8 my-2 dark:hover:text-yellow-200 hover:text-yellow-700 hover:cursor-pointer ">{digest}</div>
        
    </div>
}
export default Story;