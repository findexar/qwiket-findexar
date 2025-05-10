// app/actions/theme.ts  (no iron‑session here)
'use server'
import { cookies } from 'next/headers'

export async function setMode(mode: 0| 1|-1) {
  const cookieStore = await cookies();
  console.log("==> setModeAction", mode);
  cookieStore.set('mode', mode.toString(), {
    httpOnly: false,       // client can read it
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}