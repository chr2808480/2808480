#!/usr/bin/env python3
"""えとくらしの posts-data.js を読み書きする補助スクリプト。

使い方:
  posts.py list   [--category 日常] [--limit 20]
  posts.py show   48 47                  # 本文を改行つきテキストで表示
  posts.py search 星 プラネタリウム       # 語を含む記事をヒット数順に表示
  posts.py add    --title "…" --category 日常 --file draft.txt [--date 2026-10-02] [--pr] [--dry-run]
  posts.py update 47 [--file draft.txt] [--title "…"] [--category 日常] [--date …] [--dry-run]

本文テキストは「1行 = 1行、空行 = 空行」の普通のテキストで渡す。
<br> への変換やダブルクォートのエスケープはスクリプトが行う。
posts-data.js の場所は --data で指定できる（省略時はカレントディレクトリから上へ探す）。
"""
import argparse
import datetime
import json
import re
import sys
from pathlib import Path

ENTRY_RE = re.compile(r"\{\s*id:\s*(\d+)\s*,(.*?)\n[ \t　]*\}", re.S)
FIELD_RE = re.compile(r'(\w+):\s*("(?:[^"\\]|\\.)*"|true|false|\d+)', re.S)
STRING_FIELDS = ("title", "date", "category", "content")


def find_data(path_arg):
    if path_arg:
        return Path(path_arg)
    here = Path.cwd().resolve()
    for d in [here, *here.parents]:
        if (d / "posts-data.js").exists():
            return d / "posts-data.js"
    for d in Path(__file__).resolve().parents:
        if (d / "posts-data.js").exists():
            return d / "posts-data.js"
    sys.exit("posts-data.js が見つかりません。--data で場所を指定してください。")


def js_unquote(lit):
    return json.loads('"' + lit[1:-1].replace("\\'", "'") + '"', strict=False)


def js_quote(s):
    return json.dumps(s, ensure_ascii=False)


def parse(raw):
    posts = []
    for m in ENTRY_RE.finditer(raw):
        post = {"id": int(m.group(1)), "_span": m.span(), "_fields": {}}
        body_start = m.start(2)
        for f in FIELD_RE.finditer(m.group(2)):
            key, lit = f.group(1), f.group(2)
            post["_fields"][key] = (body_start + f.start(2), body_start + f.end(2))
            if lit.startswith('"'):
                post[key] = js_unquote(lit)
            else:
                post[key] = lit == "true" if lit in ("true", "false") else int(lit)
        posts.append(post)
    return posts


def content_to_text(content):
    return content.replace("<br>", "\n").strip("\n")


def text_to_content(text):
    text = text.replace("\r\n", "\n").replace("\r", "\n").strip("\n")
    # 本文の先頭・末尾には <br> を付けない（余白は CSS の .body-text でとっている）
    return "<br>".join(line.rstrip() for line in text.split("\n"))


def char_count(content):
    return len(re.sub(r"<[^>]+>", "", content).replace("\n", ""))


def first_line(content):
    for line in content.split("<br>"):
        line = re.sub(r"<[^>]+>", "", line).strip()
        if line:
            return line
    return ""


def load(args):
    path = find_data(args.data)
    with open(path, encoding="utf-8", newline="") as f:  # 改行コード（CRLF）を保ったまま読む
        raw = f.read()
    return path, raw, parse(raw)


def write_checked(path, new_raw, expected_count):
    posts = parse(new_raw)
    ids = [p["id"] for p in posts]
    if len(posts) != expected_count or len(ids) != len(set(ids)):
        sys.exit("書き込み後の検証に失敗しました（記事数かidが想定と違う）。ファイルは変更していません。")
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(new_raw)


def cmd_list(args):
    _, _, posts = load(args)
    if args.category:
        posts = [p for p in posts if p.get("category") == args.category]
    for p in posts[: args.limit]:
        print(f'{p["id"]:>3}  {p.get("date","")}  {p.get("category",""):<3}  '
              f'{p.get("title","")}  ({char_count(p.get("content",""))}字)  | {first_line(p.get("content",""))[:40]}')


def cmd_show(args):
    _, _, posts = load(args)
    by_id = {p["id"]: p for p in posts}
    for i in args.ids:
        p = by_id.get(i)
        if not p:
            print(f"id {i} は見つかりません", file=sys.stderr)
            continue
        print(f'===== id:{p["id"]} {p.get("date","")} [{p.get("category","")}] '
              f'{p.get("title","")} ({char_count(p.get("content",""))}字) =====')
        print(content_to_text(p.get("content", "")))
        print()


