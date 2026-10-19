import { t } from '../locale';
import type { CSSProperties } from 'react';
import { type Frame, type Value, pretty } from '../types';

export const asArray = (v:Value|undefined):Value[] => Array.isArray(v) ? v : [];
export const asObject = (v:Value|undefined):Record<string,Value> => v && typeof v==='object' && !Array.isArray(v) ? v : {};

const pointerNames = ['left','right','mid','i','j','write','low','high'];
export function ArrayRow({name, values, frame, pointers=false, halfOpen=false}:{name:string;values:Value[];frame:Frame;pointers?:boolean;halfOpen?:boolean}) {
  const entries = pointers ? pointerNames.filter(n=>typeof frame.state[n]==='number' && Number(frame.state[n])>=0 && Number(frame.state[n])<=values.length).map(n=>[n,Number(frame.state[n])] as const) : [];
  const active = pointers ? Number(frame.state.mid ?? frame.state.i ?? frame.state.write ?? -1) : -1;
  const left=typeof frame.state.left==='number'?frame.state.left:undefined;
  const right=typeof frame.state.right==='number'?frame.state.right:undefined;
  const slots = Math.max(1,values.length + (entries.some(([,i])=>i===values.length)?1:0));
  return <div className="array-block">
    <div className="data-label"><span>{name}</span><small>{values.length} {name==='s'?t("симв."):t("эл.")}</small></div>
    <div className="scene-scroll"><div className="array-track" style={{width:`calc(var(--array-slot, 58px) * ${slots})`,height:pointers?148:100}}>
      {!values.length && <span className="empty-data">{t("∅ пусто")}</span>}
      {values.map((v,i)=>{
        const outside=pointers && left!==undefined && right!==undefined && (i<left || (halfOpen?i>=right:i>right));
        return <div key={frame.arrays?.[name]?.[i] ?? i} className={`array-cell ${i===active?'active':''} ${outside?'outside':''}`} style={{transform:`translateX(calc(var(--array-slot, 58px) * ${i}))`}}>
          <span className="cell-index">{i}</span><span className="cell-value">{pretty(v)}</span>
        </div>;
      })}
      {entries.map(([n,i])=>{
        const same=entries.filter(([,j])=>j===i).findIndex(([m])=>m===n);
        return <div key={n} className={`array-pointer pointer-${n}`} style={{transform:`translateX(calc(var(--array-slot, 58px) * ${i}))`,top:88+same*24}}>{n}<span>↑</span></div>;
      })}
    </div></div>
  </div>;
}

export function Grid({name, value, frame, infection=false}:{name:string;value:Value;frame:Frame;infection?:boolean}) {
  const rows=asArray(value).map(row=>typeof row==='string'?[...row]:asArray(row));
  const r=Number(frame.state.r ?? frame.state.left ?? -1), c=Number(frame.state.c ?? frame.state.right ?? -1);
  const visited=asArray(frame.state.visited);
  return <div className="grid-block"><div className="data-label"><span>{name}</span><small>{rows.length} × {rows[0]?.length??0}</small></div>
    <div className="scene-scroll"><div className="matrix" style={{'--cols':rows[0]?.length??1} as CSSProperties}>
      {rows.flatMap((row,ri)=>row.map((v,ci)=>{
        const seen=visited.some(p=>Array.isArray(p)&&p[0]===ri&&p[1]===ci);
        const dependency=name==='dp'&&((ri===r-1&&ci===c)||(ri===r&&ci===c-1)||(ri===r-1&&ci===c-1));
        return <div key={`${ri}:${ci}`} className={`matrix-cell ${ri===r&&ci===c?'active':''} ${seen?'visited':''} ${dependency?'dependency':''} ${infection&&v===2?'infected':''}`}><small>{ri},{ci}</small><strong>{pretty(v)}</strong></div>;
      }))}
    </div></div>
  </div>;
}

export function Dictionary({name,value}:{name:string;value:Record<string,Value>}) {
  const entries=Object.entries(value);
  return <div className="dictionary"><div className="data-label"><span>{name}</span><small>{t("ключ → значение")}</small></div><div className="dictionary-items">{entries.length?entries.map(([k,v])=><div className="dict-entry" key={k}><code>{k}</code><span>→</span><strong>{pretty(v)}</strong></div>):<span className="empty-data">{t("∅ пусто")}</span>}</div></div>;
}

export function ScalarScene({frame}:{frame:Frame}) {
  const scalars=Object.entries(frame.state).filter(([,v])=>typeof v==='number'||typeof v==='boolean'||typeof v==='string').slice(-8);
  return <div className="scalar-scene">{scalars.map(([k,v])=><div key={k} className="scalar-card"><span>{k}</span><strong>{pretty(v)}</strong></div>)}</div>;
}

function StackView({name,values,frame}:{name:string;values:Value[];frame:Frame}) {
  return <div className="stack-block"><div className="data-label"><span>{name}</span><small>{t("последним вошёл → первым вышел")}</small></div><div className="stack-well" style={{height:Math.max(70,values.length*38+30)}}>
    {!values.length&&<span className="empty-data">{t("∅ пустой стек")}</span>}
    {values.map((value,i)=><div key={frame.arrays?.[name]?.[i]??i} className={`stack-item ${i===values.length-1?'top':''}`} style={{transform:`translateY(${(values.length-i-1)*38}px)`}}><code>{pretty(value)}</code>{i===values.length-1&&<span>{t("← вершина")}</span>}</div>)}
  </div></div>;
}

export function Auxiliary({frame,exclude=[]}:{frame:Frame;exclude?:string[]}) {
  const names=['prefix','stack','queue','incoming','outgoing','path','placement','dp','buffer','amounts','dist','parent','sizes','indegree','result','tokens','visited','found','window','seen','counts','slopes','left_map','right_map','colors','memo','columns','cache'];
  return <div className="auxiliary">{names.filter(n=>n in frame.state&&!exclude.includes(n)).map(name=>{
    const value=frame.state[name];
    if(Array.isArray(value)) {
      if(['stack','incoming','outgoing'].includes(name))return <StackView key={name} name={name} values={value} frame={frame}/>;
      if(value.some(Array.isArray)) return <div key={name} className="compact-data"><span>{name}</span><code>{pretty(value)}</code></div>;
      return <ArrayRow key={name} name={name} values={value} frame={frame}/>;
    }
    if(value&&typeof value==='object')return <Dictionary key={name} name={name} value={value}/>;
    return <div className="scalar-inline" key={name}><code>{name}</code><strong>{pretty(value)}</strong></div>;
  })}</div>;
}
