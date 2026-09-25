// ============================================================
// node_to_node — L6 p.58 Link-Layer Addressing: Alice → R1 → R2 → Bob
// 시간축(초): 0 Alice 프레임 준비 → 1.5 링크1 [L₂|L₁] → 4 R1 decap/encap → 5.5 링크2 [L₅|L₄]
//   → 8 R2 decap/encap → 9.5 링크3 [L₈|L₇] → 12 Bob 도착, 결과 유지 → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["node_to_node"] = {
  title: "Link-layer addressing — 프레임이 hop 마다 주소를 갈아끼우는 14초",
  desc: "Alice → R1 → R2 → Bob. [[IP 주소와 MAC 주소|IP 주소]](N₁, N₈)는 끝까지 그대로, [[MAC 주소|link-layer 주소]](L)는 [[node와 link|link]]를 건널 때마다 destination–source 로 새로 붙는다 ([[라우터]]에서 decapsulate → encapsulate)",
  duration: 14,
  build: function () {
    var D = 14;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", b: "#2e9e4f", bL: "#dff3e4",
      c: "#e09a40", cL: "#fdeec2", dev: "#3b2f4a", devL: "#efe9f6",
      red: "#d6465f", muted: "#777", line: "#9aa5b8"
    };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function box(x, y, w, h, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.6"' + (extra || "") + '/>';
    }
    // 아래첨자 숫자(₀–₉)는 글꼴마다 모양이 달라서 tspan 아래첨자로 바꿔 그린다
    function sub(t) {
      return t.replace(/[\u2080-\u2089]/g, function (d) { return '<tspan baseline-shift="sub" font-size="75%">' + (d.charCodeAt(0) - 0x2080) + '</tspan>'; });
    }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + sub(s) + '</text>';
    }
    // from~to 초에만 보이기 (0.12초 페이드, 앞뒤 자막이 겹치지 않게 to 직전에 사라짐. to >= D 이면 끝까지 유지)
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    // 키프레임 [[초, 값], …] → 0~D 전체에 걸친 animate / animateTransform(translate)
    function kv(attr, kf) {
      var v = [], k = [];
      if (kf[0][0] > 0) { v.push(kf[0][1]); k.push(0); }
      kf.forEach(function (p) { v.push(p[1]); k.push(r4(p[0] / D)); });
      if (kf[kf.length - 1][0] < D) { v.push(kf[kf.length - 1][1]); k.push(1); }
      if (attr === "translate") return '<animateTransform attributeName="transform" type="translate" values="' + v.join(";") + '" keyTimes="' + k.join(";") + '" dur="' + D + 's" fill="freeze"/>';
      return '<animate attributeName="' + attr + '" values="' + v.join(";") + '" keyTimes="' + k.join(";") + '" dur="' + D + 's" fill="freeze"/>';
    }

    var s = '<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Link-layer addressing 애니메이션">';
    s += '<defs><marker id="n2n_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "Alice(N₁, L₁)가 Bob(N₈, L₈)에게 보낼 datagram 을 frame 에 담는다"],
      [1.5, 4, "링크 1: frame 헤더 = [L₂ | L₁] (destination = R1, source = Alice)"],
      [4, 5.5, "R1: decapsulate(L₂|L₁ 떼기) → 라우팅 → encapsulate(L₅|L₄ 새로 붙이기)"],
      [5.5, 8, "링크 2: frame 헤더 = [L₅ | L₄] (destination = R2, source = R1)"],
      [8, 9.5, "R2: decapsulate(L₅|L₄ 떼기) → 라우팅 → encapsulate(L₈|L₇ 새로 붙이기)"],
      [9.5, 12, "링크 3: frame 헤더 = [L₈ | L₇] (destination = Bob, source = R2)"],
      [12, 14, "Bob 도착: IP 주소 [N₁ | N₈] 은 한 번도 안 바뀌고, link-layer 주소만 hop 마다 교체"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 노드와 링크 ----
    var Y = 215;
    var X = { alice: 60, r1: 280, r2: 500, bob: 700 };
    s += '<line x1="' + X.alice + '" y1="' + Y + '" x2="' + X.bob + '" y2="' + Y + '" stroke="' + C.line + '" stroke-width="3"/>';
    s += txt(170, Y - 8, "link 1", 11, C.muted) + txt(390, Y - 8, "link 2", 11, C.muted) + txt(600, Y - 8, "link 3", 11, C.muted);
    // 호스트
    s += box(X.alice - 26, Y - 16, 52, 32, C.aL, C.a) + txt(X.alice, Y + 5, "Alice", 13, C.a, ' font-weight="700"');
    s += box(X.bob - 26, Y - 16, 52, 32, C.bL, C.b) + txt(X.bob, Y + 5, "Bob", 13, C.b, ' font-weight="700"');
    // 라우터
    [["r1", "R1"], ["r2", "R2"]].forEach(function (r) {
      s += '<circle cx="' + X[r[0]] + '" cy="' + Y + '" r="20" fill="' + C.devL + '" stroke="' + C.dev + '" stroke-width="2"/>';
      s += txt(X[r[0]], Y + 5, r[1], 13, C.dev, ' font-weight="700"');
    });
    // 주소 라벨 (N 은 IP, L 은 link-layer)
    function addr(x, n, l, anchor) {
      return '<text x="' + x + '" y="' + (Y + 40) + '" font-size="13" text-anchor="' + anchor + '"><tspan fill="' + C.red + '" font-weight="700">' + sub(n) + '</tspan><tspan fill="#333"> ' + sub(l) + '</tspan></text>';
    }
    s += addr(X.alice, "N₁", "L₁", "middle");
    s += addr(X.r1 - 8, "N₂", "L₂", "end") + addr(X.r1 + 8, "N₄", "L₄", "start");
    s += addr(X.r2 - 8, "N₅", "L₅", "end") + addr(X.r2 + 8, "N₇", "L₇", "start");
    s += addr(X.bob, "N₈", "L₈", "middle");

    // ---- 링크별 frame 그림 (위) ----
    function frame(cx, dst, src, from, hl) {
      var x0 = cx - 85, y0 = 70, g = "";
      var cells = [
        [32, dst, C.devL, C.dev, "dest"], [32, src, C.devL, C.dev, "src"],
        [32, "N₁", C.aL, C.a, "src"], [32, "N₈", C.aL, C.a, "dest"], [42, "Data", C.cL, C.c, ""]
      ];
      var x = x0;
      cells.forEach(function (c, i) {
        g += '<rect x="' + x + '" y="' + y0 + '" width="' + c[0] + '" height="28" fill="' + c[2] + '" stroke="' + c[3] + '" stroke-width="1.5"/>';
        g += txt(x + c[0] / 2, y0 + 19, c[1], 13, (i >= 2 && i <= 3) ? C.red : "#222", ' font-weight="700"');
        if (c[4]) g += txt(x + c[0] / 2, y0 + 42, c[4], 11, C.muted);
        x += c[0];
      });
      g += txt(x0 + 32, y0 - 8, "link-layer", 11, C.dev) + txt(x0 + 96, y0 - 8, "IP (network)", 11, C.a);
      // 새로 붙은 L 칸 강조 테두리
      if (hl) g += '<rect x="' + x0 + '" y="' + (y0 - 2) + '" width="64" height="32" fill="none" stroke="' + C.red + '" stroke-width="2.5" rx="3">' +
        '<animate attributeName="stroke-opacity" values="1;1;0;0" keyTimes="0;' + r4((from + 1.5) / D) + ';' + r4((from + 2) / D) + ';1" dur="' + D + 's" fill="freeze"/></rect>';
      return vis(from, D, g);
    }
    s += frame(170, "L₂", "L₁", 1.5, true);
    s += frame(390, "L₅", "L₄", 5.5, true);
    s += frame(600, "L₈", "L₇", 9.5, true);
    // frame 그림과 링크를 잇는 점선
    [[170, 1.5], [390, 5.5], [600, 9.5]].forEach(function (p) {
      s += vis(p[1], D, '<line x1="' + p[0] + '" y1="126" x2="' + p[0] + '" y2="' + (Y - 20) + '" stroke="#bbb" stroke-dasharray="3 3"/>');
    });

    // ---- 라우터에서 decapsulate → encapsulate ----
    [[X.r1, 4, "L₂|L₁", "L₅|L₄"], [X.r2, 8, "L₅|L₄", "L₈|L₇"]].forEach(function (r) {
      var g = box(r[0] - 80, 132, 160, 38, "#fff", C.red, ' stroke-dasharray="4 3"');
      g += txt(r[0], 147, "decapsulate: " + r[2] + " 떼기", 11, C.red, ' font-weight="700"');
      g += txt(r[0], 163, "encapsulate: " + r[3] + " 붙이기", 11, C.b, ' font-weight="700"');
      s += vis(r[1], r[1] + 1.5, g);
    });

    // ---- 움직이는 frame 조각 ----
    var pk = '<g>' + box(-22, -11, 44, 22, C.cL, C.c) + txt(0, 5, "frame", 11, "#6b4a12", ' font-weight="700"');
    pk += kv("translate", [
      [0, X.alice + "," + (Y - 30)], [1.5, X.alice + "," + (Y - 30)], [4, X.r1 + "," + (Y - 30)],
      [5.5, X.r1 + "," + (Y - 30)], [8, X.r2 + "," + (Y - 30)], [9.5, X.r2 + "," + (Y - 30)], [12, X.bob + "," + (Y - 30)]
    ]);
    pk += '</g>';
    s += pk;

    // ---- 범례 + 주소 순서 ----
    s += txt(380, 290, "N: IP address (빨강)   ·   L: link-layer address", 12, C.muted);
    s += vis(12, D, txt(380, 308, "IP: N₁ → N₈ 그대로   ·   L: [L₂|L₁] → [L₅|L₄] → [L₈|L₇]", 12, C.red, ' font-weight="700"'));

    // ---- 요점 ----
    s += txt(380, 332, "Order of addresses — IP 주소: source–destination (end-to-end 불변) · link-layer 주소: destination–source (hop 마다 교체)", 12, "#333");
    s += '</svg>';
    return s;
  }
};
