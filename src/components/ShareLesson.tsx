import {useState} from 'react';
import {useLocale} from '../i18n';
import {languageUrl} from '../locale';
export default function ShareLesson(){
 const {locale}=useLocale(),[status,setStatus]=useState<'idle'|'copied'|'failed'>('idle');
 async function share(){try{await navigator.clipboard.writeText(languageUrl(location.href,locale));setStatus('copied');}catch{setStatus('failed');}}
 return <div className="share-lesson"><button onClick={share}>{locale==='en'?'Copy lesson link':'Скопировать ссылку на задачу'} <span aria-hidden="true">↗</span></button><span role="status">{status==='copied'?(locale==='en'?'Link copied':'Ссылка скопирована'):status==='failed'?(locale==='en'?'Copy the URL from your address bar.':'Скопируйте адрес из строки браузера.'):''}</span><details><summary>{locale==='en'?'How playback works':'Как устроено воспроизведение'}</summary><p>{locale==='en'?'These are prepared examples recorded from real Python execution at build time. Each highlighted line shows the state before that line runs. You can step backward, change speed or switch examples. Custom inputs and arbitrary Python execution are not supported.':'Это подготовленные примеры с записью реального выполнения Python при сборке. Подсветка показывает состояние до выполнения строки. Можно шагать назад, менять скорость и примеры. Произвольные входы и выполнение своего Python не поддерживаются.'}</p></details></div>;
}
