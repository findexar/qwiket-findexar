import React from 'react';
export default function Home({
    params,
    searchParams,
    }: {
    params: { leagueid: string, teamid: string}
    searchParams: { [key: string]: string | string[] | undefined }
    }) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-between p-24" >
        <h1 className="text-4xl font-bold">{params.leagueid}:{params.teamid}</h1> 
        <h2 className="text-4xl font-bold">{JSON.stringify(searchParams,null,4)}</h2> 
        </div>
    );  
  }