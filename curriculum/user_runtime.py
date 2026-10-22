"""Bounded replay of submitted Python. Portable to CPython and Pyodide."""
import contextlib
import copy
import io
import inspect
import json
import linecache
import math
import sys
import time
import types
from collections import deque
from . import structures


class TraceLimitError(RuntimeError):
    pass


def _bind_arguments(function, args):
    """Preserve keyword calls; renamed parameters use the template input order.

    Bind before executing: a TypeError raised inside the solution must never
    cause a second invocation with different arguments.
    """
    try:
        signature = inspect.signature(function)
    except (ValueError, TypeError):
        return (), args, []
    try:
        signature.bind(**args)
        return (), args, []
    except TypeError:
        values = tuple(args.values())
        try:
            signature.bind(*values)
        except TypeError as exc:
            raise TypeError(
                f'Function {signature} cannot accept the example inputs '
                f'({", ".join(args)}). Keep the template parameter order '
                'and the required number of arguments.'
            ) from exc
        positional = [parameter.name for parameter in signature.parameters.values()
                      if parameter.kind in (inspect.Parameter.POSITIONAL_ONLY,
                                            inspect.Parameter.POSITIONAL_OR_KEYWORD)]
        variadic = next((parameter.name for parameter in signature.parameters.values()
                         if parameter.kind == inspect.Parameter.VAR_POSITIONAL), None)
        bindings = [dict(input=name, parameter=positional[index] if index < len(positional)
                         else f'{variadic}[{index - len(positional)}]')
                    for index, name in enumerate(args)]
        return values, {}, bindings


class BoundedOutput(io.StringIO):
    def __init__(self, notices):
        super().__init__()
        self.notices = notices

    def write(self, text):
        room = max(0, 32768 - self.tell())
        if len(text) > room:
            self.notices.add('Вывод сокращён до 32 КБ.')
        super().write(text[:room])
        return len(text)


