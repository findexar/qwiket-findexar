import { useAppContext } from "@/lib/context";
//import { CommentsKey } from "@/lib/keys";
import useSWRInfinite from 'swr/infinite';

type PanelProps = {
    context: 'story' | 'mention' | 'message' | 'league' | 'team' | 'player';
    unionId?: string; //slug,mentionUUId,messageUUId, qwiketUUId,null (root for league, team, player)
    tags?: string[];  //length: league? 1, team? 2, player? 3
}
const Panel = ({ context, unionId, tags }: PanelProps) => {
    const { fallback, league, teamid, athleteUUId } = useAppContext();
    /*
        const fetchCommentsKey = (pageIndex: number, previousPageData: any): CommentsKey | null => {
            let key: CommentsKey = { type: `fetch-comments`, page: pageIndex, context, unionId: unionId || "" };
            if (previousPageData && !previousPageData.length) return null; // reached the end
            return key;
        };*/
    /*const { data, mutate, size, setSize, isLoading } = useSWRInfinite(
        fetchCommentsKey,
        actionComments,
        { initialSize: 1, revalidateAll: true, parallel: true, fallback }
    );*/

    return (
        <div>
            <h1>Panel</h1>
        </div>
    )
}
