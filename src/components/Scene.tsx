import { t } from '../locale';
import { type Frame, type Lesson, type Value, pretty } from '../types';
import { ArrayRow, Auxiliary, Grid, ScalarScene, asArray, Dictionary, asObject } from './primitives';
import { GraphScene, NodeScene } from './NodeScene';

function Intervals({frame,input,id}:{frame:Frame;input:Record<string,Value>;id:string}) {
  const groups:[string,Value[]][] = input.intervals ? [['intervals',asArray(frame.state.intervals??input.intervals)]] : [['a',asArray(input.a)],['b',asArray(input.b)]];
  if(Array.isArray(frame.state.result))groups.push(['result',frame.state.result]);
  const pairs=groups.flatMap(([,rows])=>rows.map(asArray));
  const all=pairs.flatMap(pair=>pair.map(Number)),min=Math.min(0,...all),max=Math.max(1,...all);
  const x=(v:number)=>55+(v-min)/(max-min)*520;
  let row=0;
  return <div className="scene-scroll"><svg className="interval-scene" viewBox={`0 0 640 ${Math.max(210,pairs.length*42+100)}`} role="img" aria-label={t("Интервалы на общей числовой оси")}>
    <line className="axis" x1="50" y1="36" x2="590" y2="36"/>
    {Array.from({length:Math.min(max-min+1,11)},(_,i)=>{const v=min+i*(max-min)/Math.min(max-min,10);return <g key={i}><line className="tick" x1={x(v)} y1="32" x2={x(v)} y2="40"/><text x={x(v)} y="23" textAnchor="middle">{Number(v.toFixed(1))}</text></g>;})}
    {groups.flatMap(([name,rows])=>rows.map((pair,i)=>{const a=asArray(pair);const y=64+row++*42;const active=name==='result'||i===frame.state.i||i===frame.state.j;
      return <g key={`${name}-${i}`} className={`interval ${active?'active':''} ${name==='result'?'merged':''}`}><text x="9" y={y+4}>{name==='result'?'✓':name}{i}</text><rect x={x(Number(a[0]))} y={y-11} width={Math.max(3,x(Number(a[1]))-x(Number(a[0])))} height="22" rx="11"/><circle cx={x(Number(a[0]))} cy={y} r="4"/><circle className={id==='largest_overlap'?'open-end':''} cx={x(Number(a[1]))} cy={y} r="4"/><text x={(x(Number(a[0]))+x(Number(a[1])))/2} y={y+4} textAnchor="middle">{pretty(a)}</text></g>;
    }))}
    {typeof frame.state.position==='number'&&<line className="sweep" x1={x(frame.state.position)} x2={x(frame.state.position)} y1="38" y2={row*42+80}/>}
  </svg></div>;
}

function Heap({name,values}:{name:string;values:Value[]}) {
  const positions=values.map((_,i)=>{const level=Math.floor(Math.log2(i+1)),first=2**level-1;return {x:640*(i-first+0.5)/(2**level),y:45+level*65};});
  return <div className="heap-block"><div className="data-label"><span>{name}</span><small>{name==='lower'?t("max-heap · в коде −x"):'min-heap'}</small></div><div className="scene-scroll"><svg viewBox={`0 0 640 ${Math.max(130,positions.at(-1)?.y??0)+35}`} className="heap-scene" role="img" aria-label={t("Двоичная куча {0}",[name])}>
    {values.map((_,i)=>i>0?<line className="heap-edge" key={i} x1={positions[Math.floor((i-1)/2)].x} y1={positions[Math.floor((i-1)/2)].y} x2={positions[i].x} y2={positions[i].y}/>:null)}
    {values.map((v,i)=><g className={`node-group ${i===0?'focused':''}`} key={i} transform={`translate(${positions[i].x},${positions[i].y})`}><circle r="23"/><text className="node-value" textAnchor="middle" y="4">{pretty(name==='lower'&&typeof v==='number'?-v:Array.isArray(v)?v[0]:v)}</text></g>)}
    {!values.length&&<text x="320" y="65" textAnchor="middle">{t("∅ пустая куча")}</text>}
  </svg></div></div>;
}

