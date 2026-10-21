import type { RunRequest, WorkerReply } from './types';

const runtimeUrl = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs';
const reply = (message: WorkerReply) => self.postMessage(message);

async function initialize() {
  const module = await import(/* @vite-ignore */ runtimeUrl);
  const python = await module.loadPyodide();
  const files = await Promise.all(['structures.py','user_runtime.py'].map(async name => {
    const response = await fetch(`${import.meta.env.BASE_URL}runtime/${name}`);
    if (!response.ok) throw new Error('Не удалось загрузить адаптеры Python. Повторите запуск.');
    return {name,source:await response.text()};
  }));
  python.FS.mkdirTree('/home/pyodide/curriculum');
  python.FS.writeFile('/home/pyodide/curriculum/__init__.py','');
  for (const file of files) python.FS.writeFile(`/home/pyodide/curriculum/${file.name}`,file.source);
  python.runPython(`
import json as _json
from curriculum.user_runtime import run_solution as _run_solution
def _execute_json(value):
    data = _json.loads(value)
    return _json.dumps(_run_solution(data['code'], data['lessonId'], data['args'], data['expected']), ensure_ascii=False, allow_nan=False)
`);
  return python;
}

let ready: ReturnType<typeof initialize> | null = null;
self.onmessage = async (event: MessageEvent<RunRequest & {id:number}>) => {
  const {id,...request} = event.data;
  try {
    reply({id,status:'loading'});
    const python = await (ready ??= initialize());
    reply({id,status:'running'});
    python.globals.set('__run_request',JSON.stringify(request));
    try {
      const result = JSON.parse(python.runPython('_execute_json(__run_request)'));
      reply({id,result});
    } finally { python.globals.delete('__run_request'); }
  } catch (error) {
    reply({id,failure:error instanceof Error ? error.message : String(error)});
  }
};
