import type { Frame, Value } from '../types';

export type RunRequest = { code: string; lessonId: string; args: Record<string, Value>; expected: Value };
export type RunResult = { frames: Frame[]; result: Value; passed: boolean; error: {type:string;message:string;line:number|null}|null; stdout:string; notices:string[]; bindings?:{input:string;parameter:string}[] };
export type RuntimeStatus = 'loading' | 'running';
export type WorkerReply = {id:number} & ({status:RuntimeStatus}|{result:RunResult}|{failure:string});
