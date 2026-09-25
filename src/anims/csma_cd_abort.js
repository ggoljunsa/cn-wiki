// ============================================================
// csma_cd_abort — L6 p.42–45 Collision and abortion in CSMA/CD
// 가로 = space (A 110, B 280, C 560, D 680), 세로 = time. 신호 속도: 가로 6px 당 세로 1px.
// t₁ = y96 A 전송 시작, t₂ = y136 C 전송 시작, y153.5 충돌, t₃ = y171 C 감지·abort, t₄ = y211 A 감지·abort
// 시간축(초): "지금" 선 y = 86 + (t−1)·21.4 → 1.5 t₁ → 3.3 t₂ → 4.2 충돌 → 5.0 t₃ → 6.8 t₄ → 9.5 2T_p 요약 → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["csma_cd_abort"] = {
  title: "CSMA/CD — 충돌을 감지하고 중단하는 14초",
  desc: "[[CSMA/CD]]: 보내는 중에도 채널을 monitor 하다가 충돌을 감지하면 즉시 abort + [[jamming signal]] → backoff. 가장 늦게 알아채는 건 왕복 2T_p 뒤이므로 T_fr ≥ 2T_p 여야 한다 ([[최소 프레임 크기]])",
  duration: 14,
  build: function () {
    var D = 14;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", aM: "#9cc3ea", b: "#2e9e4f", bL: "#dff3e4",
      c: "#e09a40", cL: "#fdeec2", cM: "#f5c98a", dev: "#3b2f4a", devL: "#efe9f6",
      red: "#d6465f", muted: "#777"
    };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    // from~to 초에만 보이기 (0.12초 페이드, 앞뒤 자막이 겹치지 않게 to 직전에 사라짐. to >= D 이면 끝까지 유지)
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    function sb(base, sub) { return base + '<tspan baseline-shift="sub" font-size="75%">' + sub + '</tspan>'; }

    var XA = 110, XB = 280, XC = 560, XD = 680, V = 6;
    var YTOP = 86, YBOT = 300;
    var T1 = 96, T2 = 136;
    var T3 = T1 + (XC - XA) / V;          // A 의 신호가 C 에 도착 → C 감지
    var T4 = T2 + (XC - XA) / V;          // C 의 신호가 A 에 도착 → A 감지
    var yMeet = r4((T1 + T2 + (XC - XA) / V) / 2), xMeet = r4(XA + (yMeet - T1) * V);
    function tOf(y) { return r4(1 + (y - YTOP) / 21.4); }
    // x0 에서 y0~y1 동안 보낸 신호가 퍼지는 space-time 영역
    function band(x0, y0, y1) {
      var f = [[XA, y0 + (x0 - XA) / V], [x0, y0], [XD, y0 + (XD - x0) / V]];
      if (x0 === XA) f = [[XA, y0], [XD, y0 + (XD - XA) / V]];
      var pts = f.map(function (p) { return p[0] + "," + r4(p[1]); });
      for (var i = f.length - 1; i >= 0; i--) pts.push(f[i][0] + "," + r4(f[i][1] + (y1 - y0)));
      return pts.join(" ");
    }
    var PA = band(XA, T1, T4), PC = band(XC, T2, T3);
    var JA = band(XA, T4, T4 + 4), JC = band(XC, T3, T3 + 4);   // jamming signal

    var s = '<svg viewBox="0 0 760 374" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CSMA/CD 충돌 감지 애니메이션">';
    s += '<defs>' +
      '<clipPath id="ccd_now"><rect x="' + XA + '" y="' + YTOP + '" width="' + (XD - XA) + '" height="0">' +
      '<animate attributeName="height" values="0;0;' + (YBOT - YTOP) + ';' + (YBOT - YTOP) + '" keyTimes="0;' + r4(1 / D) + ';' + r4(11 / D) + ';1" dur="' + D + 's" fill="freeze"/></rect></clipPath>' +
      '<clipPath id="ccd_aArea"><polygon points="' + PA + '"/></clipPath>' +
      '<marker id="ccd_time" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker>' +
      '<marker id="ccd_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.red + '"/></marker>' +
      '</defs>';

    // ---- 단계 자막 ----
    var t1 = tOf(T1), t2 = tOf(T2), tM = tOf(yMeet), t3 = tOf(T3), t4 = tOf(T4);
    var caps = [
      [0, t1, "CSMA/CD: 전송하는 동안에도 계속 채널을 monitor 한다"],
      [t1, t2, sb("t", "1") + ": A 가 채널 idle 확인 후 전송 시작 — 신호가 오른쪽 끝으로 전파"],
      [t2, t3, sb("t", "2") + ": C 는 아직 A 의 신호를 못 들어 idle 로 판단하고 전송 → collision occurs"],
      [t3, t4, sb("t", "3") + ": A 의 신호가 도착 → C 가 먼저 충돌 감지 → 즉시 abort + jamming signal"],
      [t4, 9.5, sb("t", "4") + ": 되돌아온 C 의 신호로 A 도 충돌 감지 → abort + jamming signal → 둘 다 backoff"],
      [9.5, D, "A 가 충돌을 알려면 최악 2" + sb("T", "p") + "(왕복) — 그때까지 아직 보내는 중이어야 하므로 " + sb("T", "fr") + " ≥ 2" + sb("T", "p")]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 스테이션과 매체 ----
    s += '<line x1="' + XA + '" y1="70" x2="' + XD + '" y2="70" stroke="#555" stroke-width="2"/>';
    [[XA, "A"], [XB, "B"], [XC, "C"], [XD, "D"]].forEach(function (p) {
      var col = p[1] === "A" ? C.a : (p[1] === "C" ? C.c : C.muted);
      s += '<rect x="' + (p[0] - 11) + '" y="58" width="22" height="16" rx="3" fill="#fff" stroke="' + col + '" stroke-width="2"/>';
      s += txt(p[0], 52, p[1], 14, col, ' font-weight="700"');
      s += '<line x1="' + p[0] + '" y1="76" x2="' + p[0] + '" y2="' + (YBOT + 4) + '" stroke="#bbb" stroke-dasharray="3 3"/>';
    });

    // ---- 신호 영역 (지금 선까지만 보임) ----
    s += '<g clip-path="url(#ccd_now)">';
    s += '<polygon points="' + PA + '" fill="' + C.aM + '" fill-opacity="0.85"/>';
    s += '<polygon points="' + PC + '" fill="' + C.cM + '" fill-opacity="0.9"/>';
    s += '<polygon points="' + PC + '" fill="' + C.red + '" fill-opacity="0.55" clip-path="url(#ccd_aArea)"/>';
    s += '<polygon points="' + JC + '" fill="#8e1b30"/>';
    s += '<polygon points="' + JA + '" fill="#8e1b30"/>';
    s += '</g>';
    s += vis(3, D, '<text x="250" y="' + (T1 + 40) + '" font-size="12" fill="#123f70" font-weight="700" transform="rotate(9.5 250 ' + (T1 + 40) + ')">Part of A\'s frame</text>');
    s += vis(4.4, D, '<text x="600" y="' + (T2 + 24) + '" font-size="11" fill="#7a4d0e" font-weight="700">C\'s frame</text>');

    // ---- 지금 시각 선 ----
    s += '<g><line x1="' + (XA - 14) + '" y1="0" x2="' + (XD + 14) + '" y2="0" stroke="#333" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<animateTransform attributeName="transform" type="translate" values="0,' + YTOP + ';0,' + YTOP + ';0,' + YBOT + ';0,' + YBOT + '" keyTimes="0;' + r4(1 / D) + ';' + r4(11 / D) + ';1" dur="' + D + 's" fill="freeze"/>' +
      '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;' + r4(11 / D) + ';' + r4(11.2 / D) + ';1" dur="' + D + 's" fill="freeze"/></g>';

    // ---- 시각 라벨 t₁ t₂ ----
    s += vis(t1, D, '<text x="' + (XA - 8) + '" y="' + (T1 + 4) + '" font-size="13" fill="' + C.a + '" font-weight="700" text-anchor="end">' + sb("t", "1") + '</text>');
    s += vis(t2, D, '<text x="' + (XC + 8) + '" y="' + (T2 + 2) + '" font-size="13" fill="' + C.c + '" font-weight="700">' + sb("t", "2") + '</text>');
    // 충돌 지점
    s += vis(tM, D, '<circle cx="' + xMeet + '" cy="' + yMeet + '" r="7" fill="' + C.red + '" stroke="#fff" stroke-width="1.5"/>' +
      txt(xMeet, yMeet - 14, "Collision occurs", 12, C.red, ' font-weight="700"'));
    // C 감지 (t₃)
    s += vis(t3, D, '<rect x="' + (XC - 7) + '" y="' + (T3 - 7) + '" width="14" height="14" fill="' + C.red + '" stroke="#fff" stroke-width="1.5"/>' +
      '<text x="' + (XC + 10) + '" y="' + (T3 + 4) + '" font-size="13" fill="' + C.red + '" font-weight="700">' + sb("t", "3") + '</text>' +
      '<text x="' + (XD + 12) + '" y="' + (T3 - 4) + '" font-size="11" fill="' + C.red + '" font-weight="700">C 감지</text>' +
      '<text x="' + (XD + 12) + '" y="' + (T3 + 10) + '" font-size="11" fill="' + C.red + '" font-weight="700">abort</text>' +
      '<text x="' + (XD + 12) + '" y="' + (T3 + 24) + '" font-size="11" fill="' + C.red + '" font-weight="700">+ jam</text>');
    // A 감지 (t₄)
    s += vis(t4, D, '<rect x="' + (XA - 7) + '" y="' + (T4 - 7) + '" width="14" height="14" fill="' + C.red + '" stroke="#fff" stroke-width="1.5"/>' +
      '<text x="' + (XA - 10) + '" y="' + (T4 + 4) + '" font-size="13" fill="' + C.red + '" font-weight="700" text-anchor="end">' + sb("t", "4") + '</text>' +
      '<text x="' + (XA - 10) + '" y="' + (T4 + 26) + '" font-size="11" fill="' + C.red + '" font-weight="700" text-anchor="end">A 감지</text>' +
      '<text x="' + (XA - 10) + '" y="' + (T4 + 40) + '" font-size="11" fill="' + C.red + '" font-weight="700" text-anchor="end">abort + jam</text>');
    // A 의 transmission time (t₁ ~ t₄)
    s += vis(t4, D, '<path d="M' + (XA - 30) + ',' + T1 + ' h-6 V' + T4 + ' h6" fill="none" stroke="' + C.a + '" stroke-width="1.5"/>' +
      '<text x="' + (XA - 42) + '" y="' + ((T1 + T4) / 2 - 2) + '" font-size="11" fill="' + C.a + '" text-anchor="end">A 의</text>' +
      '<text x="' + (XA - 42) + '" y="' + ((T1 + T4) / 2 + 12) + '" font-size="11" fill="' + C.a + '" text-anchor="end">전송</text>');

    // ---- 아래: 왕복 2T_p ----
    var rt = '<line x1="' + XA + '" y1="320" x2="' + XD + '" y2="320" stroke="' + C.red + '" stroke-width="2" marker-end="url(#ccd_arrow)"/>' +
      '<line x1="' + XD + '" y1="332" x2="' + XA + '" y2="332" stroke="' + C.red + '" stroke-width="2" marker-end="url(#ccd_arrow)"/>' +
      txt(395, 315, "① A 의 첫 비트가 매체 끝까지: " + sb("T", "p"), 11, C.red, ' font-weight="700"') +
      txt(395, 347, "② 끝에서 난 충돌 신호가 A 로 돌아옴: " + sb("T", "p") + "  → 왕복 2" + sb("T", "p"), 11, C.red, ' font-weight="700"');
    s += vis(9.5, D, rt);

    // ---- 요점 ----
    s += txt(380, 367, sb("T", "fr") + " ≥ 2" + sb("T", "p") + " 여야 마지막 비트를 보내기 전에 충돌을 감지할 수 있다 → Ethernet 최소 프레임 크기(64 bytes)의 이유", 12, "#333");
    s += '</svg>';
    return s;
  }
};