function Bits({frame}:{frame:Frame}) {
  const names=['n','i','x','even','odd','left','right','result'].filter(n=>typeof frame.state[n]==='number');
  return <div className="bits-scene">{names.map(name=>{const n=Number(frame.state[name])>>>0;const digits=n.toString(2).padStart(8,'0');return <div className="bit-row" key={name}><div className="data-label"><span>{name}</span><small>{n}</small></div><div className="scene-scroll"><div className="bits">{[...digits].map((b,i)=><div key={i} className={b==='1'?'on':''}><small>{digits.length-i-1}</small>{b}</div>)}</div></div></div>;})}</div>;
}

function Points({frame,input}:{frame:Frame;input:Record<string,Value>}) {
  const points=asArray(input.points).map(asArray),xs=points.map(p=>Number(p[0])),ys=points.map(p=>Number(p[1]));
  const minX=Math.min(0,...xs)-1,maxX=Math.max(...xs)+1,minY=Math.min(0,...ys)-1,maxY=Math.max(...ys)+1;
  const x=(n:number)=>55+(n-minX)/(maxX-minX)*510,y=(n:number)=>260-(n-minY)/(maxY-minY)*220;
  const visited=asArray(frame.state.visited);
  const current=Number(frame.state.current??frame.state.i??-1),next=Number(frame.state.j??(frame.state.current!==undefined?frame.state.i:-1));
  return <div className="scene-scroll"><svg className="points-scene" viewBox="0 0 640 310" role="img" aria-label={t("Точки на координатной плоскости")}><line className="axis" x1="40" y1={y(0)} x2="600" y2={y(0)}/><line className="axis" x1={x(0)} y1="20" x2={x(0)} y2="280"/>
    {asArray(frame.state.chosen).map((edge,i)=>{const [a,b]=asArray(edge).map(Number);return points[a]&&points[b]?<line key={i} className="point-line chosen-edge" x1={x(Number(points[a][0]))} y1={y(Number(points[a][1]))} x2={x(Number(points[b][0]))} y2={y(Number(points[b][1]))}/>:null;})}
    {points[current]&&points[next]&&<line className="point-line" x1={x(Number(points[current][0]))} y1={y(Number(points[current][1]))} x2={x(Number(points[next][0]))} y2={y(Number(points[next][1]))}/>}
    {points.map((p,i)=><g className={`point ${i===current||i===next?'active':''} ${visited.includes(i)?'visited':''}`} key={i}><circle cx={x(Number(p[0]))} cy={y(Number(p[1]))} r="10"/><text x={x(Number(p[0]))+15} y={y(Number(p[1]))-10}>{pretty(p)}</text></g>)}
  </svg></div>;
}

function Queens({frame,input}:{frame:Frame;input:Record<string,Value>}) {
  const n=Number(input.n),placement=asArray(frame.state.placement),r=Number(frame.state.r??-1),c=Number(frame.state.c??-1);
  return <div className="queen-board" style={{gridTemplateColumns:`repeat(${n}, 52px)`}}>{Array.from({length:n*n},(_,i)=>{const row=Math.floor(i/n),col=i%n;return <div key={i} className={`${(row+col)%2?'dark':''} ${r===row&&c===col?'considering':''}`}>{placement[row]===col?'♛':<small>{row},{col}</small>}</div>;})}</div>;
}

function Triangle({frame,input}:{frame:Frame;input:Record<string,Value>}) {
  const rows:number[][]=[[1]];
  for(let r=1;r<Math.min(Number(input.n),10);r++){const prev=rows[r-1];rows.push(Array.from({length:prev.length+2},(_,c)=>(prev[c-2]??0)+(prev[c-1]??0)+(prev[c]??0)));}
  return <div className="triangle-scene"><div className="data-label"><span>{t("Первые строки · наблюдение чётности")}</span><small>{t("■ чётное")}</small></div><div className="scene-scroll">{rows.map((row,r)=><div className="triangle-row" key={r} style={{paddingLeft:(rows.length-r-1)*16}}><span>{r+1}</span>{row.map((v,c)=><div key={c} title={String(v)} className={`${v%2===0?'even':''} ${frame.done&&r+1===input.n&&c+1===frame.result?'answer':''}`}>{v%2}</div>)}</div>)}</div></div>;
}