def run_solution(source, function_name, args, expected, frame_limit=1800):
    filename = 'solution.py'
    frames, notices = [], set()
    output = BoundedOutput(notices)
    history, identity = {}, 0
    error, actual, passed = None, None, False
    bindings = []
    trace_failure = None
    started = time.monotonic()
    recorded_size = 0
    freeze_budget = [4000]
    lines = source.splitlines() or ['']
    structures.NODES.clear()

    def freeze(value, depth=0, seen=None):
        freeze_budget[0] -= 1
        if freeze_budget[0] < 0:
            notices.add('Объём данных одного снимка ограничен.')
            return '…'
        if isinstance(value, structures.Node):
            return {'ref': value.id if isinstance(value.id, int) else '<нечисловой id>'}
        if value is None or isinstance(value, (bool, int)):
            return value
        if isinstance(value, float):
            return value if math.isfinite(value) else ('∞' if value > 0 else '−∞' if value < 0 else 'NaN')
        if isinstance(value, str):
            if len(value) > 1200:
                notices.add('Длинные строки в снимках сокращены.')
            return value[:1200] + ('…' if len(value) > 1200 else '')
        if depth >= 8:
            notices.add('Глубокие структуры в снимках сокращены.')
            return '…'
        seen = set() if seen is None else seen
        if id(value) in seen:
            notices.add('Циклические ссылки показаны как <цикл>.')
            return '<цикл>'
        path = seen | {id(value)}
        if isinstance(value, dict):
            result = {}
            for i, (key, item) in enumerate(value.items()):
                if i == 200:
                    result['…'] = 'Остальные элементы скрыты'
                    notices.add('Коллекции в снимках сокращены до 200 элементов.')
                    break
                result[str(key)[:200]] = freeze(item, depth + 1, path)
            return result
        if isinstance(value, (list, tuple, deque, set, frozenset)):
            result = []
            for i, item in enumerate(value):
                if i == 200:
                    result.append('…')
                    notices.add('Коллекции в снимках сокращены до 200 элементов.')
                    break
                result.append(freeze(item, depth + 1, path))
            return result
        notices.add('Некоторые пользовательские типы показаны текстом.')
        return object.__repr__(value)[:240]

    def snapshot(frame):
        nonlocal identity
        freeze_budget[0] = 4000
        scopes, current = [], frame
        while current:
            if current.f_code.co_filename == filename and current.f_code.co_name != '<module>':
                scopes.append(current)
            current = current.f_back
        scopes.reverse()
        state = {}
        for scope in scopes:
            for key, value in list(scope.f_locals.items())[:100]:
                if key.startswith('_') or isinstance(value, (types.ModuleType, types.FunctionType, type)):
                    continue
                state[key] = freeze(value)
        arrays = {}
        for name, values in state.items():
            if not isinstance(values, list) or any(isinstance(v, (list, dict)) for v in values):
                continue
            old, old_ids = history.get(name, ([], []))
            assigned, used = [], set()
            for i, value in enumerate(values):
                match = i if i < len(old) and old[i] == value and i not in used else next((j for j, v in enumerate(old) if j not in used and v == value), None)
                if match is None:
                    assigned.append(f'u{identity}')
                    identity += 1
                else:
                    assigned.append(old_ids[match])
                    used.add(match)
            arrays[name] = assigned
            history[name] = (copy.deepcopy(values), assigned)
        nodes = []
        for node in structures.NODES[:200]:
            nodes.append(dict(id=freeze(node.id), value=freeze(node.value), kind=freeze(node.kind), next=freeze(node.next), prev=freeze(node.prev), child=freeze(node.child), left=freeze(node.left), right=freeze(node.right), children=freeze(node.children), neighbors=freeze(node.neighbors), end=freeze(node.end)))
        if len(structures.NODES) > 200:
            notices.add('Показаны первые 200 узлов структуры.')
        line = max(1, min(len(lines), frame.f_lineno))
        return dict(line=line, message='Перед строкой ' + str(line) + ': ' + lines[line - 1].strip()[:240], messageEn='Before line ' + str(line) + ': ' + lines[line - 1].strip()[:240], state=state, nodes=nodes, arrays=arrays, calls=[dict(name=f.f_code.co_name, line=f.f_lineno) for f in scopes], done=False)

    def record(frame, event, value):
        nonlocal recorded_size
        if frame.f_code.co_filename != filename:
            return capture
        if time.monotonic() - started > 10:
            raise TraceLimitError('Вычисления превысили 10 секунд.')
        if event not in ('line', 'return') or frame.f_code.co_name == '<module>':
            return capture
        if len(frames) >= frame_limit:
            raise TraceLimitError(f'Превышен лимит {frame_limit} кадров.')
        item = snapshot(frame)
        if event == 'return':
            item['message'] = 'Возврат из ' + frame.f_code.co_name
            item['messageEn'] = 'Return from ' + frame.f_code.co_name
        recorded_size += len(json.dumps(item, ensure_ascii=False))
        if recorded_size > 8_000_000:
            raise TraceLimitError('Трасса превысила допустимый объём 8 МБ.')
        frames.append(item)
        return capture

    def capture(frame, event, value):
        nonlocal trace_failure
        try:
            return record(frame, event, value)
        except BaseException as exc:
            # Python disables tracing when a trace callback raises. User code
            # may catch that exception, but the replay is still incomplete.
            trace_failure = exc
            raise

    previous = sys.gettrace()
    try:
        if len(source) > 65536:
            raise TraceLimitError('Код превышает 64 КБ.')
        linecache.cache[filename] = (len(source), None, source.splitlines(True), filename)
        compiled = compile(source, filename, 'exec')
        namespace = {'__name__': '__user_solution__'}
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            sys.settrace(capture)
            exec(compiled, namespace)
            if trace_failure is not None:
                raise trace_failure
            function = namespace.get(function_name)
            if not callable(function):
                raise NameError(f'Определите функцию {function_name} с параметрами из шаблона.')
            positional, keywords, bindings = _bind_arguments(function, copy.deepcopy(args))
            actual = function(*positional, **keywords)
            sys.settrace(previous)
            if trace_failure is not None:
                raise trace_failure
            passed = bool(actual == expected)
        terminal = copy.deepcopy(frames[-1]) if frames else dict(line=1, state={}, nodes=[], arrays={}, calls=[])
        freeze_budget[0] = 4000
        terminal.update(done=True, result=freeze(actual), message='Ваш код завершён. Сравните ответ с ожидаемым.', messageEn='Your code has finished. Compare the actual and expected answers.', calls=[])
        frames.append(terminal)
    except BaseException as exc:
        sys.settrace(previous)
        line = exc.lineno if isinstance(exc, SyntaxError) else None
        tb = exc.__traceback__
        while tb:
            if tb.tb_frame.f_code.co_filename == filename:
                line = tb.tb_lineno
            tb = tb.tb_next
        error = dict(type=type(exc).__name__, message=str(exc)[:2000], line=line)
        passed = False
    finally:
        sys.settrace(previous)
        linecache.cache.pop(filename, None)
    freeze_budget[0] = 4000
    return dict(frames=frames, result=freeze(actual), passed=passed, error=error, stdout=output.getvalue(), notices=sorted(notices), bindings=bindings)
