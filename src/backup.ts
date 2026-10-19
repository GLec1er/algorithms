import type {StudyProgress} from './progress.ts';
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const validDate=(value:unknown):value is string=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
export function exportBackup(progress:StudyProgress):string{
 return JSON.stringify({format:'algorithms-lab-progress',version:1,progress},null,2)+'\n';
}
/** Strict imports must not silently discard records the way legacy storage recovery can. */
export function parseBackup(text:string,knownIds:string[],today:string):StudyProgress{
 if(text.length>1_000_000)throw new Error('Backup exceeds 1 MB');
 const value:unknown=JSON.parse(text);
 if(!object(value)||value.format!=='algorithms-lab-progress'||value.version!==1||!object(value.progress))throw new Error('Unsupported backup');
 const p=value.progress,known=new Set(knownIds);
 if(p.version!==2||!validDate(p.startedOn)||p.startedOn>today||!Array.isArray(p.completed)||!object(p.firstCompletions))throw new Error('Invalid progress');
 const completed:string[]=[];
 for(const id of p.completed){if(typeof id!=='string'||!known.has(id)||completed.includes(id))throw new Error('Unknown or repeated problem');completed.push(id);}
 const firstCompletions:Record<string,string|null>={};
 for(const [id,date]of Object.entries(p.firstCompletions)){
  if(!known.has(id)||(date!==null&&(!validDate(date)||date>today||date<p.startedOn)))throw new Error('Invalid completion history');
  firstCompletions[id]=date as string|null;
 }
 if(completed.some(id=>!Object.hasOwn(firstCompletions,id)))throw new Error('Missing completion history');
 return {version:2,startedOn:p.startedOn,completed,firstCompletions};
}
