import { useEffect, useRef, useState } from 'react';

export function Syntax({text}:{text:string}) {
  return <>{text.split(/(#.*$|'[^']*'|"[^"]*"|\b(?:def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|from|import|as|nonlocal|continue|break|class|lambda)\b|\b\d+\b)/g).map((part,i)=>{
    const cls=part.startsWith('#')?'comment':/^['"]/.test(part)?'string':/^\d+$/.test(part)?'number':/^(def|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|from|import|as|nonlocal|continue|break|class|lambda)$/.test(part)?'keyword':'';
    return cls?<span className={`syntax-${cls}`} key={i}>{part}</span>:part;
  })}</>;
}

export default function Code({code,line,support,filename='solution'}:{code:string;line:number;support?:string;filename?:string}) {
  const container=useRef<HTMLDivElement>(null);
  const [helpers,setHelpers]=useState(false),[copied,setCopied]=useState(false);
  const shown=helpers?support??code:code;
  useEffect(()=>{
    const panel=container.current,active=panel?.querySelector<HTMLElement>('.code-line.current');
    if(panel&&active){const top=active.offsetTop;if(top<panel.scrollTop+35||top>panel.scrollTop+panel.clientHeight-70)panel.scrollTo({top:Math.max(0,top-panel.clientHeight/3),behavior:'auto'});}
  },[line,helpers]);
  async function copy(){try{await navigator.clipboard.writeText(shown);setCopied(true);setTimeout(()=>setCopied(false),1600);}catch{setCopied(false);}}
  return <section className="code-panel" aria-label="Код Python">
    <header><div className="editor-file"><span className="python-file-icon">Py</span><span>{filename}.py</span><small>Python 3</small></div><button className="copy-button" onClick={copy} aria-label="Копировать Python-код">{copied?'Скопировано':'Копировать'}</button></header>
    {support&&<div className="code-tabs"><button className={!helpers?'selected':''} onClick={()=>setHelpers(false)}>Решение</button><button className={helpers?'selected':''} onClick={()=>setHelpers(true)}>Структуры данных</button></div>}
    <div className="code-scroll" ref={container}><pre><code>{shown.split('\n').map((text,i)=><div className={`code-line ${!helpers&&i+1===line?'current':''}`} key={i}><span className="line-number">{i+1}</span><span className="line-source"><Syntax text={text}/></span></div>)}</code></pre></div>
    <footer><span className="live-dot"/> {!helpers?`Состояние до строки ${line}`:'Адаптеры примеров · доступны в репозитории'}</footer>
  </section>;
}
