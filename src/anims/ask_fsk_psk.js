// ============================================================
// ask_fsk_psk — 비트열 1 0 1 1 0 을 ASK · FSK · PSK 로 변조 (왼쪽 → 오른쪽으로 그려짐)
// CONTRACT §7. 슬라이드 L4 p.37–45.
// 시간축(초): 0 비트열 → 1.5 ASK(진폭 켬/끔) → 4.5 FSK(빽빽/성김) → 7.5 PSK(0 에서 위상 반전)
//   → 10.5~13 "바꾸는 것: 진폭 / 주파수 / 위상"
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["ask_fsk_psk"] = {
  title: "ASK · FSK · PSK — 같은 비트열 1 0 1 1 0, 바꾸는 것만 다르다",
  desc: "디지털→아날로그 [[modulation]]: [[ASK]]는 진폭, [[FSK]]는 주파수, [[PSK]]는 위상을 바꿔 [[carrier]]에 비트를 싣는다 (bit rate 5 = [[baud]] 5)",
  duration: 13,
  build: function () {
    var D = 13;
    var C = { sig: "#1d65b3", hot: "#d6465f", dev: "#3b2f4a", muted: "#777", carrier: "#777", band: "#f3f5fa", one: "#dbe8f7", zero: "#f3f3f3" };
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

    var BITS = [1, 0, 1, 1, 0];
    var X0 = 110, BW = 110, W = BW * BITS.length, A = 24;
    // 비트 구간별 파형 함수 → 점을 찍어 Catmull-Rom 곡선으로
    function wave(oy, fn, perBit) {
      var P = [], N = perBit * BITS.length;
      for (var i = 0; i <= N; i++) {
        var u = i / N * BITS.length;                      // 비트 단위 시간
        var b = Math.min(BITS.length - 1, Math.floor(u - 1e-9 < 0 ? 0 : u - 1e-9));
        P.push([X0 + u * BW, oy - A * fn(BITS[b], u)]);
      }
      var d = "M" + r1(P[0][0]) + " " + r1(P[0][1]);
      for (i = 0; i < P.length - 1; i++) {
        var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
        d += "C" + r1(p1[0] + (p2[0] - p0[0]) / 6) + " " + r1(p1[1] + (p2[1] - p0[1]) / 6) + " " +
          r1(p2[0] - (p3[0] - p1[0]) / 6) + " " + r1(p2[1] - (p3[1] - p1[1]) / 6) + " " + r1(p2[0]) + " " + r1(p2[1]);
      }
      return d;
    }
    function drawOn(d, color, w, t0, t1) {
      return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100">' +
        '<animate attributeName="stroke-dashoffset" values="100;100;0;0" keyTimes="' + kt([0, t0, t1, D]) + '" dur="' + D + 's" fill="freeze"/></path>';
    }
    var TAU = 2 * Math.PI;
    function ask(b, u) { return b ? Math.sin(TAU * 3 * u) : 0; }                    // 1 켬, 0 끔
    function fsk(b, u) { return Math.sin(TAU * (b ? 4 : 2) * u); }                  // 1 → f₂(빽빽), 0 → f₁(성김)
    function psk(b, u) { return (b ? 1 : -1) * Math.sin(TAU * 3 * u); }               // 0 → 180° 반전

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ASK FSK PSK 변조 애니메이션">';

    // ---- 비트 칸 + 경계선 ----
    BITS.forEach(function (b, i) {
      var x = X0 + i * BW;
      s += '<rect x="' + x + '" y="46" width="' + BW + '" height="26" fill="' + (b ? C.one : C.zero) + '" stroke="#c9cfdb"/>';
      s += txt(x + BW / 2, 65, String(b), 15, b ? C.sig : C.muted, ' font-weight="700"');
    });
    for (var i = 0; i <= BITS.length; i++) {
      s += '<line x1="' + (X0 + i * BW) + '" y1="72" x2="' + (X0 + i * BW) + '" y2="318" stroke="#d5dae3" stroke-dasharray="3 3"/>';
    }
    s += txt(60, 64, "Digital data", 11, C.muted);

    var rows = [
      { y: 118, n: "ASK", sub: "1 = 켬, 0 = 끔", fn: ask, per: 30, t0: 1.5, t1: 4.5, what: "진폭", col: C.sig },
      { y: 202, n: "FSK", sub: "1 = f₂, 0 = f₁", fn: fsk, per: 36, t0: 4.5, t1: 7.5, what: "주파수", col: C.sig },
      { y: 286, n: "PSK", sub: "1 = 0°, 0 = 180°", fn: psk, per: 30, t0: 7.5, t1: 10.5, what: "위상", col: C.sig }
    ];
    rows.forEach(function (r) {
      s += during(r.t0, r.t1, '<rect x="8" y="' + (r.y - 36) + '" width="744" height="72" rx="8" fill="' + C.band + '"/>');
      s += '<text x="18" y="' + (r.y - 2) + '" font-size="15" fill="#222" font-weight="700">' + r.n + '</text>';
      s += '<text x="18" y="' + (r.y + 15) + '" font-size="11" fill="' + C.muted + '">' + esc(r.sub) + '</text>';
      s += '<line x1="' + X0 + '" y1="' + r.y + '" x2="' + (X0 + W) + '" y2="' + r.y + '" stroke="#bbb"/>';
      s += drawOn(wave(r.y, r.fn, r.per), r.col, 2.2, r.t0 + 0.2, r.t0 + 2.4);
      s += during(r.t0 + 2.5, D, txt(712, r.y - 4, "바꾸는 것", 11, C.muted) + txt(712, r.y + 15, r.what, 15, C.hot, ' font-weight="700"'));
    });
    // PSK: 위상 반전 지점 표시 (비트 값이 바뀌는 경계마다)
    [1, 2, 4].forEach(function (bi) {
      var x = X0 + bi * BW;
      s += during(7.5 + 0.2 + 2.2 * bi / BITS.length + 0.2, D, '<circle cx="' + x + '" cy="286" r="7" fill="none" stroke="' + C.hot + '" stroke-width="2"/>' +
        txt(x, 320, "180° 반전", 11, C.hot, ' font-weight="700"'));
    });
    // FSK: 빽빽/성김 라벨
    s += during(5.5, D, txt(X0 + BW / 2, 236, "f₂ (빽빽)", 11, C.dev) + txt(X0 + 1.5 * BW, 236, "f₁ (성김)", 11, C.dev));
    // ASK: 0 구간 라벨
    s += during(2.6, D, txt(X0 + 1.5 * BW, 112, "진폭 0", 11, C.muted) + txt(X0 + 4.5 * BW, 112, "진폭 0", 11, C.muted));

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "비트열 1 0 1 1 0 을 반송파(carrier)에 실어 보내는 3가지 방법"],
      [1.5, 4.5, "ASK: 1 이면 반송파를 켜고, 0 이면 진폭 0 — 주파수·위상은 일정"],
      [4.5, 7.5, "FSK: 0 → f₁, 1 → f₂ — 진폭·위상은 일정하고 주파수만 전환"],
      [7.5, 10.5, "PSK(BPSK): 1 → 위상 0°, 0 → 위상 180° (파형이 뒤집힘) — 진폭·주파수는 일정"],
      [10.5, D, "바꾸는 것: ASK = 진폭 · FSK = 주파수 · PSK = 위상 (bit rate 5 = baud 5)"]
    ];
    caps.forEach(function (c) { s += during(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    s += txt(380, 348, "대역폭: ASK·PSK 는 B = (1+d)S, FSK 는 반송파가 둘이라 B = (1+d)S + 2Δf", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
