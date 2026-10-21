import {t} from './locale';
export type Value = null | boolean | number | string | Value[] | { [key: string]: Value };
export type Ref = { ref: number };
export type NodeState = { id: number; value: Value; kind: string; next: Ref|null; prev: Ref|null; child: Ref|null; left: Ref|null; right: Ref|null; children: Record<string,Ref>; neighbors: Ref[]; end: boolean };
export type Frame = { line:number; message:string; messageEn:string; state:Record<string,Value>; nodes:NodeState[]; calls:{name:string;line:number}[]; done:boolean; result?:Value; arrays?:Record<string,string[]> };
export type Example = {label:string; labelEn:string; args:Record<string,Value>; expected:Value; frames:Frame[]};
export type Payload = {id:string; code:string; starter?:string; support?:string; examples:Example[]};
export type Lesson = {id:string;chapter:number;title:string;ru:string;statement:string;idea:string;time:string;space:string;scene:string;difficulty:string;source:string};
export type PatternGuideData = {intuition:string;signals:string[];steps:string[];example:{input:string;trace:string[];answer:string};compare:string;pitfalls:string[]};
export type Chapter = {id:number;title:string;ru:string;use:string;invariant:string;pitfall:string;guide:PatternGuideData};
export const isRef = (v:Value|undefined):v is Ref => !!v && !Array.isArray(v) && typeof v === 'object' && typeof v.ref === 'number';
export function pretty(v:Value|undefined):string {
  if (v === undefined) return '—';
  if (v === null) return 'null';
  if (isRef(v)) return t('узел #{0}',[v.ref]);
  if (typeof v === 'string') return v;
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  return JSON.stringify(v);
}
