import {t} from '../locale';
import type { Frame, Value } from '../types';
import { isRef, pretty } from '../types';
import { ArrayRow, Dictionary, Grid } from './primitives';
import { NodeScene } from './NodeScene';

// Submitted code can freely mutate adapter fields. Only draw a compatible,
// complete structure; preserve unsupported snapshots as raw data instead.
function canDrawNodes(frame:Frame) {
  const nodes=frame.nodes, ids=new Set(nodes.map(node=>node.id));
  if(ids.size!==nodes.length||nodes.some(node=>!Number.isFinite(node.id)||!['linked','lru','tree','trie','graph'].includes(node.kind)||typeof node.end!=='boolean'))return false;
  const ref=(value:Value)=>value===null||isRef(value)&&ids.has(value.ref);
  if(nodes.some(node=>!['next','prev','child','left','right'].every(key=>ref(node[key as 'next']))||
    !Array.isArray(node.neighbors)||!node.neighbors.every(value=>isRef(value)&&ref(value))||
    !node.children||typeof node.children!=='object'||Array.isArray(node.children)||
    !Object.values(node.children).every(value=>isRef(value)&&ref(value))))return false;
  const tree=nodes.some(node=>node.kind==='tree'||node.kind==='trie');
  if(tree){
    if(nodes.some(node=>node.kind!=='tree'&&node.kind!=='trie'))return false;
    const active=new Set<number>(),done=new Set<number>();
    const byId=new Map(nodes.map(node=>[node.id,node]));
    const acyclic=(id:number):boolean=>{
      if(active.has(id))return false;
      if(done.has(id))return true;
      active.add(id);
      const node=byId.get(id)!;
      const children=[node.left,node.right,...Object.values(node.children)].filter(isRef);
      if(!children.every(child=>acyclic(child.ref)))return false;
      active.delete(id);done.add(id);return true;
    };
    return nodes.every(node=>acyclic(node.id));
  }
  return !nodes.some(node=>node.kind==='graph')||nodes.every(node=>node.kind==='graph');
}

export default function UserScene({frame}:{frame:Frame}) {
  const entries=Object.entries(frame.state);
  const arrays=entries.filter(([,value])=>Array.isArray(value)||typeof value==='string');
  const dictionaries=entries.filter(([,value])=>value&&typeof value==='object'&&!Array.isArray(value)&&!isRef(value));
  return <div className="user-scene">
    <div className="user-scene-label">{t("Реальное состояние вашего Python-кода")}</div>
    {arrays.map(([name,value])=>{
      const values=typeof value==='string'?[...value]:value as Value[];
      if(values.length>0&&values.every(row=>Array.isArray(row)&&row.length===(values[0] as Value[]).length&&row.every(cell=>cell===null||typeof cell!=='object')))
        return <Grid key={name} name={name} value={value} frame={frame} highlight={false}/>;
      return values.some(v=>Array.isArray(v)||v&&typeof v==='object')?<div className="user-complex" key={name}><span>{name}</span><pre>{JSON.stringify(value,null,2)}</pre></div>:<ArrayRow key={name} name={name} values={values} frame={frame}/>;
    })}
    {dictionaries.map(([name,value])=><Dictionary key={name} name={name} value={value as Record<string,Value>}/>)}
    {frame.nodes.length>0&&(canDrawNodes(frame)?<NodeScene frame={frame}/>:<div className="user-complex"><span>{t("Узлы показаны как данные: структура не подходит для схемы.")}</span><pre>{JSON.stringify(frame.nodes,null,2)}</pre></div>)}
    <div className="user-scalars">{entries.filter(([,value])=>value===null||typeof value==='number'||typeof value==='boolean').map(([name,value])=><div className="scalar-card" key={name}><span>{name}</span><strong>{pretty(value)}</strong></div>)}</div>
    {entries.filter(([,value])=>isRef(value)).map(([name,value])=><div className="scalar-inline" key={name}><code>{name}</code><strong>{pretty(value)}</strong></div>)}
    {!entries.length&&<p className="empty-data">{t("Переменные появятся по мере выполнения.")}</p>}
    {frame.calls.length>0&&<div className="call-stack"><span>{t("Вызовы")}</span>{frame.calls.map((call,i)=><code key={i}>{call.name}:{call.line}</code>)}</div>}
  </div>;
}
