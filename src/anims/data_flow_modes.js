// ============================================================
// data_flow_modes — simplex / half-duplex / full-duplex 세 줄 비교
// CONTRACT §7. 슬라이드 L1 p.5–7.
// 시간축(초): 0 초기 → 1.5 전송 시작 (simplex →, half-duplex time 1 →, full-duplex ⇄)
//   → 5.5 half-duplex 방향 전환 (time 2 ←) → 9.5~11 결과 유지
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["data_flow_modes"] = {
  title: "데이터 흐름 3가지 — 한쪽만 / 교대로 / 동시에",
  desc: "[[simplex]] 는 한 방향만, [[half-duplex]] 는 양방향이지만 한 번에 한 방향(무전기), [[full-duplex]] 는 양방향 동시",
  duration: 11,
  build: function () {
    var D = 11;
    var C = { a: "#1d65b3", aL: "#dbe8f7", b: "#2e9e4f", bL: "#dff3e4", hot: "#d6465f", muted: "#777", line: "#9aa6ba" };
    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '" text-anchor="middle"' + (extra || "") + '>' + esc(s) + '</text>';
    }
    function show(a, b) {
      var k = [0], v = [a <= 0 ? 1 : 0];
      if (a > 0) { k.push(a / D, Math.min(1, (a + 0.1) / D)); v.push(0, 1); }
      if (b < D) { k.push(b / D, Math.min(1, (b + 0.1) / D)); v.push(1, 0); }
      if (k[k.length - 1] < 1) { k.push(1); v.push(v[v.length - 1]); }
      return '<animate attributeName="opacity" values="' + v.join(";") + '" keyTimes="' + k.map(function (x) { return +x.toFixed(4); }).join(";") + '" dur="' + D + 's" fill="freeze"/>';
    }
    function during(a, b, inner) { return '<g opacity="' + (a <= 0 ? 1 : 0) + '">' + inner + show(a, b) + '</g>'; }
    function dev(x, y, name, c, cL) {
      return '<rect x="' + (x - 55) + '" y="' + (y - 20) + '" width="110" height="40" rx="8" fill="' + cL + '" stroke="' + c + '" stroke-width="2"/>' + txt(x, y + 5, name, 13, c, ' font-weight="700"');
    }
    // 링크 위를 흐르는 패킷 줄: a~b 동안, 방향 dir(+1: A→B, -1: B→A), 레인 y
    var X1 = 290, X2 = 590;
    function stream(a, b, dir, y, color) {
      var o = "", per = 1.2, n = 3;
      for (var j = 0; j < n; j++) {
        var st = a + j * per / n;
        var reps = Math.floor((b - st) / per);
        if (reps < 1) continue;
        var p = dir > 0 ? 'M' + (X1 + 8) + ',' + y + ' L' + (X2 - 8) + ',' + y : 'M' + (X2 - 8) + ',' + y + ' L' + (X1 + 8) + ',' + y;
        o += '<g opacity="0"><rect x="-9" y="-6" width="18" height="12" rx="3" fill="' + color + '"/>' +
          '<animateMotion begin="' + st.toFixed(2) + 's" dur="' + per + 's" repeatCount="' + reps + '" path="' + p + '"/>' +
          show(st, st + reps * per) + '</g>';
      }
      return o;
    }
    function arrowLine(y, dir, color, dash) {
      var x1 = dir > 0 ? X1 : X2, x2 = dir > 0 ? X2 : X1;
      return '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="' + color + '" stroke-width="2"' + (dash ? ' stroke-dasharray="5 4"' : '') + ' marker-end="url(#df_arr_' + (color === C.a ? 'a' : color === C.b ? 'b' : 'g') + ')"/>';
    }

    var s = '<svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="데이터 흐름 방식 애니메이션">';
    s += '<defs>';
    [["a", C.a], ["b", C.b], ["g", "#bbb"]].forEach(function (m) {
      s += '<marker id="df_arr_' + m[0] + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + m[1] + '"/></marker>';
    });
    s += '</defs>';

    var rows = [
      { y: 90, name: "Simplex", sub: "단방향", ex: "메인프레임 → 모니터", A: "Mainframe", B: "Monitor" },
      { y: 175, name: "Half-duplex", sub: "반이중", ex: "무전기 (walkie-talkie)", A: "Station A", B: "Station B" },
      { y: 260, name: "Full-duplex", sub: "전이중", ex: "전화 (동시에 말하고 듣기)", A: "Station A", B: "Station B" }
    ];
    rows.forEach(function (r) {
      s += '<text x="18" y="' + (r.y - 2) + '" font-size="15" fill="#222" font-weight="700">' + r.name + '</text>';
      s += '<text x="18" y="' + (r.y + 16) + '" font-size="12" fill="' + C.muted + '">' + r.sub + '</text>';
      s += dev(230, r.y, r.A, C.a, C.aL) + dev(650, r.y, r.B, C.b, C.bL);
      s += txt(440, r.y + 36, r.ex, 11, C.muted);
    });
    // 행 구분선
    s += '<line x1="15" y1="132" x2="745" y2="132" stroke="#e3e3e3"/><line x1="15" y1="217" x2="745" y2="217" stroke="#e3e3e3"/>';

    // ---- Simplex: A→B 만 ----
    s += arrowLine(90, 1, C.a);
    s += stream(1.5, 9.5, 1, 90, C.a);
    s += during(3, D, txt(440, 72, "B→A 는 불가 ✗", 12, C.hot, ' font-weight="700"'));

    // ---- Half-duplex: time 1 →, time 2 ← ----
    s += during(0, 5.5, arrowLine(175, 1, C.a));
    s += during(5.5, D, arrowLine(175, -1, C.b));
    s += stream(1.5, 5.3, 1, 175, C.a);
    s += stream(5.7, 9.5, -1, 175, C.b);
    s += during(1.5, 5.5, txt(440, 160, "time 1: A→B (B 는 듣기만)", 12, C.a, ' font-weight="700"'));
    s += during(5.5, D, txt(440, 160, "time 2: B→A (A 는 듣기만)", 12, C.b, ' font-weight="700"'));

    // ---- Full-duplex: 두 레인 동시 ----
    s += arrowLine(252, 1, C.a) + arrowLine(268, -1, C.b);
    s += stream(1.5, 9.5, 1, 252, C.a);
    s += stream(1.5, 9.5, -1, 268, C.b);
    s += during(3, D, txt(440, 240, "양방향 동시 — 링크 용량을 둘이 나눠 씀", 12, "#3b2f4a", ' font-weight="700"'));

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "데이터 흐름(data flow) 3가지: simplex / half-duplex / full-duplex"],
      [1.5, 5.5, "simplex 는 한쪽만 보내고, half-duplex 는 지금 A→B 한 방향만 (time 1)"],
      [5.5, 9.5, "half-duplex 가 방향을 바꿔 B→A (time 2) — 양방향이지만 동시에는 불가"],
      [9.5, D, "full-duplex 만 처음부터 끝까지 양방향이 동시에 흐른다"]
    ];
    caps.forEach(function (c) { s += during(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    s += txt(380, 318, "simplex = 한 방향만 · half-duplex = 양방향이지만 교대로 · full-duplex = 양방향 동시에", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