function Circle({frame,input}:{frame:Frame;input:Record<string,Value>}) {
  const size=Number(frame.state.size??1),survivor=Number(frame.state.survivor??0);
  return <div className="scene-scroll"><svg className="circle-scene" viewBox="0 0 640 300" role="img" aria-label={t("Позиция выжившего в круге текущего размера")}><text x="320" y="145" textAnchor="middle">{t("размер")}{' '}{size}</text><text className="circle-note" x="320" y="167" textAnchor="middle">k = {pretty(input.k)}{' '}{t("· индексы с 0")}</text>{Array.from({length:size},(_,i)=>{const angle=i*2*Math.PI/size-Math.PI/2;return <g key={i} className={`node-group ${i===survivor?'focused':''}`} transform={`translate(${320+Math.cos(angle)*120},${145+Math.sin(angle)*100})`}><circle r="23"/><text className="node-value" textAnchor="middle" y="5">{i}</text></g>;})}</svg></div>;
}

export default function Scene({frame,lesson,input}:{frame:Frame;lesson:Lesson;input:Record<string,Value>}) {
  const state={...input,...frame.state};
  const insertionAnswer=lesson.id==='insertion_index'&&frame.done&&typeof frame.result==='number'?frame.result:undefined;
  const excluded:string[]=[];
  let primary;
  if(lesson.scene==='intervals')primary=<Intervals frame={frame} input={input} id={lesson.id}/>;
  else if(['linked','tree','trie'].includes(lesson.scene))primary=<NodeScene frame={frame}/>;
  else if(lesson.scene==='graph')primary=<GraphScene frame={frame} input={input} id={lesson.id}/>;
  else if(lesson.scene==='heap'){primary=<>{['heap','lower','upper'].filter(n=>n in frame.state).map(n=><Heap key={n} name={n} values={asArray(frame.state[n])}/>)}</>;}
  else if(lesson.scene==='grid'||(lesson.scene==='dp'&&Array.isArray(frame.state.dp)&&Array.isArray(frame.state.dp[0]))){
    const name=lesson.scene==='dp'?'dp':'grid';excluded.push(name);primary=<Grid name={name} value={state[name]} frame={frame} infection={lesson.id==='matrix_infection'}/>;
  }else if(lesson.scene==='queens')primary=<Queens frame={frame} input={input}/>;
  else if(lesson.scene==='bits')primary=<Bits frame={frame}/>;
  else if(lesson.scene==='triangle')primary=<Triangle frame={frame} input={input}/>;
  else if(input.points)primary=<Points frame={frame} input={input}/>;
  else if(lesson.id==='josephus')primary=<Circle frame={frame} input={input}/>;
  else{
    const names=['a','s','b','t','gas','cost','weights','values','coins','digits'].filter(n=>Array.isArray(state[n])||typeof state[n]==='string');
    const simple=names.filter(n=>!asArray(state[n]).some(Array.isArray));
    primary=simple.length?<>{simple.map((n,i)=><ArrayRow name={n} key={n} values={typeof state[n]==='string'?[...String(state[n])]:asArray(state[n])} frame={frame} pointers={i===0} answerIndex={i===0?insertionAnswer:undefined} halfOpen={['insertion_index','first_last','weighted_selection','median_arrays','sort_array'].includes(lesson.id)}/>)}</>:<ScalarScene frame={frame}/>;
  }
  return <div className={`scene scene-${lesson.scene}`}>
    {primary}
    {insertionAnswer!==undefined&&<div className="insertion-result" data-testid="insertion-answer" role="status"><strong>{t("Ответ: индекс {0}",[insertionAnswer])}</strong><span>{!asArray(input.a).length?t("Вставить {0} в пустой массив",[pretty(input.target)]):insertionAnswer===asArray(input.a).length?t("Добавить {0} в конец массива",[pretty(input.target)]):t("Вставить {0} перед {1}",[pretty(input.target),pretty(asArray(input.a)[insertionAnswer])])}</span></div>}
    {frame.state.op&&<div className="operation"><span>{t("Текущая операция")}</span><code>{pretty(frame.state.op)}</code></div>}
    {lesson.scene==='hash'&&frame.state.seen&&!Array.isArray(frame.state.seen)&&<Dictionary name="seen" value={asObject(frame.state.seen)}/>}
    <Auxiliary frame={frame} exclude={[...excluded,...(lesson.scene==='intervals'?['result']:[]),...(lesson.scene==='hash'?['seen']:[])]}/>
    {frame.calls.length>1&&<div className="call-stack"><span>{t("Стек вызовов")}</span>{frame.calls.map((call,i)=><code key={i}>{call.name}<small>:{call.line}</small></code>)}</div>}
  </div>;
}
