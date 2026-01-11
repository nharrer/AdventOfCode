#!/usr/bin/env python3
"""Compile and run every dayNN.cpp inside subfolders of the 2020 directory.

Usage:
  python3 compile_and_run_all.py [--clean]

Options:
  --clean    remove the built executables after running
"""

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

# Expected solutions for quick verification (part1, part2)
EXPECTED = {
    'day01': (299299, 287730716),
    'day02': (528, 497),
    'day03': (178, 3492520200),
    'day04': (235, 194),
    'day05': (998, 676),
    'day06': (6542, 3299),
    'day07': (302, 4165),
    'day08': (1475, 1270),
    'day09': (1398413738, 169521051),
    'day10': (2380, 48358655787008),
    'day11': (2329, 2138),
}

SKIP_DAYS_AFTER = None  # days above this number will be skipped

COMPILE_CMD = ['clang++', '-std=c++20', '-O3', '-ffast-math']

BAR_WIDTH = 90


def main():
    args = parse_args()
    base = Path(__file__).resolve().parent

    day_dirs = find_day_dirs(base)
    if not day_dirs:
        print('No dayNN subfolders found in this directory.')
        sys.exit(1)

    summary = []
    for d in day_dirs:
        summary.append(process_day(d, args))

    print_summary(summary)


def parse_args():
    parser = argparse.ArgumentParser(description='Compile and run all 2020 C++ day solutions')
    parser.add_argument('--clean', action='store_true', help='Remove built executables after running')
    parser.add_argument('--recompile', action='store_true', help='Force recompilation of every day even if executable is newer')
    return parser.parse_args()


def find_day_dirs(base: Path):
    return sorted([p for p in base.iterdir() if p.is_dir() and p.name.startswith('day')])


def choose_cpp_target(d: Path):
    cpp_candidates = list(d.glob('*.cpp'))
    if not cpp_candidates:
        return None
    expected = f'{d.name}.cpp'
    for c in cpp_candidates:
        if c.name == expected:
            return c
    return cpp_candidates[0]


def should_skip_compile(exe_path: Path, cpp_path: Path) -> bool:
    return exe_path.exists() and exe_path.stat().st_mtime > cpp_path.stat().st_mtime


def parse_run_output(proc: subprocess.CompletedProcess):
    part1 = None
    part2 = None
    duration_ms = None
    if proc.returncode != 0:
        return part1, part2, duration_ms
    out = proc.stdout or ''
    m1 = re.search(r'Solution Part 1:\s*([0-9]+)', out)
    m2 = re.search(r'Solution Part 2:\s*([0-9]+)', out)
    md = re.search(r'Duration:\s*([0-9.]+)\s*ms', out)
    if m1:
        part1 = int(m1.group(1))
    if m2:
        part2 = int(m2.group(1))
    if md:
        try:
            duration_ms = float(md.group(1))
        except ValueError:
            duration_ms = None
    return part1, part2, duration_ms


def process_day(d: Path, args) -> tuple:
    day = int(d.name[3:])
    if SKIP_DAYS_AFTER is not None and day > SKIP_DAYS_AFTER:
        print(f'⚠️ Skipping {d.name}: day > 3 not yet implemented')
        return (d.name, 'skipped', None)

    target_cpp = choose_cpp_target(d)
    if target_cpp is None:
        print(f'⚠️ Skipping {d.name}: no .cpp files found')
        return (d.name, 'no-cpp', None)

    prev_cwd = os.getcwd()
    try:
        os.chdir(d)
        exe_path = Path(d.name)
        cpp_path = Path(target_cpp.name)

        if not args.recompile and should_skip_compile(exe_path, cpp_path):
            print(f'ℹ️ Skipping compilation for {cpp_path.name}: executable is newer than source')
            comp_rc = 0
        else:
            comp = compile_cpp(cpp_path, exe_path)
            comp_rc = comp.returncode
            if comp_rc != 0:
                return (d.name, 'compile-failed', comp_rc)

        run = run_exe(exe_path)
        part1, part2, duration_ms = parse_run_output(run)
        expected = EXPECTED.get(d.name)
        matched = None
        if expected is not None and part1 is not None and part2 is not None:
            matched = part1 == expected[0] and part2 == expected[1]

        res = (
            d.name,
            'ran',
            run.returncode,
            part1,
            part2,
            duration_ms,
            expected,
            matched,
        )

        if args.clean:
            try:
                exe_path.unlink()
            except Exception as e:
                print(f'⚠️ Failed to remove {exe_path}: {e}')

        return res
    finally:
        os.chdir(prev_cwd)


