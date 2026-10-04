#!/usr/bin/env python3
"""컴네위키 빌드 — src/* 를 단일 index.html 로 묶는다.

사용:  python3 build.py [--slides <슬라이드 PNG 디렉터리>]

하는 일
  1. src/articles/*.wiki 를 파일명 순으로 읽어 ARTICLES JS 객체 생성
  2. category 첫 항목 기준으로 NAV_ORDER 생성 (등장 순서 유지)
  3. head.html + ARTICLES + NAV_ORDER + sims/_engine.js + sims/*.js
     + anims/_anim_engine.js + anims/*.js + renderer.js 연결
  4. 본문이 참조한 [[img:NAME]] 만 슬라이드 디렉터리에서 images/ 로 복사
  5. 깨진 [[링크]] 와 없는 [[sim:]] / [[anim:]] 을 경고로 출력

헤더가 망가진 경우에만 exit 1, 그 밖의 경고는 exit 0.
"""

import json
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
ARTICLES_DIR = os.path.join(SRC, "articles")
SIMS_DIR = os.path.join(SRC, "sims")
ANIMS_DIR = os.path.join(SRC, "anims")
IMAGES_DIR = os.path.join(ROOT, "images")
OUT = os.path.join(ROOT, "index.html")

# 슬라이드 PNG 원본 (git 에서는 제외). 재생성: pdftoppm -r 90 -png <강의.pdf> _slides/L<n>
DEFAULT_SLIDES = os.path.join(ROOT, "_slides")

# caption 에 ']' 가 들어갈 수 있으므로 (예: prio_to_weight[40]) 줄 단위로 lazy 매칭한다.
IMG_RE = re.compile(r"\[\[img:([^\|\]\n]+)(?:\|[^\n]*?)?(?:\|(?:small|medium|large))?\]\]")
SIM_RE = re.compile(r"\[\[sim:([^\|\]]+)\]\]")
ANIM_RE = re.compile(r"\[\[anim:([^\|\]\n]+)(?:\|[^\n]*?)?\]\]")
LINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
REQUIRED_KEYS = ("key", "title", "category")


def fail(msg):
    print("ERROR: %s" % msg, file=sys.stderr)
    sys.exit(1)


def parse_article(path):
    """{key,title,category[],body} 를 돌려준다. 헤더가 망가지면 즉시 종료."""
    name = os.path.basename(path)
    with open(path, encoding="utf-8") as f:
        text = f.read()

    lines = text.split("\n")
    header = {}
    body_start = None
    for i, line in enumerate(lines):
        if line.strip() == "---":
            body_start = i + 1
            break
        if line.strip() == "":
            continue
        if ":" not in line:
            fail("%s: 헤더 %d번 줄이 'key: value' 형식이 아님 → %r" % (name, i + 1, line))
        k, v = line.split(":", 1)
        header[k.strip()] = v.strip()

    if body_start is None:
        fail("%s: 헤더를 닫는 '---' 줄이 없음" % name)
    for k in REQUIRED_KEYS:
        if not header.get(k):
            fail("%s: 헤더에 '%s' 가 없거나 비어 있음" % (name, k))

    cats = [c.strip() for c in header["category"].split(",") if c.strip()]
    if not cats:
        fail("%s: category 가 비어 있음" % name)

    return {
        "file": name,
        "key": header["key"],
        "title": header["title"],
        "category": cats,
        "body": "\n".join(lines[body_start:]).strip("\n"),
    }


