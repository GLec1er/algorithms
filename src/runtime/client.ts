import type { RunRequest, RunResult, RuntimeStatus, WorkerReply } from './types';

export class PythonRunner {
  private worker: Worker | null = null;
  private sequence = 0;
  private pending: {id:number; reject:(error:Error)=>void; timer:ReturnType<typeof setTimeout>} | null = null;

  run(request: RunRequest, onStatus: (status: RuntimeStatus)=>void = ()=>{}): Promise<RunResult> {
    if (this.pending) this.cancel();
    if (request.code.length > 65536) return Promise.reject(new Error('Код превышает 64 КБ.'));
    const worker = this.worker ??= new Worker(new URL('./python.worker.ts',import.meta.url),{type:'module'});
    const id = ++this.sequence;
    return new Promise((resolve,reject) => {
      const expire = (message:string) => { if(this.pending?.id!==id)return; this.pending=null; worker.terminate(); if(this.worker===worker)this.worker=null; reject(new Error(message)); };
      this.pending = {id,reject,timer:setTimeout(()=>expire('Не удалось загрузить Python за 60 секунд. Проверьте соединение и повторите запуск.'),60000)};
      worker.onmessage = (event: MessageEvent<WorkerReply>) => {
        if (this.pending?.id !== id || event.data.id !== id) return;
        const message = event.data;
        if ('status' in message) {
          if(message.status==='running') {
            clearTimeout(this.pending.timer);
            this.pending.timer=setTimeout(()=>expire('Вычисления остановлены: превышен лимит 10 секунд.'),10000);
          }
          onStatus(message.status);
          return;
        }
        clearTimeout(this.pending.timer);
        this.pending=null;
        // A fresh interpreter per example also resets imported module state
        // (e.g. decimal context), not only the submitted globals and inputs.
        worker.terminate(); this.worker=null;
        if ('failure' in message) {
          reject(new Error('Не удалось выполнить Python: '+message.failure.slice(0,1500)));
        } else if (Array.isArray(message.result?.frames) && typeof message.result.passed==='boolean') resolve(message.result);
        else reject(new Error('Python вернул некорректный ответ. Повторите запуск.'));
      };
      worker.onerror = () => {
        if(this.pending?.id!==id)return;
        clearTimeout(this.pending.timer);this.pending=null;
        worker.terminate();this.worker=null;
        reject(new Error('Не удалось загрузить Python. Проверьте соединение и повторите запуск.'));
      };
      onStatus('loading');
      worker.postMessage({id,...request});
    });
  }

  cancel() {
    if(this.pending){clearTimeout(this.pending.timer);this.pending.reject(new DOMException('Запуск остановлен.','AbortError'));this.pending=null;}
    this.worker?.terminate();this.worker=null;
  }

  dispose() { this.cancel(); }
}
