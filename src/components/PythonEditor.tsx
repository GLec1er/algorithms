import {t} from '../locale';
import { useRef, type KeyboardEvent } from 'react';
import { Syntax } from './Code';

export default function PythonEditor({value,onChange,line}:{value:string;onChange:(value:string)=>void;line?:number}) {
  const editor=useRef<HTMLTextAreaElement>(null),paint=useRef<HTMLPreElement>(null),gutter=useRef<HTMLDivElement>(null);
  const lines=value.split('\n');
  function key(event:KeyboardEvent<HTMLTextAreaElement>) {
    if((event.key!=='Tab'||event.shiftKey)&&event.key!=='Enter')return;
    event.preventDefault();
    const area=event.currentTarget,start=area.selectionStart,end=area.selectionEnd;
    const previous=value.slice(value.lastIndexOf('\n',start-1)+1,start);
    const insert=event.key==='Tab'?'    ':'\n'+(previous.match(/^\s*/)?.[0]??'')+(previous.trimEnd().endsWith(':')?'    ':'');
    onChange(value.slice(0,start)+insert+value.slice(end));
    requestAnimationFrame(()=>editor.current?.setSelectionRange(start+insert.length,start+insert.length));
  }
  return <div className="python-editor">
    <div className="editor-gutter" ref={gutter} aria-hidden="true">{lines.map((_,i)=><div key={i} className={line===i+1?'is-current':''}>{i+1}</div>)}</div>
    <pre className="editor-paint" ref={paint} aria-hidden="true"><code>{lines.map((text,i)=><span key={i} className={`editor-source-line ${line===i+1?'is-current':''}`}><Syntax text={text||' '}/>{'\n'}</span>)}</code></pre>
    <textarea ref={editor} aria-label={t("Python-решение")} aria-describedby="editor-help" spellCheck={false} autoCorrect="off" autoCapitalize="off" wrap="off" value={value} onChange={event=>onChange(event.target.value)} onKeyDown={key} onScroll={event=>{
      if(paint.current){paint.current.scrollTop=event.currentTarget.scrollTop;paint.current.scrollLeft=event.currentTarget.scrollLeft;}
      if(gutter.current)gutter.current.scrollTop=event.currentTarget.scrollTop;
    }}/>
  </div>;
}