def js_json(obj):
    """JS <script> 안에 넣어도 안전한 JSON 리터럴."""
    s = json.dumps(obj, ensure_ascii=False, indent=1)
    return s.replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def main():
    slides_dir = DEFAULT_SLIDES
    argv = sys.argv[1:]
    if "--slides" in argv:
        slides_dir = argv[argv.index("--slides") + 1]

    if not os.path.isdir(SRC):
        fail("src/ 디렉터리가 없습니다: %s" % SRC)
    os.makedirs(ARTICLES_DIR, exist_ok=True)

    # ---------- 1. 문서 ----------
    files = sorted(f for f in os.listdir(ARTICLES_DIR) if f.endswith(".wiki"))
    arts = [parse_article(os.path.join(ARTICLES_DIR, f)) for f in files]

    articles = {}
    for a in arts:
        if a["key"] in articles:
            print("WARN: 중복 key '%s' (%s) — 나중 파일이 덮어씁니다." % (a["key"], a["file"]))
        articles[a["key"]] = {
            "title": a["title"],
            "category": a["category"],
            "body": a["body"],
        }

    # ---------- 2. NAV_ORDER ----------
    nav = []
    index = {}
    for a in arts:
        g = a["category"][0]
        if g not in index:
            index[g] = len(nav)
            nav.append({"group": g, "items": []})
        nav[index[g]]["items"].append(a["key"])

    # ---------- 3. 이미지 ----------
    os.makedirs(IMAGES_DIR, exist_ok=True)
    wanted = {}
    for a in arts:
        for m in IMG_RE.finditer(a["body"]):
            wanted.setdefault(m.group(1).strip(), set()).add(a["file"])

    copied, missing_imgs = 0, []
    for fname in sorted(wanted):
        src = os.path.join(slides_dir, fname)
        dst = os.path.join(IMAGES_DIR, fname)
        if os.path.isfile(src):
            if (not os.path.exists(dst)) or os.path.getmtime(src) > os.path.getmtime(dst):
                shutil.copy2(src, dst)
            copied += 1
        else:
            missing_imgs.append((fname, sorted(wanted[fname])))

    # ---------- 4. 링크 / sim 검사 ----------
    broken = {}
    for a in arts:
        for m in LINK_RE.finditer(a["body"]):
            raw = m.group(1)
            if raw.startswith("img:") or raw.startswith("sim:") or raw.startswith("anim:"):
                continue
            key = raw.split("|", 1)[0].strip()
            if key and key not in articles:
                broken.setdefault(key, set()).add(a["file"])

    sim_files = sorted(
        f for f in os.listdir(SIMS_DIR) if f.endswith(".js") and f != "_engine.js"
    ) if os.path.isdir(SIMS_DIR) else []

    defined_sims = set()
    for f in sim_files:
        with open(os.path.join(SIMS_DIR, f), encoding="utf-8") as fh:
            for m in re.finditer(r"""SIMS\[\s*["']([^"']+)["']\s*\]\s*=""", fh.read()):
                defined_sims.add(m.group(1))

    used_sims = {}
    for a in arts:
        for m in SIM_RE.finditer(a["body"]):
            used_sims.setdefault(m.group(1).strip(), set()).add(a["file"])
    missing_sims = {k: v for k, v in used_sims.items() if k not in defined_sims}

    anim_files = sorted(
        f for f in os.listdir(ANIMS_DIR) if f.endswith(".js") and f != "_anim_engine.js"
    ) if os.path.isdir(ANIMS_DIR) else []

    defined_anims = set()
    for f in anim_files:
        with open(os.path.join(ANIMS_DIR, f), encoding="utf-8") as fh:
            for m in re.finditer(r"""ANIMS\[\s*["']([^"']+)["']\s*\]\s*=""", fh.read()):
                defined_anims.add(m.group(1))

    used_anims = {}
    for a in arts:
        for m in ANIM_RE.finditer(a["body"]):
            used_anims.setdefault(m.group(1).strip(), set()).add(a["file"])
    missing_anims = {k: v for k, v in used_anims.items() if k not in defined_anims}
    unused_anims = sorted(defined_anims - set(used_anims))

    # ---------- 5. 조립 ----------
    def read(p):
        with open(p, encoding="utf-8") as f:
            return f.read()

    head = read(os.path.join(SRC, "head.html"))
    engine = read(os.path.join(SIMS_DIR, "_engine.js")) if os.path.isfile(os.path.join(SIMS_DIR, "_engine.js")) else ""
    renderer = read(os.path.join(SRC, "renderer.js"))

    parts = [head, "\n<script>\n"]
    parts.append("// ===== 문서 데이터 (build.py 생성) =====\n")
    parts.append("const ARTICLES = " + js_json(articles) + ";\n")
    parts.append("const NAV_ORDER = " + js_json(nav) + ";\n")
    parts.append("\n// ===== SimEngine =====\n")
    parts.append(engine)
    for f in sim_files:
        parts.append("\n// ===== sims/%s =====\n" % f)
        parts.append(read(os.path.join(SIMS_DIR, f)))
    anim_engine_path = os.path.join(ANIMS_DIR, "_anim_engine.js")
    if os.path.isfile(anim_engine_path):
        parts.append("\n// ===== AnimEngine =====\n")
        parts.append(read(anim_engine_path))
    for f in anim_files:
        parts.append("\n// ===== anims/%s =====\n" % f)
        parts.append(read(os.path.join(ANIMS_DIR, f)))
    parts.append("\n// ===== renderer =====\n")
    parts.append(renderer)

    # ---------- 5b. 오프라인(PWA): 버전 해시 + 이미지 목록 + sw.js + manifest ----------
    import hashlib
    body_so_far = "".join(parts)
    image_list = sorted(wanted)
    ver = hashlib.md5((body_so_far + "|".join(image_list)).encode("utf-8")).hexdigest()[:10]
    parts.append("\n// ===== offline (build.py 생성) =====\n")
    parts.append("const OFFLINE_VER = " + json.dumps(ver) + ";\n")
    parts.append("const OFFLINE_IMAGES = " + js_json(["images/" + f for f in image_list]) + ";\n")
    parts.append("\n</script>\n</body>\n</html>\n")

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("".join(parts))

    katex = [
        "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
        "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
        "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js",
    ]
    sw = """// 오프라인용 service worker (build.py 생성 — 직접 편집 금지)
const VER = %s;
const CACHE = "wiki-" + VER;
const CORE = ["./", "./index.html", "./manifest.webmanifest"];
const KATEX = %s;
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(CORE).then(function () {
      // KaTeX(CDN) 는 실패해도 설치는 진행 (폰트는 CSS 가 참조하는 것을 fetch 시점에 캐시)
      return Promise.all(KATEX.map(function (u) { return c.add(new Request(u, { mode: "cors" })).catch(function () {}); }));
    });
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("wiki-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  var isPage = req.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/");
  if (isPage) {
    // 페이지: 네트워크 우선, 실패하면 캐시 (오프라인)
    e.respondWith(fetch(req).then(function (r) {
      var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put("./index.html", copy); }); return r;
    }).catch(function () { return caches.match("./index.html"); }));
    return;
  }
  // 이미지·KaTeX·폰트: 캐시 우선, 없으면 받아서 캐시
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (r) {
      if (r && (r.ok || r.type === "opaque")) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return r;
    });
  }));
});
self.addEventListener("message", function (e) {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
""" % (json.dumps(ver), json.dumps(katex))
    with open(os.path.join(ROOT, "sw.js"), "w", encoding="utf-8") as f:
        f.write(sw)
    manifest = {
        "name": "컴네위키", "short_name": "컴네위키", "start_url": "./index.html", "scope": "./",
        "display": "standalone", "background_color": "#f5f5f5", "theme_color": "#1c2840", "lang": "ko",
        "icons": [{"src": "icon.svg", "sizes": "any", "type": "image/svg+xml"}],
    }
    with open(os.path.join(ROOT, "manifest.webmanifest"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    icon_path = os.path.join(ROOT, "icon.svg")
    if not os.path.exists(icon_path):
        with open(icon_path, "w", encoding="utf-8") as f:
            f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#1c2840"/><text x="32" y="41" font-size="26" font-weight="700" text-anchor="middle" fill="#ffd75e" font-family="sans-serif">컴네</text></svg>')

    # ---------- 6. 보고 ----------
    if missing_imgs:
        print("\n=== MISSING IMAGES (%d) ===" % len(missing_imgs))
        for fname, refs in missing_imgs:
            print("  %s  ← %s" % (fname, ", ".join(refs)))
        print("  (슬라이드 디렉터리: %s)" % slides_dir)

    if broken:
        print("\n=== BROKEN LINKS (%d) ===" % len(broken))
        for key in sorted(broken):
            print("  [[%s]]  ← %s" % (key, ", ".join(sorted(broken[key]))))

    if missing_sims:
        print("\n=== MISSING SIMS (%d) ===" % len(missing_sims))
        for key in sorted(missing_sims):
            print("  [[sim:%s]]  ← %s  (src/sims/%s.js 없음)"
                  % (key, ", ".join(sorted(missing_sims[key])), key))

    if missing_anims:
        print("\n=== MISSING ANIMS (%d) ===" % len(missing_anims))
        for key in sorted(missing_anims):
            print("  [[anim:%s]]  ← %s  (src/anims/%s.js 없음)"
                  % (key, ", ".join(sorted(missing_anims[key])), key))
    if unused_anims:
        print("\n=== UNUSED ANIMS (%d) === (정의됐지만 어떤 문서도 안 씀)" % len(unused_anims))
        for key in unused_anims:
            print("  %s" % key)

    size_kb = os.path.getsize(OUT) / 1024.0
    print("\n=== BUILD OK ===")
    print("  articles      : %d  (nav groups %d)" % (len(articles), len(nav)))
    print("  images copied : %d  (missing %d)" % (copied, len(missing_imgs)))
    print("  sims          : %d  (missing %d)" % (len(defined_sims), len(missing_sims)))
    print("  anims         : %d  (missing %d, unused %d)" % (len(defined_anims), len(missing_anims), len(unused_anims)))
    print("  broken links  : %d" % len(broken))
    print("  output        : %s  (%.0f KB)" % (os.path.relpath(OUT, ROOT), size_kb))
    print("  offline       : sw.js + manifest.webmanifest (ver %s, images %d)" % (ver, len(image_list)))
    sys.exit(0)


if __name__ == "__main__":
    main()
