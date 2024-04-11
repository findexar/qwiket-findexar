//./lib/isbot.ts
import isBot  from 'isbot-fast';

export const isbot=({ua})=> {
    let bot = isBot(ua);
    let fb = ua && ua.indexOf('facebook') >= 0;
    return {bot,fb};
}