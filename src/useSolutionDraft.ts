import { useEffect, useState } from 'react';

export function useSolutionDraft(lessonId:string, starter:string) {
  const key=`patterns-draft-v1:${lessonId}`;
  const [code,setCode]=useState(()=>{try{return localStorage.getItem(key)??starter;}catch{return starter;}});
  const [stored,setStored]=useState(true);
  useEffect(()=>{try{localStorage.setItem(key,code);setStored(true);}catch{setStored(false);}},[key,code]);
  return {code,setCode,stored};
}