def compile_cpp(cpp_path: Path, exe_path: Path) -> subprocess.CompletedProcess:
    cmd = COMPILE_CMD + ['-o', str(exe_path), str(cpp_path)]
    print(f'🔧 Compiling {cpp_path} -> {exe_path}')
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=False)
    if proc.returncode != 0:
        print(f'❌ Compilation failed for {cpp_path.name}:\n{proc.stderr}')
    else:
        print(f'✅ Compiled {cpp_path.name}')
    return proc


def run_exe(exe_path: Path) -> subprocess.CompletedProcess:
    print(f'▶️ Running {exe_path}')
    proc = subprocess.run(
        ['./' + str(exe_path)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=False,
    )
    print(f'--- stdout ---\n{proc.stdout.strip()}')
    if proc.stderr:
        print(f'--- stderr ---\n{proc.stderr.strip()}')
    print(f'Exit code: {proc.returncode}\n')
    return proc


def print_summary(summary: list) -> None:
    print('\n--- Summary ---')

    # prepare formatted duration strings and compute max width for right alignment
    def fmt(d):
        return f'{d:.3f} ms' if (d is not None) else 'unknown'

    durations = [entry[5] for entry in summary if entry[1] == 'ran' and entry[5] is not None]
    max_duration_val = max(durations, default=None)
    durations_str = [fmt(entry[5]) for entry in summary if entry[1] == 'ran']
    max_dur_width = max((len(s) for s in durations_str), default=0)

    for entry in summary:
        status = entry[1]
        if status == 'ran':
            name, _, code, part1, part2, duration_ms, expected, matched = entry
            duration_str = fmt(duration_ms).rjust(max_dur_width)

            # compute bar and percentage relative to max_duration_val
            COLOR0 = '#4294f9'
            COLOR100 = '#13a744'
            bar, _ = render_duration_bar(duration_ms, max_duration_val, BAR_WIDTH, COLOR0, COLOR100)

            if expected is None:
                print(f'✅ {name}: exit {code} — duration: {duration_str} — [{bar}]')
            elif part1 is None or part2 is None:
                print(f'❌ {name}: exit {code} — duration: {duration_str} — [{bar}] — could not parse solutions from output')
            elif matched:
                print(f'✅ {name}: exit {code} — duration: {duration_str} — [{bar}]')
            else:
                exp1, exp2 = expected
                print(
                    f'❌ {name}: exit {code} — duration: {duration_str} — [{bar}] — expected part1={exp1} part2={exp2} but got part1={part1} part2={part2}'
                )
        elif status == 'compile-failed':
            print(f'❌ {entry[0]}: compile failed (exit {entry[2]})')
        elif status == 'no-cpp':
            print(f'⚠️ {entry[0]}: no .cpp file')
    print('--- done ---')


def render_duration_bar(duration_ms, max_duration_val, bar_width, color0='#4294f9', color100='#47f9a6'):
    """Return a colored bar string and percentage label for a duration.

    - duration_ms: duration for this entry (or None)
    - max_duration_val: maximum duration across all entries (or None)
    - bar_width: number of characters to render
    - color0/color100: hex strings for 0% and 100% colors
    """
    COLOR_DIM = '\x1b[2m'
    COLOR_RESET = '\x1b[0m'
    FILLED_CHAR = '█'
    EMPTY_CHAR = '░'

    def rgb_escape(r, g, b):
        return f'\x1b[38;2;{r};{g};{b}m'

    def hex_to_rgb(h: str):
        hh = h.lstrip('#')
        return tuple(int(hh[i : i + 2], 16) for i in (0, 2, 4))

    if max_duration_val is not None and duration_ms is not None and max_duration_val > 0:
        pct = (duration_ms / max_duration_val) * 100.0
        filled = int(round((pct / 100.0) * bar_width))
        t = max(0.0, min(pct / 100.0, 1.0))
        r0, g0, b0 = hex_to_rgb(color0)
        r1, g1, b1 = hex_to_rgb(color100)
        r = int(round(r0 + (r1 - r0) * t))
        g = int(round(g0 + (g1 - g0) * t))
        b = int(round(b0 + (b1 - b0) * t))
        color = rgb_escape(r, g, b)
        filled_part = color + (FILLED_CHAR * filled) + COLOR_RESET
        empty_part = COLOR_DIM + (EMPTY_CHAR * (bar_width - filled)) + COLOR_RESET
        bar = filled_part + empty_part
        pct_str = f'{pct:5.1f}%'
    else:
        bar = COLOR_DIM + (EMPTY_CHAR * bar_width) + COLOR_RESET
        pct_str = '  -  '

    return bar, pct_str


if __name__ == '__main__':
    main()
