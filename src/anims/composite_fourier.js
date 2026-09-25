// ============================================================
// composite_fourier — f, 3f, 5f 사인파를 더하면 사각파에 가까워진다 + frequency domain 막대 + bandwidth
// CONTRACT §7. 슬라이드 L2 p.26–30.
// 시간축(초): 0 목표(사각파) 제시 → 1.5 f 성분 + 막대 → 3.5 3f → 5.5 5f → 7.5 합이 사각파에 가까움
//   → 9.5 bandwidth = 5f − f 화살표 → 13 끝
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["composite_fourier"] = {
  title: "합성 신호와 Fourier analysis — 사인파 3개를 더해 사각파 만들기",
  desc: "[[composite signal]]은 주파수·진폭이 다른 사인파들의 합이다([[Fourier analysis]]). 왼쪽 [[time domain과 frequency domain|time domain]] 의 파형 = 오른쪽 frequency domain 의 막대들, [[bandwidth]] = 최고 − 최저 주파수",
  duration: 13,
  build: function () {
    var D = 13;
    var C = { f1: "#1d65b3", f3: "#e09a40", f5: "#2e9e4f", sum: "#3b2f4a", hot: "#d6465f", muted: "#777" };
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

    // 곡선: 점 N 개 → Catmull-Rom → cubic Bezier (모든 곡선이 같은 명령 구조 → d 모핑 가능)
    var X0 = 70, W = 330, CYC = 2;
    function curve(fn, oy, A, N) {
      var P = [];
      for (var i = 0; i < N; i++) {
        var u = i / (N - 1), th = 2 * Math.PI * CYC * u;
        P.push([X0 + u * W, oy - A * fn(th)]);
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
    function drawOn(d, color, w, t0, t1) {   // t0→t1 동안 왼쪽에서 오른쪽으로 그려짐
      return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100">' +
        '<animate attributeName="stroke-dashoffset" values="100;100;0;0" keyTimes="' + kt([0, t0, t1, D]) + '" dur="' + D + 's" fill="freeze"/></path>';
    }

    var s = '<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="합성 신호 푸리에 분해 애니메이션">';
    s += '<defs><marker id="cf_arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C.hot + '"/></marker></defs>';

    // ---- 왼쪽: time domain ----
    s += txt(235, 58, "Time domain", 13, C.sum, ' font-weight="700"');
    var rows = [
      { y: 88, A: 20, n: 1, c: C.f1, lab: "f  (진폭 1)", t: 1.5 },
      { y: 125, A: 20 / 3, n: 3, c: C.f3, lab: "3f (진폭 1/3)", t: 3.5 },
      { y: 152, A: 4, n: 5, c: C.f5, lab: "5f (진폭 1/5)", t: 5.5 }
    ];
    rows.forEach(function (r) {
      s += '<line x1="' + X0 + '" y1="' + r.y + '" x2="' + (X0 + W) + '" y2="' + r.y + '" stroke="#e1e4ea"/>';
      s += during(r.t, D, txt(X0 - 6, r.y + 4, r.lab.split(" ")[0], 12, r.c, ' font-weight="700" text-anchor="end"'));
      s += drawOn(curve(function (th) { return Math.sin(r.n * th); }, r.y, r.A, 60), r.c, 2, r.t, r.t + 1.2);
    });
    s += during(1.5, D, txt(X0 + W + 8, 92, "진폭 1", 11, C.muted, ' text-anchor="start"'));
    s += during(3.5, D, txt(X0 + W + 8, 129, "진폭 1/3", 11, C.muted, ' text-anchor="start"'));
    s += during(5.5, D, txt(X0 + W + 8, 156, "진폭 1/5", 11, C.muted, ' text-anchor="start"'));

    // 합 (아래 큰 플롯)
    var SY = 238, SA = 44;
    s += '<line x1="' + X0 + '" y1="' + SY + '" x2="' + (X0 + W + 10) + '" y2="' + SY + '" stroke="#555" stroke-width="1.2"/>';
    s += '<line x1="' + X0 + '" y1="' + (SY - 55) + '" x2="' + X0 + '" y2="' + (SY + 55) + '" stroke="#555" stroke-width="1.2"/>';
    s += txt(X0 + W + 14, SY + 4, "time", 11, C.muted, ' text-anchor="start"');
    s += txt(X0 - 6, SY + 4, "합", 12, C.sum, ' font-weight="700" text-anchor="end"');
    // 목표 사각파 (점선): 높이 π/4
    var q = SA * Math.PI / 4, sq = "M" + X0 + " " + (SY - q).toFixed(1);
    for (var c = 0; c < CYC; c++) {
      var xa = X0 + W * c / CYC, xm = xa + W / CYC / 2, xb = xa + W / CYC;
      sq += " L" + xm.toFixed(1) + " " + (SY - q).toFixed(1) + " L" + xm.toFixed(1) + " " + (SY + q).toFixed(1) + " L" + xb.toFixed(1) + " " + (SY + q).toFixed(1) + (c < CYC - 1 ? " L" + xb.toFixed(1) + " " + (SY - q).toFixed(1) : "");
    }
    s += '<path d="' + sq + '" fill="none" stroke="#aaa" stroke-width="1.5" stroke-dasharray="5 4"/>';
    s += during(0, 1.5, txt(X0 + W / 4, SY - q - 8, "목표: 사각파", 11, C.muted));
    var s1 = curve(function (th) { return Math.sin(th); }, SY, SA, 80);
    var s2 = curve(function (th) { return Math.sin(th) + Math.sin(3 * th) / 3; }, SY, SA, 80);
    var s3 = curve(function (th) { return Math.sin(th) + Math.sin(3 * th) / 3 + Math.sin(5 * th) / 5; }, SY, SA, 80);
    s += '<g opacity="0"><path d="' + s1 + '" fill="none" stroke="' + C.sum + '" stroke-width="3">' +
      '<animate attributeName="d" values="' + [s1, s1, s2, s2, s3, s3].join(";") + '" keyTimes="' + kt([0, 3.8, 4.8, 5.8, 6.8, D]) + '" dur="' + D + 's" fill="freeze"/></path>' + show(2.2, D) + '</g>';
    s += during(2.4, 4, txt(X0 + W - 4, SY - 52, "f", 12, C.sum, ' font-weight="700" text-anchor="end"'));
    s += during(4, 6, txt(X0 + W - 4, SY - 52, "f + 3f", 12, C.sum, ' font-weight="700" text-anchor="end"'));
    s += during(6, D, txt(X0 + W - 4, SY - 52, "f + 3f + 5f", 12, C.sum, ' font-weight="700" text-anchor="end"'));

    // ---- 가운데 구분 ----
    s += '<line x1="440" y1="50" x2="440" y2="300" stroke="#e3e3e3"/>';
    s += during(1.5, D, txt(440, 180, "=", 22, C.muted, ' font-weight="700" stroke="#fff" stroke-width="6" paint-order="stroke"'));

    // ---- 오른쪽: frequency domain ----
    var FX = 480, FY = 250, FW = 250;
    s += txt(FX + FW / 2, 58, "Frequency domain", 13, C.sum, ' font-weight="700"');
    s += '<line x1="' + FX + '" y1="' + FY + '" x2="' + (FX + FW) + '" y2="' + FY + '" stroke="#555" stroke-width="1.5"/>';
    s += '<line x1="' + FX + '" y1="' + FY + '" x2="' + FX + '" y2="' + (FY - 170) + '" stroke="#555" stroke-width="1.5"/>';
    s += txt(FX + FW, FY + 16, "frequency", 11, C.muted, ' text-anchor="end"');
    s += txt(FX - 6, FY - 160, "진폭", 11, C.muted, ' text-anchor="end"');
    var bars = [
      { x: FX + 40, h: 135, c: C.f1, lab: "f", t: 2.2 },
      { x: FX + 110, h: 45, c: C.f3, lab: "3f", t: 4.2 },
      { x: FX + 180, h: 27, c: C.f5, lab: "5f", t: 6.2 }
    ];
    bars.forEach(function (b) {
      s += txt(b.x, FY + 16, b.lab, 12, b.c, ' font-weight="700"');
      s += '<rect x="' + (b.x - 9) + '" y="' + FY + '" width="18" height="0" fill="' + b.c + '">' +
        '<animate attributeName="height" values="0;0;' + b.h + ';' + b.h + '" keyTimes="' + kt([0, b.t, b.t + 0.8, D]) + '" dur="' + D + 's" fill="freeze"/>' +
        '<animate attributeName="y" values="' + FY + ';' + FY + ';' + (FY - b.h) + ';' + (FY - b.h) + '" keyTimes="' + kt([0, b.t, b.t + 0.8, D]) + '" dur="' + D + 's" fill="freeze"/></rect>';
    });
    s += during(7.5, D, txt(FX + 150, FY - 130, "사인파 1개 = 막대 1개", 12, C.muted));
    // bandwidth 화살표
    var BY = FY + 50;
    s += during(9.5, D,
      '<line x1="' + bars[0].x + '" y1="' + (FY + 22) + '" x2="' + bars[0].x + '" y2="' + (BY + 4) + '" stroke="' + C.hot + '" stroke-dasharray="3 3"/>' +
      '<line x1="' + bars[2].x + '" y1="' + (FY + 22) + '" x2="' + bars[2].x + '" y2="' + (BY + 4) + '" stroke="' + C.hot + '" stroke-dasharray="3 3"/>' +
      '<line x1="' + bars[0].x + '" y1="' + BY + '" x2="' + bars[2].x + '" y2="' + BY + '" stroke="' + C.hot + '" stroke-width="2.5" marker-start="url(#cf_arr)" marker-end="url(#cf_arr)"/>' +
      txt((bars[0].x + bars[2].x) / 2, BY - 6, "bandwidth = 5f − f = 4f", 13, C.hot, ' font-weight="700" stroke="#fff" stroke-width="4" paint-order="stroke"'));

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "목표: 사각파(점선) 같은 합성 신호(composite signal)를 사인파로 분해해 보자"],
      [1.5, 3.5, "① 기본 주파수 f, 진폭 1 — frequency domain 에 막대 하나"],
      [3.5, 5.5, "② 3f, 진폭 1/3 을 더하면 모서리가 서기 시작한다"],
      [5.5, 7.5, "③ 5f, 진폭 1/5 까지 더하면 사각파에 더 가까워진다"],
      [7.5, 9.5, "Fourier analysis: 어떤 합성 신호든 단순 사인파들의 조합으로 분해된다"],
      [9.5, D, "bandwidth = 합성 신호에 포함된 주파수의 범위 = 최고 − 최저 주파수"]
    ];
    caps.forEach(function (c) { s += during(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    s += txt(380, 330, "왼쪽 파형(time domain)과 오른쪽 막대(frequency domain)는 같은 신호 — 주기 신호는 이산 막대, bandwidth 는 막대 사이 폭", 11, C.muted);
    s += '</svg>';
    return s;
  }
};
