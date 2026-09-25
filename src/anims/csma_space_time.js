// ============================================================
// csma_space_time — L6 p.32–33 Space-time model of a collision in CSMA
// 가로 = space (A 90, B 250, C 540, D 680), 세로 = time (아래로). 신호 속도: 가로 4px 당 세로 1px.
// 시간축(초): 화면 "지금" 선 y = 90 + (t−1)·25.56 → 1.4 B 전송(t₁) → 2.6 C 전송(t₂)
//   → 3.4 두 신호가 만남(collision) → 4.2 B 신호가 C 에 도착 → 6 vulnerable time = T_p → 13
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["csma_space_time"] = {
  title: "CSMA space-time model — 듣고 보내도 충돌하는 13초",
  desc: "[[space-time model]]: B 가 t₁ 에 보낸 신호가 C 에 닿기 전([[propagation time]])이라 C 는 채널을 idle 로 보고 t₂ 에 전송 → 두 신호가 겹쳐 [[collision]]. 그래서 [[CSMA]] 의 [[vulnerable time]] = [[T_p]]",
  duration: 13,
  build: function () {
    var D = 13;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", b: "#2e9e4f", bL: "#dff3e4", bM: "#9fd8ad",
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

    var XA = 90, XB = 250, XC = 540, XD = 680, V = 4, TF = 100;
    var Y1 = 100, Y2 = 130, YTOP = 90, YBOT = 320;
    function tOf(y) { return r4(1 + (y - YTOP) / 25.56); }
    // 한 스테이션이 y0 에 시작해 TF 동안 보낸 신호가 차지하는 space-time 영역
    function band(x0, y0) {
      var f = [[XA, y0 + (x0 - XA) / V], [x0, y0], [XD, y0 + (XD - x0) / V]];
      var pts = f.map(function (p) { return p[0] + "," + r4(p[1]); });
      for (var i = f.length - 1; i >= 0; i--) pts.push(f[i][0] + "," + r4(f[i][1] + TF));
      return pts.join(" ");
    }
    var PB = band(XB, Y1), PC = band(XC, Y2);
    var yMeet = r4(Y1 + ((XC - XB) / V + (Y2 - Y1)) / 2);            // 두 앞머리가 만나는 y
    var xMeet = r4(XB + (yMeet - Y1) * V);
    var yArrC = r4(Y1 + (XC - XB) / V);                               // B 신호가 C 에 도착

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CSMA space-time 애니메이션">';
    s += '<defs>' +
      '<clipPath id="cst_now"><rect x="' + XA + '" y="' + YTOP + '" width="' + (XD - XA) + '" height="0">' +
      '<animate attributeName="height" values="0;0;' + (YBOT - YTOP) + ';' + (YBOT - YTOP) + '" keyTimes="0;' + r4(1 / D) + ';' + r4(10 / D) + ';1" dur="' + D + 's" fill="freeze"/></rect></clipPath>' +
      '<clipPath id="cst_bArea"><polygon points="' + PB + '"/></clipPath>' +
      '<marker id="cst_time" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker>' +
      '</defs>';

    // ---- 단계 자막 ----
    var tB = tOf(Y1), tC = tOf(Y2), tM = tOf(yMeet), tA = tOf(yArrC);
    var caps = [
      [0, tB, "CSMA: 보내기 전에 채널을 듣는다(carrier sense) — 그래도 충돌은 일어난다"],
      [tB, tC, sb("t", "1") + ": B 가 채널이 idle 이라 전송 시작 → B 의 신호가 양쪽으로 퍼져 나간다"],
      [tC, tM, sb("t", "2") + ": C 에는 아직 B 의 신호가 안 왔다 → C 도 idle 로 보고 전송 시작"],
      [tM, 6, "두 신호가 만나는 곳부터 collision — 겹친 영역에서는 두 신호가 섞여 모두 손상"],
      [6, D, "B 의 첫 비트가 퍼지는 동안(propagation)은 들어도 모른다 → vulnerable time = " + sb("T", "p")]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 스테이션과 매체 ----
    s += '<line x1="' + XA + '" y1="74" x2="' + XD + '" y2="74" stroke="#555" stroke-width="2"/>';
    [[XA, "A"], [XB, "B"], [XC, "C"], [XD, "D"]].forEach(function (p) {
      var col = p[1] === "B" ? C.b : (p[1] === "C" ? C.c : C.muted);
      s += '<rect x="' + (p[0] - 11) + '" y="62" width="22" height="16" rx="3" fill="#fff" stroke="' + col + '" stroke-width="2"/>';
      s += txt(p[0], 56, p[1], 14, col, ' font-weight="700"');
      s += '<line x1="' + p[0] + '" y1="80" x2="' + p[0] + '" y2="' + (YBOT + 8) + '" stroke="#bbb" stroke-dasharray="3 3"/>';
    });
    s += '<line x1="' + XA + '" y1="' + (YBOT - 10) + '" x2="' + XA + '" y2="' + (YBOT + 12) + '" stroke="#555" stroke-width="1.5" marker-end="url(#cst_time)"/>';
    s += '<line x1="' + XD + '" y1="' + (YBOT - 10) + '" x2="' + XD + '" y2="' + (YBOT + 12) + '" stroke="#555" stroke-width="1.5" marker-end="url(#cst_time)"/>';
    s += txt(XA - 30, YBOT + 10, "Time", 12, "#555") + txt(XD + 32, YBOT + 10, "Time", 12, "#555");

    // ---- 신호 영역 (지금 선까지만 보임) ----
    s += '<g clip-path="url(#cst_now)">';
    s += '<polygon points="' + PB + '" fill="' + C.bM + '" fill-opacity="0.85"/>';
    s += '<polygon points="' + PC + '" fill="' + C.cM + '" fill-opacity="0.85"/>';
    s += '<polygon points="' + PC + '" fill="' + C.red + '" fill-opacity="0.75" clip-path="url(#cst_bArea)"/>';
    s += '</g>';

    // ---- 지금 시각 선 ----
    s += '<g><line x1="' + (XA - 20) + '" y1="0" x2="' + (XD + 20) + '" y2="0" stroke="#333" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<animateTransform attributeName="transform" type="translate" values="0,' + YTOP + ';0,' + YTOP + ';0,' + YBOT + ';0,' + YBOT + '" keyTimes="0;' + r4(1 / D) + ';' + r4(10 / D) + ';1" dur="' + D + 's" fill="freeze"/>' +
      '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;' + r4(10 / D) + ';' + r4(10.2 / D) + ';1" dur="' + D + 's" fill="freeze"/></g>';

    // ---- 시각 표시 t₁, t₂ ----
    s += vis(tB, D, '<circle cx="' + XB + '" cy="' + Y1 + '" r="4" fill="' + C.b + '"/>' +
      '<text x="' + (XB - 8) + '" y="' + (Y1 + 4) + '" font-size="13" fill="' + C.b + '" font-weight="700" text-anchor="end">' + sb("t", "1") + '</text>' +
      txt(XB, 44, "B starts at " + sb("t", "1"), 12, C.red, ' font-weight="700"'));
    s += vis(tC, D, '<circle cx="' + XC + '" cy="' + Y2 + '" r="4" fill="' + C.c + '"/>' +
      '<text x="' + (XC + 8) + '" y="' + (Y2 + 4) + '" font-size="13" fill="' + C.c + '" font-weight="700">' + sb("t", "2") + '</text>' +
      txt(XC, 44, "C starts at " + sb("t", "2"), 12, C.red, ' font-weight="700"'));

    // ---- 영역 이름 ----
    s += vis(2.2, D, txt(150, 188, "B 의 신호", 12, "#1d5e2e", ' font-weight="700"'));
    s += vis(3.6, D, txt(648, 180, "C 의 신호", 12, "#8a5a14", ' font-weight="700"'));
    s += vis(6, D, txt(400, 208, "collision (두 신호 겹침)", 12, "#fff", ' font-weight="700"'));
    s += vis(tM, D, '<circle cx="' + xMeet + '" cy="' + yMeet + '" r="6" fill="none" stroke="' + C.red + '" stroke-width="2.5"/>');

    // ---- C 가 못 듣는 구간 (t₁ ~ B 신호 도착) ----
    s += vis(tA, D, '<circle cx="' + XC + '" cy="' + yArrC + '" r="4" fill="' + C.b + '"/>' +
      '<text x="' + (XC + 8) + '" y="' + (yArrC + 4) + '" font-size="11" fill="#1d5e2e" font-weight="700">B 신호 도착</text>');
    s += vis(6, D, '<path d="M' + (XC - 14) + ',' + Y1 + ' h-6 V' + yArrC + ' h6" fill="none" stroke="' + C.red + '" stroke-width="2"/>' +
      '<text x="' + (XC - 30) + '" y="' + (Y1 + 16) + '" font-size="11" fill="' + C.red + '" font-weight="700" text-anchor="end">이 동안 C 는 B 를</text>' +
      '<text x="' + (XC - 30) + '" y="' + (Y1 + 30) + '" font-size="11" fill="' + C.red + '" font-weight="700" text-anchor="end">못 듣는다 (≤ ' + sb("T", "p") + ')</text>');

    // ---- 요점 ----
    s += txt(380, 352, "CSMA 의 vulnerable time = " + sb("T", "p") + " (propagation time): 첫 비트가 매체 끝까지 퍼지기 전에는 '들어도' 모른다", 12, "#333");
    s += '</svg>';
    return s;
  }
};
