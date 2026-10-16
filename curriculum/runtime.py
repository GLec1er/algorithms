"""Compile bounded, deterministic lessons from the exact Python displayed in the UI."""
import copy
import importlib
import inspect
import json
import math
import sys
import types
from collections import deque
from . import structures


class TraceLimitError(RuntimeError):
    pass


def freeze(value, depth=0):
    if isinstance(value, structures.Node):
        return {'ref': value.id}
    if value is None or isinstance(value, (str, bool, int)):
        return value
    if isinstance(value, float):
        return value if math.isfinite(value) else ('∞' if value > 0 else '−∞')
    if depth >= 10:
        raise ValueError('Example nesting exceeds the supported snapshot depth')
    if isinstance(value, dict):
        return {str(k): freeze(v, depth + 1) for k, v in value.items()}
    if isinstance(value, (set, frozenset)):
        return [freeze(v, depth + 1) for v in sorted(value, key=repr)]
    if isinstance(value, (list, tuple, deque)):
        return [freeze(v, depth + 1) for v in value]
    raise TypeError(type(value).__name__)


def locals_snapshot(values):
    result = {}
    for key, value in values.items():
        if key.startswith('_') or isinstance(value, (types.ModuleType, types.FunctionType, type)):
            continue
        try:
            result[key] = freeze(value)
        except TypeError:
            continue
    return result


def node_snapshot():
    return [dict(id=n.id, value=freeze(n.value), kind=n.kind, next=freeze(n.next),
                 prev=freeze(n.prev), child=freeze(n.child), left=freeze(n.left), right=freeze(n.right),
                 children=freeze(n.children), neighbors=freeze(n.neighbors), end=n.end)
            for n in structures.NODES]


def instruction(source):
    statement, _, comment = source.strip().partition('#')
    if comment.strip():
        return comment.strip()
    if statement.startswith('return'):
        return 'Возвращаем ответ текущего вызова.'
    if statement.startswith(('if ', 'elif ', 'while ')):
        return 'Проверяем условие: ' + statement.rstrip(':')
    if statement.startswith('for '):
        return 'Переходим к следующему элементу цикла.'
    if '.append(' in statement or '.add(' in statement or 'heappush(' in statement:
        return 'Добавляем элемент и обновляем состояние структуры.'
    if '.pop(' in statement or '.popleft(' in statement or 'heappop(' in statement:
        return 'Извлекаем элемент для дальнейшей обработки.'
    if statement.startswith('def '):
        return 'Определяем вспомогательную подзадачу.'
    if statement.startswith(('from ', 'import ')):
        return 'Подключаем используемые структуры данных.'
    return 'Следующее действие: ' + statement


def trace(function, args, limit=1800):
    lines, start = inspect.getsourcelines(function)
    code = ''.join(lines).rstrip()
    filename = function.__code__.co_filename
    end = start + len(lines)
    structures.NODES.clear()
    frames, last_root = [], None

    def capture(frame, event, value):
        nonlocal last_root
        if frame.f_code.co_filename != filename or not start <= frame.f_lineno < end:
            return capture
        if frame.f_code.co_name.startswith('<'):
            return capture
        if event not in ('line', 'return'):
            return capture
        if len(frames) >= limit:
            raise TraceLimitError(f'{function.__name__}: more than {limit} states')
        chain, current = [], frame
        while current and current.f_code.co_filename == filename:
            if start <= current.f_lineno < end:
                chain.append(current)
            current = current.f_back
        chain.reverse()
        state = {}
        for scope in chain:
            state.update(locals_snapshot(scope.f_locals))
        line = max(1, min(len(lines), frame.f_lineno - start + 1))
        item = dict(line=line, message=instruction(lines[line - 1]), state=state, nodes=node_snapshot(),
                    calls=[dict(name=f.f_code.co_name, line=f.f_lineno - start + 1) for f in chain], done=False)
        if event == 'return':
            item['message'] = f"Возврат из {frame.f_code.co_name}: {json.dumps(freeze(value), ensure_ascii=False)}"
        if frame.f_code is function.__code__:
            last_root = item
        frames.append(item)
        return capture

    previous = sys.gettrace()
    try:
        sys.settrace(capture)
        result = function(**copy.deepcopy(args))
    finally:
        sys.settrace(previous)
    terminal = copy.deepcopy(last_root or frames[-1])
    terminal.update(done=True, result=freeze(result), message='Алгоритм завершён. Сравните результат с ожидаемым ответом.', nodes=node_snapshot(), calls=[])
    frames.append(terminal)
    return dict(code=code, frames=frames, result=freeze(result))


def compile_lesson(lesson):
    module = importlib.import_module(f"curriculum.ch{lesson['chapter']:02}")
    function = getattr(module, lesson['id'])
    examples, code = [], ''
    for example in lesson['examples']:
        recorded = trace(function, example['args'])
        if recorded['result'] != example['expected']:
            raise AssertionError((lesson['id'], recorded['result'], example['expected']))
        code = recorded['code']
        examples.append(dict(**copy.deepcopy(example), frames=recorded['frames']))
    payload = dict(id=lesson['id'], code=code, examples=examples)
    if any(f['nodes'] for e in examples for f in e['frames']):
        payload['support'] = inspect.getsource(structures)
    return payload
