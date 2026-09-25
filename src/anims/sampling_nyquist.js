// ============================================================
// sampling_nyquist — 같은 사인파를 f_s = 4f / 2f / (f_s < 2f) 로 표본화, 점을 이으면?
// CONTRACT §7. 슬라이드 L3 p.51–53.
// 시간축(초): 0 원 파형 3줄 → 1.5 f_s=4f 점 13개 + 잇기 → 4.5 f_s=2f 점 6개 + 잇기
//   → 7.5 undersampling 점 4개 + 잇기 → 엉뚱한 저주파 → 10.5~13 Nyquist rate = 2 × f_max
// undersampling 줄의 점 배치는 슬라이드 p.53 그림 c 와 같다(간격 ¾T — 엄밀히는 f_s = 4f/3, 여전히 2f 미만).
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["sampling_nyquist"] = {
  title: "Nyquist sampling — 주기당 몇 점을 찍어야 원래 파형이 살아나나",
  desc: "[[sampling]] 속도 f_s 를 4f([[oversampling과 undersampling|oversampling]]) → 2f(Nyquist rate) → 2f 미만(undersampling) 으로 낮추며 점을 이어 본다. [[Nyquist sampling theorem]]: f_s ≥ 2 × f_max",
  duration: 13,
  build: function () {
    var D = 13;
    var C = { sig: "#1d65b3", hot: "#d6465f", ok: "#2e9e4f", dev: "#3b2f4a", muted: "#777", band: "#f3f5fa" };
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
    function kt(arr) { return arr.map(function (t) { return +(t / D).toFixed(4); }).join(";"); }
    function r1(v) { return Math.round(v * 10) / 10; }
    function drawOn(d, color, w, t0, t1, extra) {
      return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"' + (extra || "") + '>' +
        '<animate attributeName="stroke-dashoffset" values="100;100;0;0" keyTimes="' + kt([0, t0, t1, D]) + '" dur="' + D + 's" fill="freeze"/></path>';
    }

    var X0 = 150, T = 150, NC = 3, W = T * NC, A = 26;   // 3 주기, 한 주기 150px
    function yAt(oy, tt) { return oy - A * Math.sin(2 * Math.PI * tt); }        // tt 는 주기 단위
    function sinePath(oy, fn) {                                                   // 점 40개 Catmull-Rom
      var N = 40, P = [];
      for (var i = 0; i < N; i++) { var tt = NC * i / (N - 1); P.push([X0 + tt * T, oy - A * fn(tt)]); }
      var d = "M" + r1(P[0][0]) + " " + r1(P[0][1]);
      for (i = 0; i < N - 1; i++) {
        var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(N - 1, i + 2)];
        d += "C" + r1(p1[0] + (p2[0] - p0[0]) / 6) + " " + r1(p1[1] + (p2[1] - p0[1]) / 6) + " " +
          r1(p2[0] - (p3[0] - p1[0]) / 6) + " " + r1(p2[1] - (p3[1] - p1[1]) / 6) + " " + r1(p2[0]) + " " + r1(p2[1]);
      }
      return d;
    }

    var s = '<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nyquist 표본화 애니메이션">';
    var rows = [
      { y: 92, lab: "f_s = 4f", sub: "Oversampling", pts: [], t0: 1.5, t1: 4.5, ok: "✓ 좋은 근사", ok2: "(중복 redundancy)", col: C.ok },
      { y: 180, lab: "f_s = 2f", sub: "Nyquist rate", pts: [], t0: 4.5, t1: 7.5, ok: "✓ 주기당 2점", ok2: "= 복원 가능한 최소", col: C.ok },
      { y: 268, lab: "f_s < 2f", sub: "Undersampling", pts: [], t0: 7.5, t1: 10.5, ok: "✗ 복원 불가", ok2: "엉뚱한 저주파", col: C.hot }
    ];
    var k;
    for (k = 0; k <= 12; k++) rows[0].pts.push(k / 4);              // 주기당 4점
    for (k = 0; k < 6; k++) rows[1].pts.push(0.25 + k / 2);         // 주기당 2점 (피크·골)
    for (k = 0; k < 4; k++) rows[2].pts.push(0.25 + k * 0.75);      // 슬라이드 그림 c 의 점

    rows.forEach(function (r, ri) {
      s += during(r.t0, r.t1, '<rect x="8" y="' + (r.y - 42) + '" width="744" height="84" rx="8" fill="' + C.band + '"/>');
      s += '<text x="18" y="' + (r.y - 2) + '" font-size="15" fill="#222" font-weight="700">' + esc(r.lab) + '</text>';
      s += '<text x="18" y="' + (r.y + 16) + '" font-size="12" fill="' + C.muted + '">' + r.sub + '</text>';
      s += '<line x1="' + X0 + '" y1="' + r.y + '" x2="' + (X0 + W + 12) + '" y2="' + r.y + '" stroke="#999"/>';
      s += '<line x1="' + X0 + '" y1="' + (r.y - 34) + '" x2="' + X0 + '" y2="' + (r.y + 34) + '" stroke="#999"/>';
      // 원 파형
      s += '<path d="' + sinePath(r.y, function (tt) { return Math.sin(2 * Math.PI * tt); }) + '" fill="none" stroke="' + C.sig + '" stroke-width="2.2" opacity="0.55"/>';
      // 샘플 점: 차례로 찍힘
      var n = r.pts.length, span = 1.4, line = "";
      r.pts.forEach(function (tt, i) {
        var x = r1(X0 + tt * T), y = r1(yAt(r.y, tt)), ts = r.t0 + 0.2 + span * i / n;
        s += during(ts, D, '<line x1="' + x + '" y1="' + r.y + '" x2="' + x + '" y2="' + y + '" stroke="#aaa" stroke-dasharray="2 2"/><circle cx="' + x + '" cy="' + y + '" r="4.5" fill="#222"/>');
        line += (i ? " L" : "M") + x + " " + y;
      });
      // 점을 잇는 선 (복원한 파형)
      s += drawOn(line, ri === 2 ? C.hot : C.dev, 2.2, r.t0 + 1.7, r.t0 + 2.6);
      s += during(r.t0 + 2.6, D, txt(690, r.y - 4, r.ok, 13, r.col, ' font-weight="700"') + txt(690, r.y + 14, r.ok2, 11, r.col));
    });
    // undersampling: 점들이 만드는 저주파 (주기 3T) 를 매끈하게
    var alias = sinePath(rows[2].y, function (tt) { return Math.sin(2 * Math.PI * tt / 3 + Math.PI / 3); });
    s += drawOn(alias, C.hot, 1.5, 9.4, 10.3, ' opacity="0.8"');
    s += during(9.6, D, txt(X0 + 1.7 * T, rows[2].y - 30, "점만 보면 주기 3T 짜리 느린 파형", 11, C.hot, ' font-weight="700" stroke="#fff" stroke-width="4" paint-order="stroke"'));
    // 주기당 2점 표시
    s += during(6.2, D, txt(X0 + 0.5 * T, rows[1].y + 38, "← 한 주기(T)에 2점 →", 11, C.dev));

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "같은 사인파(주파수 f)를 세 가지 sampling rate f_s 로 표본화해 보자"],
      [1.5, 4.5, "f_s = 4f (oversampling): 주기당 4점 — 잘 근사하지만 중복(redundancy)이 있다"],
      [4.5, 7.5, "f_s = 2f (Nyquist rate): 주기당 2점 — 원 신호를 근사할 수 있는 최소 속도"],
      [7.5, 10.5, "f_s < 2f (undersampling): 점을 이으면 원래와 전혀 다른 저주파 파형 → 복원 불가"],
      [10.5, D, "Nyquist rate = 2 × f_max — 최고 주파수의 최소 2배로 표본화해야 복원 가능"]
    ];
    caps.forEach(function (c) { s += during(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    s += txt(380, 330, "기준은 대역폭이 아니라 최고 주파수 f_max — 파란 선 = 원 신호, 검은 점 = 샘플, 진한 선 = 점을 이어 복원한 것", 11, C.muted);
    s += '</svg>';
    return s;
  }
};
