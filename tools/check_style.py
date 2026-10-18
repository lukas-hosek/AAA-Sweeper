#!/usr/bin/env python3
"""Checks the house formatting rules that Biome doesn't (see "Coding Rules" in .claude/CLAUDE.md).

    scripts/check_style.sh                      # js/, css/, index.html and the JS unit tests
    scripts/check_style.sh js/game/field.js     # selected files

JavaScript:
- indentation is tabs only (spaces may follow only to align a JSDoc ` *` or trailing comments)
- no trailing whitespace, lines at most 140 columns (tab = 4), long string literals excepted
- K&R braces: no `{` alone on a line after a block header, no line starting with `else`
- control statements always use braces, one statement per line
- 2 blank lines around multi-line top-level items and before every class method, never more than 2,
  and at most 1 in a row inside function bodies
- no declared identifier of 2 characters or fewer, except loop counters and vector components
- load order: no `extends X` or load-time `new X(...)` (module level or class field initialiser) where X comes from a
  module in the same import cycle; whether X exists yet would depend on which module of the cycle loads first
CSS: tabs, no trailing whitespace, one declaration per line, `selector {` on one line, never more than 2 blank lines.
HTML: tabs and no trailing whitespace.

Exit code 1 if anything is reported.
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MAX_COLUMNS = 140
SHORT_NAMES_ALLOWED = {'i', 'j', 'k', 'x', 'y', 'z', 'dx', 'dy', 'dz', 'r', 'g', 'b', 'a', 'id', 'xp', '_'}   # counters, components, words, unused
REGEX_PRECEDERS = set('(,=:[!&|?{};+-*%<>~^') | {'return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', ''}

problems = []


def report(path, line_number, message):
    problems.append(f'{os.path.relpath(path, ROOT)}:{line_number}: {message}')


def columns(text):
    return len(text.expandtabs(4))


def scan_javascript(source):
    """Splits JS into per-line info: the code with strings, templates and comments blanked out, the brace depth
    at the start of the line, whether the line starts inside a template literal or block comment, and the
    longest string literal on it."""
    lines = []
    state = 'code'           # code | line-comment | block-comment | string | template | regex
    quote = ''
    template_stack = []      # brace depth at each ${ ... } inside a template literal
    depth = 0
    code, longest_string, string_length = [], 0, 0
    starts_in_literal = False
    previous_token = ''
    i = 0
    n = len(source)
    while i < n:
        c = source[i]
        if c == '\n':
            lines.append({'code': ''.join(code), 'depth_at_start': depth_before, 'in_literal': starts_in_literal,
                          'longest_string': max(longest_string, string_length)}
                         if lines or True else None)
            if state == 'line-comment':
                state = 'code'
            if state == 'string':
                state = 'code'
            code, longest_string = [], 0
            if state in ('template', 'string'):
                string_length = 0
            starts_in_literal = state in ('template', 'block-comment')
            depth_before = depth
            i += 1
            continue
        if i == 0:
            depth_before = 0
        if state == 'code':
            if c == '/' and source.startswith('//', i):
                state = 'line-comment'; i += 2; continue
            if c == '/' and source.startswith('/*', i):
                state = 'block-comment'; i += 2; continue
            if c == '/' and previous_token in REGEX_PRECEDERS:
                state = 'regex'; code.append('/'); i += 1; continue
            if c in '\'"':
                state, quote, string_length = 'string', c, 0
                code.append(c); i += 1; continue
            if c == '`':
                state, string_length = 'template', 0
                code.append(c); i += 1; continue
            if c == '{':
                depth += 1
            elif c == '}':
                if template_stack and template_stack[-1] == depth:
                    template_stack.pop()
                    state = 'template'
                    code.append('}'); i += 1; continue
                depth -= 1
            code.append(c)
            if not c.isspace():
                if c.isalnum() or c in '_$':
                    j = i
                    while j < n and (source[j].isalnum() or source[j] in '_$'):
                        j += 1
                    word = source[i:j]
                    code.append(source[i + 1:j])
                    previous_token = word
                    i = j
                    continue
                previous_token = c
            i += 1
        elif state == 'line-comment':
            i += 1
        elif state == 'block-comment':
            if source.startswith('*/', i):
                state = 'code'; i += 2; continue
            i += 1
        elif state == 'string':
            if c == '\\':
                i += 2; string_length += 2; continue
            if c == quote:
                state = 'code'; code.append(c); previous_token = 'string'
                longest_string = max(longest_string, string_length)
            else:
                code.append(' '); string_length += 1
            i += 1
        elif state == 'template':
            if c == '\\':
                i += 2; string_length += 2; continue
            if c == '`':
                state = 'code'; code.append(c); previous_token = 'string'
                longest_string = max(longest_string, string_length)
            elif source.startswith('${', i):
                template_stack.append(depth)
                state = 'code'; code.append('${'); previous_token = '{'; i += 2; continue
            else:
                code.append(' '); string_length += 1
            i += 1
        elif state == 'regex':
            if c == '\\':
                code.append('  '); i += 2; continue
            if c == '[':
                close = source.find(']', i + 1)
                code.append(' ' * (close - i)); i = close; continue
            code.append(c if c == '/' else ' ')
            if c == '/':
                state, previous_token = 'code', 'regex'
            i += 1
    lines.append({'code': ''.join(code), 'depth_at_start': depth_before if n else 0, 'in_literal': starts_in_literal,
                  'longest_string': max(longest_string, string_length)})
    return lines


def check_whitespace(path, raw_lines, info=None, html=False):
    for number, text in enumerate(raw_lines, 1):
        in_literal = info and info[number - 1]['in_literal']
        if text != text.rstrip() and not in_literal:
            report(path, number, 'trailing whitespace')
        indent = text[:len(text) - len(text.lstrip())]
        if in_literal and not text.lstrip().startswith('*'):
            continue
        spaces = indent.lstrip('\t')
        jsdoc = spaces == ' ' and text.lstrip().startswith('*')
        if spaces and not jsdoc:
            report(path, number, 'indentation must be tabs')


def unit_kind(code_line):
    stripped = code_line.strip()
    if re.match(r'(export\s+)?(default\s+)?(abstract\s+)?class\b', stripped):
        return 'class'
    if stripped.startswith('import'):
        return 'import'
    return 'other'


def check_javascript(path):
    source = open(path, encoding='utf-8').read()
    raw_lines = source.split('\n')
    if raw_lines and raw_lines[-1] == '':
        raw_lines.pop()
    info = scan_javascript(source)[:len(raw_lines)]
    check_whitespace(path, raw_lines, info)

    class_depths = set()       # brace depths that are class bodies
    pending_class = False
    blank_run = 0
    previous_unit_multiline = None   # at depth 0: whether the previous top-level unit spanned several lines
    unit_start = None
    comment_run_start = None
    first_member_of_class = False
    previous_code_line = ''

    for index, (text, line) in enumerate(zip(raw_lines, info)):
        number = index + 1
        code = line['code']
        stripped = text.strip()
        depth = line['depth_at_start']
        is_blank = stripped == ''
        is_comment = not is_blank and not code.strip()

        # Line length; lines carrying a long string literal are exempt
        if columns(text) > MAX_COLUMNS and line['longest_string'] < 50 and not line['in_literal']:
            report(path, number, f'line is {columns(text)} columns (max {MAX_COLUMNS})')

        if line['in_literal']:
            continue

        if is_blank:
            blank_run += 1
            if blank_run > 2:
                report(path, number, 'more than 2 blank lines')
            elif blank_run > 1 and depth > 0 and depth not in class_depths:
                report(path, number, '2 blank lines inside a function body')
            continue

        code_stripped = code.strip()

        # K&R braces
        if code_stripped == '{' and re.search(r'(\)|\belse|=>|\btry|\bfinally|\bdo|\bclass\b.*)\s*$', previous_code_line):
            report(path, number, 'opening brace belongs on the previous line (K&R)')
        if re.match(r'else\b', code_stripped):
            report(path, number, '`else` belongs on the line of the closing brace: `} else {`')
        control = re.match(r'(\}\s*else\s+)?(if|for|while)\s*\(', code_stripped)
        if control:
            open_at = code_stripped.index('(', control.end() - 1)
            level, close_at = 0, -1
            for position in range(open_at, len(code_stripped)):
                if code_stripped[position] == '(':
                    level += 1
                elif code_stripped[position] == ')':
                    level -= 1
                    if level == 0:
                        close_at = position
                        break
            rest = code_stripped[close_at + 1:].strip() if close_at >= 0 else '{'
            if rest and rest != '{':
                report(path, number, 'control statement without braces')
        if re.match(r'(\}\s*)?else\s+(?!if\b)[^{\s]', code_stripped):
            report(path, number, 'else without braces')

        # One statement per line: semicolons outside parentheses
        level, statements = 0, 0
        for character in code_stripped:
            if character in '([':
                level += 1
            elif character in ')]':
                level -= 1
            elif character == ';' and level == 0:
                statements += 1
        if statements > 1:
            report(path, number, 'more than one statement on a line')

        # Short declared names
        declared = []
        declared += re.findall(r'\b(?:let|const|var)\s+([A-Za-z_$][\w$]*)', code)
        for group in re.findall(r'\b(?:let|const|var)\s+[\[{]([^\]}=]*)[\]}]\s*=', code):
            declared += [part.split(':')[-1].strip().lstrip('.') for part in group.split(',')]
        for params in re.findall(r'\bfunction\b[^(]*\(([^)]*)\)', code) + re.findall(r'\(([^()]*)\)\s*=>', code):
            declared += [part.split('=')[0].strip().lstrip('.') for part in params.split(',')]
        declared += re.findall(r'(?:^|[=(,:]\s*)([A-Za-z_$][\w$]*)\s*=>', code)
        method = re.match(r'\s*(?:static\s+|async\s+|get\s+|set\s+)*#?[A-Za-z_$][\w$]*\s*\(([^)]*)\)\s*\{\s*$', code)
        if method and depth in class_depths:
            declared += [part.split('=')[0].strip() for part in method.group(1).split(',')]
        declared += re.findall(r'\bcatch\s*\(\s*([A-Za-z_$][\w$]*)', code)
        declared += re.findall(r'^\s*#?([A-Za-z_$][\w$]*)\s*(?:=|;)', code) if depth in class_depths else []
        for name in declared:
            name = name.strip().lstrip('#')
            if name and re.fullmatch(r'[A-Za-z_$][\w$]*', name) and len(name) <= 2 and name not in SHORT_NAMES_ALLOWED:
                report(path, number, f'name `{name}` is too short')

        # Blank lines between top-level items and class members
        starts_statement = depth == 0 and not re.match(r'[\])}.,?:+\-*/&|]', code_stripped) and not previous_code_line.rstrip().endswith((',', '(', '[', '{', '=', '?', ':', '&&', '||', '+'))
        if depth == 0 and (is_comment or starts_statement):
            if comment_run_start is None:
                comment_run_start = (number, blank_run)
            if not is_comment:
                blanks_before = comment_run_start[1]
                kind = unit_kind(code)
                # Find out whether this unit spans several lines: depth returns to 0 later than this line
                multiline = False
                for later in info[index + 1:]:
                    if later['depth_at_start'] == 0 and not later['in_literal']:
                        later_code = later['code'].strip()
                        multiline = later_code.startswith(('}', ']', ')')) or (later_code and code_stripped.endswith((',', '(', '[', '{', '=')))
                        break
                    multiline = True
                    break
                if previous_unit_multiline is not None and number > 1:
                    needs_two = multiline or previous_unit_multiline or kind != unit_start
                    if needs_two and blanks_before != 2:
                        report(path, comment_run_start[0], f'expected 2 blank lines before this top-level item, found {blanks_before}')
                previous_unit_multiline, unit_start = multiline, kind
                comment_run_start = None
        elif depth in class_depths:
            if comment_run_start is None:
                comment_run_start = (number, blank_run)
            if not is_comment:
                is_method = bool(re.match(r'\s*(?:static\s+|async\s+|get\s+|set\s+)*#?[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{', code)) or code_stripped.startswith('constructor')
                blanks_before = comment_run_start[1]
                if first_member_of_class:
                    if blanks_before != 0:
                        report(path, comment_run_start[0], 'no blank line after the class header')
                elif is_method and blanks_before != 2:
                    report(path, comment_run_start[0], f'expected 2 blank lines before this method, found {blanks_before}')
                elif not is_method and blanks_before > 1:
                    report(path, comment_run_start[0], 'class fields stay together (at most 1 blank line)')
                first_member_of_class = False
                comment_run_start = None
        else:
            comment_run_start = None

        if depth == 0 and previous_unit_multiline is None and not is_comment:
            previous_unit_multiline = False

        # Track class bodies: a line that declares a class opens a class body at the next depth
        if re.search(r'\bclass\b[^{]*\{\s*$', code) or (pending_class and code_stripped == '{'):
            class_depths.add(depth + 1)
            first_member_of_class = True
        pending_class = bool(re.search(r'\bclass\b[^{]*$', code)) and not code.rstrip().endswith(('{', ';'))
        if code_stripped.startswith('}'):
            closing_depth = depth
            if closing_depth in class_depths and code_stripped.rstrip(';') == '}':
                class_depths.discard(closing_depth)
        blank_run = 0
        if code_stripped:
            previous_code_line = code


def check_css(path):
    raw_lines = open(path, encoding='utf-8').read().split('\n')
    if raw_lines and raw_lines[-1] == '':
        raw_lines.pop()
    check_whitespace(path, raw_lines)
    blank_run = 0
    in_comment = False
    for number, text in enumerate(raw_lines, 1):
        stripped = text.strip()
        if not stripped:
            blank_run += 1
            if blank_run > 2:
                report(path, number, 'more than 2 blank lines')
            continue
        blank_run = 0
        code = re.sub(r'/\*.*?\*/', '', stripped)
        if in_comment:
            if '*/' in stripped:
                in_comment = False
            continue
        if '/*' in code:
            in_comment = True
            continue
        code = re.sub(r'url\([^)]*\)|"[^"]*"|\'[^\']*\'', 'X', code)
        if code == '{':
            report(path, number, 'opening brace belongs on the selector line')
        if code.count(';') > 1:
            report(path, number, 'one declaration per line')
        if '{' in code and ';' in code:
            report(path, number, 'declarations go on their own lines')


def check_html(path):
    raw_lines = open(path, encoding='utf-8').read().split('\n')
    if raw_lines and raw_lines[-1] == '':
        raw_lines.pop()
    check_whitespace(path, raw_lines, html=True)


IMPORT = re.compile(r"\bimport\s+(?:\{([^}]*)\}\s+from\s+|\*\s+as\s+[\w$]+\s+from\s+|[\w$]+\s+from\s+)?'([^']+)'", re.S)


def import_cycles(paths):
    """The modules' imports ({path: {imported name: module path}}) and, for every module, the id of its strongly
    connected component in the import graph: modules with the same id are in one import cycle."""
    imports, edges = {}, {}
    for path in paths:
        source = open(path, encoding='utf-8').read()
        imports[path], edges[path] = {}, []
        for match in IMPORT.finditer(source):
            target = os.path.normpath(os.path.join(os.path.dirname(path), match.group(2)))
            edges[path].append(target)
            for name in (match.group(1) or '').split(','):
                name = name.strip().split(' as ')[-1].strip()
                if name:
                    imports[path][name] = target
    # Tarjan's algorithm, iterative so deep import chains can't hit the recursion limit
    index, low, component, on_stack, stack, counter = {}, {}, {}, set(), [], [0]
    for root in paths:
        if root in index:
            continue
        work = [(root, iter(edges[root]))]
        index[root] = low[root] = counter[0]
        counter[0] += 1
        stack.append(root)
        on_stack.add(root)
        while work:
            node, targets = work[-1]
            target = next((t for t in targets if t in edges), None)
            if target is not None:
                if target not in index:
                    index[target] = low[target] = counter[0]
                    counter[0] += 1
                    stack.append(target)
                    on_stack.add(target)
                    work.append((target, iter(edges[target])))
                elif target in on_stack:
                    low[node] = min(low[node], index[target])
                continue
            work.pop()
            if work:
                low[work[-1][0]] = min(low[work[-1][0]], low[node])
            if low[node] == index[node]:
                while True:
                    member = stack.pop()
                    on_stack.discard(member)
                    component[member] = node
                    if member == node:
                        break
    return imports, component


def check_load_order(checked):
    """Reports load-time uses of classes imported from the same import cycle in the `checked` files."""
    every_module = []
    for base, _, names in os.walk(os.path.join(ROOT, 'js')):
        every_module += [os.path.join(base, name) for name in sorted(names) if name.endswith('.js')]
    imports, component = import_cycles(every_module)
    for path in checked:
        if path not in imports:
            continue
        source = open(path, encoding='utf-8').read()
        info = scan_javascript(source)
        class_depths = set()       # brace depths that are class bodies
        constructor_depth = None   # brace depth of the constructor body being scanned, if any
        for number, (text, line) in enumerate(zip(source.split('\n'), info), 1):
            code, depth = line['code'], line['depth_at_start']
            if constructor_depth is not None and depth < constructor_depth:
                constructor_depth = None
            if re.match(r'\s*(export\s+)?class\b', code):
                class_depths.add(depth + 1)
            elif depth in class_depths and re.match(r'\s*constructor\s*\(', code):
                constructor_depth = depth + 1
            uses = [('extends', name) for name in re.findall(r'\bextends\s+([\w$]+)', code)]
            # `new` runs at load time at module level, in class field initialisers, and in constructors (singletons
            # are constructed while their module loads)
            if depth == 0 or depth in class_depths or (constructor_depth is not None and depth >= constructor_depth):
                uses += [('new', name) for name in re.findall(r'\bnew\s+([\w$]+)', code)]
            for kind, name in uses:
                target = imports[path].get(name)
                if target and component.get(target) == component[path]:
                    report(path, number, f'load order: `{kind} {name}` uses a class from {os.path.relpath(target, ROOT)}, '
                                         'which is in the same import cycle')


def default_files():
    files = [os.path.join(ROOT, 'index.html')]
    for folder in ('js', 'css', os.path.join('tools', 'browser', 'unit')):
        for base, _, names in os.walk(os.path.join(ROOT, folder)):
            files += [os.path.join(base, name) for name in sorted(names) if name.endswith(('.js', '.css'))]
    return [f for f in files if os.path.exists(f) and not f.endswith(('fonts.css', 'voice-manifest.js'))]


def main():
    files = [os.path.abspath(f) for f in sys.argv[1:]] or default_files()
    for path in files:
        if path.endswith('.js'):
            check_javascript(path)
        elif path.endswith('.css'):
            check_css(path)
        elif path.endswith('.html'):
            check_html(path)
    check_load_order([path for path in files if path.endswith('.js')])
    for problem in problems:
        print(problem)
    print(f'{len(problems)} style problems in {len(files)} files' if problems else f'style ok ({len(files)} files)')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
