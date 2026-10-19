import {useId,type ReactNode} from 'react';

type Option<T extends string>={value:T;label:string;content:ReactNode};
/** Native radios provide arrow-key selection and a single tab stop per group. */
export default function SegmentedControl<T extends string>({label,value,options,onChange,className=''}:{label:string;value:T;options:Option<T>[];onChange:(value:T)=>void;className?:string}){
 const name=useId();
 return <fieldset className={`setting-segments ${className}`} aria-label={label}>
  <legend className="sr-only">{label}</legend>
  {options.map(option=><label className="setting-choice" data-selected={value===option.value} key={option.value}>
   <input type="radio" name={name} value={option.value} checked={value===option.value} aria-label={option.label} onChange={()=>onChange(option.value)}/>
   <span className="setting-content" aria-hidden="true">{option.content}</span>
   <span className="setting-tooltip" aria-hidden="true">{option.label}</span>
  </label>)}
 </fieldset>;
}
