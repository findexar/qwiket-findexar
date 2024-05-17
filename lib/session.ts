import { SessionOptions } from "iron-session";
import { env } from "process";

export interface SessionData {
  sessionid:string;
  dark:number;
}

export const defaultSession: SessionData = {
  sessionid:"",
  dark:-1,
};

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_PASSWORD||"",
  cookieName: "qwiket-session",
  cookieOptions:{
    httpOnly: true,
    secure: env.NODE_ENV=='production', // set this to false in local (non-HTTPS) development
    sameSite: "lax",// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite#lax
    maxAge:  2147483647, // Expire cookie before the session expires.
    path: "/",
  }
};

