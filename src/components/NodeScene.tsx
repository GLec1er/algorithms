import { t } from '../locale';
import { type Frame, type Value, type NodeState, isRef, pretty } from '../types';
import { asArray, asObject } from './primitives';

type Position={x:number;y:number};
type Edge={from:number;to:number;label?:string};

function Drawing({nodes,edges,positions,frame,height=300}:{nodes:NodeState[];edges:Edge[];positions:Map<number,Position>;frame:Frame;height?:number}) {
  const width=Math.max(640,...[...positions.values()].map(p=>p.x+65));
  const labels=new Map<number,string[]>();
  for(const [key,v] of Object.entries(frame.state))if(isRef(v))labels.set(v.ref,[...(labels.get(v.ref)??[]),key]);
  return <div className="scene-scroll"><svg className="node-scene" style={{minWidth:Math.min(width,900)}} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={t("Узлы, связи и положение указателей")}>
    <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="currentColor"/></marker></defs>
    {edges.map((e,i)=>{
      const a=positions.get(e.from), b=positions.get(e.to);if(!a||!b)return null;
      const same=e.from===e.to, back=b.x<a.x&&Math.abs(b.y-a.y)<10;
      const length=Math.hypot(b.x-a.x,b.y-a.y)||1,dx=(b.x-a.x)/length,dy=(b.y-a.y)/length;
      const d=e.label==='prev'?`M${a.x},${a.y+25} Q${(a.x+b.x)/2},${Math.max(a.y,b.y)+62} ${b.x},${b.y+29}`:same?`M${a.x+20},${a.y-10} C${a.x+80},${a.y-75} ${a.x-60},${a.y-75} ${a.x-18},${a.y-17}`:back?`M${a.x},${a.y-25} C${a.x},${a.y-75} ${b.x},${b.y-75} ${b.x},${b.y-29}`:`M${a.x+dx*27},${a.y+dy*27} L${b.x-dx*29},${b.y-dy*29}`;
      return <g className="node-edge" key={`${e.from}-${e.to}-${i}`}><path d={d} strokeDasharray={e.label==='prev'?'4 3':undefined} markerEnd="url(#arrow)"/>{e.label&&<text x={(a.x+b.x)/2+8} y={(a.y+b.y)/2+(e.label==='prev'?45:-8)}>{e.label}</text>}</g>;
    })}
    {nodes.map(n=>{const p=positions.get(n.id);if(!p)return null;const names=labels.get(n.id)??[];
      return <g key={n.id} className={`node-group ${names.length?'focused':''} ${n.end?'terminal-node':''}`} style={{transform:`translate(${p.x}px,${p.y}px)`}}>
        <circle r="26"/><text className="node-value" textAnchor="middle" y="5">{pretty(n.value).slice(0,12)}</text><text className="node-id" textAnchor="middle" y="-36">#{n.id}{n.end?t(" · конец слова"):''}</text>
        {names.length>0&&<text className="node-pointer" textAnchor="middle" y="49">{names.slice(0,3).join(' · ')}</text>}
      </g>;
    })}
  </svg></div>;
}

