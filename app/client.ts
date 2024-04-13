'use client'
import {initSession} from './actions';
 
export async function initSessionClient() {
    return await initSession();
}