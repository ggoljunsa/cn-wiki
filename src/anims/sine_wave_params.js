// ============================================================
// sine_wave_params — 사인파 3요소: peak amplitude ↑ → frequency ×2 → phase 0°→90°→180°
// CONTRACT §7. 슬라이드 L2 p.18–25.
// 시간축(초): 0 기본 파형 → 1~3 진폭 5V→8V → 4~6 주파수 2Hz→4Hz → 7~8 phase 90° → 8.5~9.5 180° → 12 끝
// 파형은 점 40개를 build() 안에서 계산해 Catmull-Rom 곡선으로 잇는다. 움직이는 파형은 하나의 path 에
// scale(가로 압축 = frequency, 세로 = amplitude)·translate(= phase) animateTransform 을 건다.
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["sine_wave_params"] = {
  title: "사인파의 3요소 — peak amplitude · frequency · phase 를 하나씩 바꿔 보기",
  desc: "[[사인파]]는 [[peak amplitude]](높이), [[주파수|frequency]](1초에 몇 주기), [[phase]](시간 0 에서의 위치) 세 값으로 완전히 정해진다",
  duration: 12,
  build: function () {
    var D = 12;
    var C = { sig: "#1d65b3", hot: "#d6465f", dev: "#3b2f4a", muted: "#777", grid: "#d9dee8" };
    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + esc(s) + '</text>';
    }
    function show(a, b) {
      var k = [0], v = [a <= 0 ? 1 : 0];
      if (a > 0) { k.push(a / D, Math.min(1, (a + 0.1) / D)); v.push(0, 1); }
      if (b < D) { k.push(b / D, Math.min(1, (b + 0.1) / D)); v.push(1, 0); }
      if (k[k.length - 1] < 1) { k.push(1); v.push(v[v.length - 1]); }
      return '<animate attributeName="opacity" values="' + v.join(";") + '" keyTimes="' + k.map(function (x) { return +x.toFixed(4); }).join(";") + '" dur="' + D + 's" fill="freeze"/>';
    }
    function during(a, b, inner) { return '<g opacity="' + (a <= 0 ? 1 : 0) + '">' + inner + show(a, b) + '</g>'; }

    var X0 = 70, W = 520, CY = 175;
    // 점 40개 → Catmull-Rom → cubic Bezier. (x0, x1) 구간, 원점 기준 좌표
    function wave(A, cyc, phDeg, x0, x1, ox, oy) {
      var N = 40, P = [];
      for (var i = 0; i < N; i++) {
        var x = x0 + (x1 - x0) * i / (N - 1);
        P.push([ox + x, oy - A * Math.sin(2 * Math.PI * cyc * x / W + phDeg * Math.PI / 180)]);
      }
      function r(v) { return Math.round(v * 10) / 10; }
      var d = "M" + r(P[0][0]) + " " + r(P[0][1]);
      for (i = 0; i < N - 1; i++) {
        var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(N - 1, i + 2)];
        d += "C" + r(p1[0] + (p2[0] - p0[0]) / 6) + " " + r(p1[1] + (p2[1] - p0[1]) / 6) + " " +
          r(p2[0] - (p3[0] - p1[0]) / 6) + " " + r(p2[1] - (p3[1] - p1[1]) / 6) + " " + r(p2[0]) + " " + r(p2[1]);
      }
      return d;
    }
    function kt(arr) { return arr.map(function (t) { return +(t / D).toFixed(4); }).join(";"); }

    var s = '<svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="사인파 3요소 애니메이션">';
    s += '<defs><marker id="sw_arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C.hot + '"/></marker></defs>';

    // 축
    s += '<line x1="' + X0 + '" y1="' + (CY - 105) + '" x2="' + X0 + '" y2="' + (CY + 105) + '" stroke="#555" stroke-width="1.5"/>';
    s += '<line x1="' + X0 + '" y1="' + CY + '" x2="' + (X0 + W + 20) + '" y2="' + CY + '" stroke="#555" stroke-width="1.5"/>';
    s += '<line x1="' + (X0 + W) + '" y1="' + (CY - 4) + '" x2="' + (X0 + W) + '" y2="' + (CY + 4) + '" stroke="#555"/>';
    s += txt(X0 + W, CY + 18, "1 s", 11, C.muted) + txt(X0 + W + 20, CY - 8, "time", 11, C.muted, ' text-anchor="end"');
    s += txt(X0 - 8, CY + 4, "0", 11, C.muted, ' text-anchor="end"') + txt(X0 - 6, CY - 95, "V", 11, C.muted, ' text-anchor="end"');
    // 기준 파형 (처음 모양, 흐리게)
    s += '<path d="' + wave(50, 2, 0, 0, W, X0, CY) + '" fill="none" stroke="#b9c4d8" stroke-width="1.5" stroke-dasharray="4 4"/>';
    // 움직이는 파형: 4Hz·진폭 80 파형 하나를 변환으로 조작한다
    //   scale(sx, sy): sx 2→1 = 파형을 가로로 압축(frequency 2배), sy 0.625→1 = 진폭 5V→8V
    //   translate: 왼쪽으로 W/16 (=90°), W/8 (=180°) 당김 = phase
    s += '<defs><clipPath id="sw_clip"><rect x="' + X0 + '" y="' + (CY - 110) + '" width="' + W + '" height="220"/></clipPath></defs>';
    s += '<g clip-path="url(#sw_clip)"><g transform="translate(' + X0 + ' ' + CY + ')"><g>' +
      '<animateTransform attributeName="transform" type="scale" values="2 0.625;2 0.625;2 1;2 1;1 1;1 1" keyTimes="' + kt([0, 1, 3, 4, 6, D]) + '" dur="' + D + 's" fill="freeze"/><g>' +
      '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;' + (-W / 16) + ' 0;' + (-W / 16) + ' 0;' + (-W / 8) + ' 0;' + (-W / 8) + ' 0" keyTimes="' + kt([0, 7, 8, 8.5, 9.5, D]) + '" dur="' + D + 's" fill="freeze"/>' +
      '<path d="' + wave(80, 4, 0, 0, W * 1.125, 0, 0) + '" fill="none" stroke="' + C.sig + '" stroke-width="3" vector-effect="non-scaling-stroke"/>' +
      '</g></g></g></g>';

    // ① peak amplitude 화살표 (첫 봉우리 x = X0 + W/8)
    var px = X0 + W / 8;
    s += '<g opacity="0"><line x1="' + px + '" y1="' + CY + '" x2="' + px + '" y2="' + (CY - 48) + '" stroke="' + C.hot + '" stroke-width="2.5" marker-end="url(#sw_arr)">' +
      '<animate attributeName="y2" values="' + (CY - 48) + ';' + (CY - 48) + ';' + (CY - 78) + ';' + (CY - 78) + '" keyTimes="0;' + (1 / D).toFixed(4) + ';' + (3 / D).toFixed(4) + ';1" dur="' + D + 's" fill="freeze"/></line>' +
      txt(px + 8, CY - 60, "peak amplitude", 12, C.hot, ' font-weight="700" text-anchor="start"') + show(0.8, 4) + '</g>';

    // ② 주기 T 표시 (한 주기 폭: 2Hz → W/2, 4Hz → W/4)
    var by = CY + 100;
    s += '<g opacity="0"><line x1="' + X0 + '" y1="' + by + '" x2="' + (X0 + W / 2) + '" y2="' + by + '" stroke="' + C.hot + '" stroke-width="2.5" marker-start="url(#sw_arr)" marker-end="url(#sw_arr)">' +
      '<animate attributeName="x2" values="' + (X0 + W / 2) + ';' + (X0 + W / 2) + ';' + (X0 + W / 4) + ';' + (X0 + W / 4) + '" keyTimes="0;' + (4 / D).toFixed(4) + ';' + (6 / D).toFixed(4) + ';1" dur="' + D + 's" fill="freeze"/></line>' +
      show(3.8, 7) + '</g>';
    s += during(3.8, 5, txt(X0 + W / 4, by - 8, "T = 0.5 s (한 주기)", 12, C.hot, ' font-weight="700"'));
    s += during(5.8, 7, txt(X0 + W / 8, by - 8, "T = 0.25 s", 12, C.hot, ' font-weight="700"'));

    // ③ 시간 0 에서의 위치 (phase)
    s += '<g opacity="0"><circle cx="' + X0 + '" cy="' + CY + '" r="7" fill="' + C.hot + '">' +
      '<animate attributeName="cy" values="' + CY + ';' + CY + ';' + (CY - 80) + ';' + (CY - 80) + ';' + CY + ';' + CY + '" keyTimes="0;' + (7 / D).toFixed(4) + ';' + (8 / D).toFixed(4) + ';' + (8.5 / D).toFixed(4) + ';' + (9.5 / D).toFixed(4) + ';1" dur="' + D + 's" fill="freeze"/></circle>' + show(6.8, D) + '</g>';
    s += during(6.8, 7.9, txt(X0 + 14, CY - 12, "0°: 0 에서 상승 시작", 12, C.hot, ' font-weight="700" text-anchor="start" stroke="#fff" stroke-width="4" paint-order="stroke"'));
    s += during(8, 9.4, txt(X0 + 14, CY - 92, "90°: 피크에서 시작 (¼T 앞당김)", 12, C.hot, ' font-weight="700" text-anchor="start" stroke="#fff" stroke-width="4" paint-order="stroke"'));
    s += during(9.5, D, txt(X0 + 14, CY + 28, "180°: 0 에서 하강 시작 (½T 앞당김)", 12, C.hot, ' font-weight="700" text-anchor="start" stroke="#fff" stroke-width="4" paint-order="stroke"'));

    // ---- 오른쪽 값 패널 ----
    var PXL = 622;
    s += '<rect x="' + PXL + '" y="72" width="128" height="200" rx="8" fill="#f7f8fb" stroke="#d0d6e2"/>';
    var rows = [
      { y: 100, name: "peak amplitude", vals: [[0, 2, "5 V"], [2, D, "8 V"]], hi: [1, 4] },
      { y: 160, name: "frequency", vals: [[0, 5, "2 Hz"], [5, D, "4 Hz"]], hi: [4, 7] },
      { y: 220, name: "phase", vals: [[0, 7.5, "0°"], [7.5, 9, "90°"], [9, D, "180°"]], hi: [7, 10] }
    ];
    rows.forEach(function (r) {
      s += during(r.hi[0], r.hi[1], '<rect x="' + (PXL + 4) + '" y="' + (r.y - 18) + '" width="120" height="50" rx="6" fill="#ffe3e8" stroke="' + C.hot + '" stroke-width="1.5"/>');
      s += txt(PXL + 64, r.y, r.name, 12, C.dev, ' font-weight="700"');
      r.vals.forEach(function (v) { s += during(v[0], v[1], txt(PXL + 64, r.y + 22, v[2], 15, C.sig, ' font-weight="700"')); });
    });

    // ---- 단계 자막 ----
    var caps = [
      [0, 1, "사인파(sine wave)는 3요소로 표현: peak amplitude / frequency / phase"],
      [1, 4, "① peak amplitude ↑ — 신호의 최대 세기(절댓값, 단위 V)가 5 V → 8 V"],
      [4, 7, "② frequency 2배 — 1초에 2주기 → 4주기, 주기 T = 1/f 는 절반"],
      [7, 10, "③ phase 0° → 90° → 180° — 시간 0 을 기준으로 한 파형의 위치가 이동"],
      [10, D, "세 값만 알면 사인파 하나가 완전히 정해진다 (점선 = 처음 파형)"]
    ];
    caps.forEach(function (c) { s += during(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    s += txt(380, 318, "peak amplitude = 높이 · frequency = 1초에 몇 주기 (f = 1/T) · phase = 시간 0 에서 어디서 출발하나", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
