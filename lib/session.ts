import { SessionOptions } from "iron-session";

export interface SessionData {
  sessionid:string;
  username: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  sessionid:"",
  username: "",
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_PASSWORD||"",
  cookieName: "qwiket-session",
  cookieOptions: {
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    secure: true,
  },
};