def cmd_search(args):
    _, _, posts = load(args)
    hits = []
    for p in posts:
        hay = p.get("title", "") + "\n" + content_to_text(p.get("content", ""))
        n = sum(hay.count(w) for w in args.words)
        if n:
            hits.append((n, p, hay))
    hits.sort(key=lambda h: (-h[0], -h[1]["id"]))
    for n, p, hay in hits[: args.limit]:
        w = next(w for w in args.words if w in hay)
        i = hay.index(w)
        snippet = hay[max(0, i - 20): i + 30].replace("\n", " / ")
        print(f'{p["id"]:>3}  {p.get("date","")}  [{p.get("category","")}] {p.get("title","")}  '
              f'ヒット{n}  …{snippet}…')
    if not hits:
        print("該当なし")


def cmd_add(args):
    path, raw, posts = load(args)
    nl = "\r\n" if "\r\n" in raw else "\n"
    text = Path(args.file).read_text(encoding="utf-8")
    new_id = max(p["id"] for p in posts) + 1
    date = args.date or datetime.datetime.now(
        datetime.timezone(datetime.timedelta(hours=9))).strftime("%Y-%m-%d")
    cats = sorted({p.get("category") for p in posts})
    if args.category not in cats:
        print(f"注意: カテゴリ「{args.category}」は既存のもの（{'・'.join(cats)}）にありません。", file=sys.stderr)
    lines = ["  {", f"    id: {new_id},", f"    title: {js_quote(args.title)},",
             f"    date: {js_quote(date)},", f"    category: {js_quote(args.category)},"]
    if args.pr:
        lines.append("    pr: true,")
    lines += [f"    content: {js_quote(text_to_content(text))}", "  },"]
    entry = nl.join(lines) + nl

    m = re.search(r"const POSTS = \[[ \t]*\r?\n", raw)
    if not m:
        sys.exit("「const POSTS = [」が見つかりません。")
    new_raw = raw[: m.end()] + entry + raw[m.end():]
    if args.dry_run:
        print(entry)
        return
    write_checked(path, new_raw, len(posts) + 1)
    print(f"id {new_id}「{args.title}」({date} / {args.category} / {char_count(text_to_content(text))}字) を先頭に追加しました。")


def cmd_update(args):
    path, raw, posts = load(args)
    target = next((p for p in posts if p["id"] == args.id), None)
    if not target:
        sys.exit(f"id {args.id} は見つかりません。")
    changes = {}
    if args.file:
        changes["content"] = text_to_content(Path(args.file).read_text(encoding="utf-8"))
    for key in ("title", "category", "date"):
        if getattr(args, key):
            changes[key] = getattr(args, key)
    if not changes:
        sys.exit("変更内容がありません（--file / --title / --category / --date のどれかを指定）。")
    missing = [k for k in changes if k not in target["_fields"]]
    if missing:
        sys.exit(f"id {args.id} に {missing} の項目が見つからないため更新できません。")
    # 後ろの項目から置き換えると、前の項目の位置がずれない
    new_raw = raw
    for key in sorted(changes, key=lambda k: target["_fields"][k][0], reverse=True):
        s, e = target["_fields"][key]
        new_raw = new_raw[:s] + js_quote(changes[key]) + new_raw[e:]
    if args.dry_run:
        for key, val in changes.items():
            print(f"--- {key} ---")
            print(content_to_text(val) if key == "content" else val)
        return
    write_checked(path, new_raw, len(posts))
    print(f"id {args.id} を更新しました: {', '.join(changes)}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", help="posts-data.js のパス")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("list")
    p.add_argument("--category")
    p.add_argument("--limit", type=int, default=100)
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("show")
    p.add_argument("ids", type=int, nargs="+")
    p.set_defaults(func=cmd_show)

    p = sub.add_parser("search")
    p.add_argument("words", nargs="+")
    p.add_argument("--limit", type=int, default=10)
    p.set_defaults(func=cmd_search)

    p = sub.add_parser("add")
    p.add_argument("--title", required=True)
    p.add_argument("--category", required=True)
    p.add_argument("--file", required=True, help="本文テキストファイル")
    p.add_argument("--date", help="YYYY-MM-DD（省略時は日本時間の今日）")
    p.add_argument("--pr", action="store_true", help="広告・アフィリエイトを含む記事")
    p.add_argument("--dry-run", action="store_true")
    p.set_defaults(func=cmd_add)

    p = sub.add_parser("update")
    p.add_argument("id", type=int)
    p.add_argument("--file", help="新しい本文テキストファイル")
    p.add_argument("--title")
    p.add_argument("--category")
    p.add_argument("--date")
    p.add_argument("--dry-run", action="store_true")
    p.set_defaults(func=cmd_update)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
