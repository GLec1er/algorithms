import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';

const key='patterns-py';
type Preferences={visible:boolean;motion:boolean};
const defaults:Preferences={visible:true,motion:true};
function read():Preferences{
 try{const value=JSON.parse(localStorage.getItem(key)??'null');return {visible:typeof value?.visible==='boolean'?value.visible:true,motion:typeof value?.motion==='boolean'?value.motion:true};}
 catch{return defaults;}
}
const Context=createContext<(Preferences&{setVisible:(value:boolean)=>void;setMotion:(value:boolean)=>void})|null>(null);
export function PyPreferencesProvider({children}:{children:ReactNode}){
 const [preferences,setPreferences]=useState(read);
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(preferences));}catch{/* Preferences still work in memory. */}},[preferences]);
 useEffect(()=>{const receive=(event:StorageEvent)=>{if(event.key===key)setPreferences(read());};window.addEventListener('storage',receive);return()=>window.removeEventListener('storage',receive);},[]);
 return <Context.Provider value={{...preferences,setVisible:visible=>setPreferences(p=>({...p,visible})),setMotion:motion=>setPreferences(p=>({...p,motion}))}}>{children}</Context.Provider>;
}
export function usePyPreferences(){const value=useContext(Context);if(!value)throw new Error('Py preferences require their provider');return value;}

export function useReducedMotion(){
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);update();return()=>media.removeEventListener('change',update);},[]);
 return reduced;
}