export function NodeScene({frame}:{frame:Frame}) {
  const nodes=frame.nodes;
  if(!nodes.length)return <div className="scene-empty">{t("Структура будет создана на следующих шагах.")}</div>;
  const tree=nodes.some(n=>n.kind==='tree'||n.kind==='trie');
  const graph=nodes.some(n=>n.kind==='graph');
  const edges:Edge[]=[];
  for(const n of nodes){
    if(tree){
      for(const key of ['left','right'] as const)if(n[key])edges.push({from:n.id,to:n[key]!.ref,label:key==='left'?'L':'R'});
      for(const [letter,ref]of Object.entries(n.children))edges.push({from:n.id,to:ref.ref,label:letter});
    }else if(graph){
      n.neighbors.forEach(ref=>edges.push({from:n.id,to:ref.ref}));
    }else{
      if(n.next)edges.push({from:n.id,to:n.next.ref});
      if(n.kind==='lru'&&n.prev)edges.push({from:n.id,to:n.prev.ref,label:'prev'});
      if(n.child)edges.push({from:n.id,to:n.child.ref,label:'child'});
    }
  }
  const positions=new Map<number,Position>();
  if(tree){
    const children=(id:number)=>edges.filter(e=>e.from===id).map(e=>e.to);
    const roots=nodes.filter(n=>!edges.some(e=>e.to===n.id));
    let cursor=0,maxDepth=0;
    const place=(id:number,depth:number):number=>{
      if(positions.has(id))return positions.get(id)!.x;
      maxDepth=Math.max(maxDepth,depth);
      const xs=children(id).map(c=>place(c,depth+1));
      const x=xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:55+cursor++*86;
      positions.set(id,{x,y:65+depth*90});return x;
    };
    roots.forEach(root=>{place(root.id,0);cursor++;});
    return <Drawing nodes={nodes} edges={edges} positions={positions} frame={frame} height={Math.max(230,(maxDepth+1)*90+55)}/>;
  }
  if(graph){
    nodes.forEach((n,i)=>{const group=Math.floor(i/(nodes.length/2||1));const angle=(i%(Math.ceil(nodes.length/2)))*2*Math.PI/Math.ceil(nodes.length/2)-Math.PI/2;positions.set(n.id,{x:170+group*310+Math.cos(angle)*90,y:155+Math.sin(angle)*90});});
    return <Drawing nodes={nodes} edges={edges} positions={positions} frame={frame}/>;
  }
  const incoming=new Set(edges.map(e=>e.to));
  const preferred=isRef(frame.state.root)?frame.state.root.ref:isRef(frame.state.head)?frame.state.head.ref:undefined;
  const roots=[...(preferred===undefined?[]:[preferred]),...nodes.filter(n=>!incoming.has(n.id)).map(n=>n.id),...nodes.map(n=>n.id)];
  let row=0;
  for(const root of roots){
    if(positions.has(root))continue;
    let current:number|undefined=root,column=0;
    while(current!==undefined&&!positions.has(current)){
      positions.set(current,{x:65+column*103,y:80+row*130});column++;
      current=nodes.find(n=>n.id===current)?.next?.ref;
    }
    row++;
  }
  return <Drawing nodes={nodes} edges={edges} positions={positions} frame={frame} height={Math.max(220,row*130+30)}/>;
}

export function GraphScene({frame,input,id}:{frame:Frame;input:Record<string,Value>;id:string}) {
  if(frame.nodes.length)return <NodeScene frame={frame}/>;
  let labels:Value[]=[],edges:Edge[]=[];
  if(id==='word_transform'){
    labels=[...new Set([input.start,...asArray(input.words)])];
    labels.forEach((a,i)=>labels.forEach((b,j)=>{if(i<j&&typeof a==='string'&&typeof b==='string'&&a.length===b.length&&[...a].filter((x,k)=>x!==b[k]).length===1)edges.push({from:i,to:j});}));
  }else{
    const adj=asArray(input.adj);
    const n=Number(input.n??adj.length);
    labels=Array.from({length:n},(_,i)=>i);
    if(id==='merge_communities')asArray(frame.state.parent).forEach((p,i)=>{if(typeof p==='number'&&p!==i)edges.push({from:i,to:p});});
    else if(input.edges)asArray(input.edges).forEach(e=>{const a=asArray(e);edges.push({from:Number(id==='prerequisites'?a[1]:a[0]),to:Number(id==='prerequisites'?a[0]:a[1]),label:a.length>2?String(a[2]):undefined});});
    else adj.forEach((neighbors,i)=>asArray(neighbors).forEach(j=>edges.push({from:i,to:Number(j)})));
  }
  const current=frame.state.current??frame.state.start, visited=asArray(frame.state.visited),colors=asObject(frame.state.colors),dist=asArray(frame.state.dist);
  const positions=labels.map((_,i)=>({x:320+Math.cos(i*2*Math.PI/Math.max(1,labels.length)-Math.PI/2)*180,y:170+Math.sin(i*2*Math.PI/Math.max(1,labels.length)-Math.PI/2)*110}));
  return <div className="scene-scroll"><svg className="node-scene graph-scene" viewBox="0 0 640 340" role="img" aria-label={t("Граф и состояние обхода")}>
    <defs><marker id="graph-arrow" markerWidth="8" markerHeight="8" refX="27" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="currentColor"/></marker></defs>
    {edges.map((e,i)=>{const a=positions[e.from],b=positions[e.to];return a&&b?<g className="node-edge" key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} markerEnd={['shortest_path','prerequisites','merge_communities'].includes(id)?'url(#graph-arrow)':undefined}/>{e.label&&<text x={(a.x+b.x)/2+8} y={(a.y+b.y)/2-6}>{e.label}</text>}</g>:null;})}
    {labels.map((label,i)=><g className={`node-group ${current===label?'focused':''} ${visited.includes(label)||colors[String(i)]!==undefined?'seen-node':''} ${colors[String(i)]===1?'alternate-node':''}`} transform={`translate(${positions[i].x},${positions[i].y})`} key={i}><circle r="27"/><text textAnchor="middle" y="5" className="node-value">{pretty(label)}</text>{dist[i]!==undefined&&<text textAnchor="middle" y="47" className="node-pointer">d = {pretty(dist[i])}</text>}</g>)}
  </svg></div>;
}
