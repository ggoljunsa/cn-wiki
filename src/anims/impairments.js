// ============================================================
// impairments — signal impairment 3가지: attenuation / distortion / noise
// CONTRACT §7. 슬라이드 L2 p.40–46.
// 시간축(초): 0 송신 파형 3줄 → 1 attenuation(작아짐 → amplifier 로 회복) → 4.5 distortion(3f 성분 위상 밀림)
//   → 8 noise(잡음이 더해짐, SNR) → 11.5~13 결과 유지
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["impairments"] = {
  title: "신호 손상 3가지 — attenuation · distortion · noise",
  desc: "[[signal impairment]]: [[attenuation]]은 에너지를 잃어 작아지고([[amplifier]]로 회복), [[distortion]]은 성분의 위상이 어긋나 모양이 변하고, [[noise]]는 원치 않는 신호가 더해진다([[SNR]])",
  duration: 13,
  build: function () {
    var D = 13;
    var C = { sig: "#1d65b3", hot: "#d6465f", dev: "#3b2f4a", devL: "#efe9f6", muted: "#777", band: "#f3f5fa" };
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
    // 부드러운 곡선 (점 N 개, Catmull-Rom)
    function curve(fn, x0, w, oy, A, N) {
      var P = [];
      for (var i = 0; i < N; i++) { var u = i / (N - 1); P.push([x0 + u * w, oy - A * fn(u)]); }
      var d = "M" + r1(P[0][0]) + " " + r1(P[0][1]);
      for (i = 0; i < N - 1; i++) {
        var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(N - 1, i + 2)];
        d += "C" + r1(p1[0] + (p2[0] - p0[0]) / 6) + " " + r1(p1[1] + (p2[1] - p0[1]) / 6) + " " +
          r1(p2[0] - (p3[0] - p1[0]) / 6) + " " + r1(p2[1] - (p3[1] - p1[1]) / 6) + " " + r1(p2[0]) + " " + r1(p2[1]);
      }
      return d;
    }
    // 꺾은선 (잡음처럼 지글거리는 것)
    function poly(fn, x0, w, oy, A, N) {
      var d = "";
      for (var i = 0; i < N; i++) { var u = i / (N - 1); d += (i ? " L" : "M") + r1(x0 + u * w) + " " + r1(oy - A * fn(u, i)); }
      return d;
    }
    function drawOn(d, color, w, t0, t1, extra) {
      return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"' + (extra || "") + '>' +
        '<animate attributeName="stroke-dashoffset" values="100;100;0;0" keyTimes="' + kt([0, t0, t1, D]) + '" dur="' + D + 's" fill="freeze"/></path>';
    }
    function arrow(x1, x2, y, label) {
      return '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="#555" stroke-width="1.8" marker-end="url(#im_arr)"/>' + txt((x1 + x2) / 2, y - 7, label, 11, C.muted);
    }
    // 의사난수 (항상 같은 잡음)
    var seed = 7;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    var NOISE = [];
    for (var n = 0; n < 70; n++) NOISE.push(rnd() * 2 - 1);

    var TAU = 2 * Math.PI, CYC = 3;
    function sine(u) { return Math.sin(TAU * CYC * u); }
    function comp(u) { return Math.sin(TAU * 2 * u) + Math.sin(TAU * 6 * u) / 3; }            // 송신: 성분 in phase
    function compD(u) { return Math.sin(TAU * 2 * u) + Math.sin(TAU * 6 * u + Math.PI) / 3; } // 수신: 3f 성분이 180° 밀림

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="신호 손상 애니메이션">';
    s += '<defs><marker id="im_arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';

    var RY = [100, 190, 280];
    // 현재 줄 강조 배경
    [[1, 4.5], [4.5, 8], [8, 11.5]].forEach(function (w, i) {
      s += during(w[0], w[1], '<rect x="8" y="' + (RY[i] - 40) + '" width="744" height="80" rx="8" fill="' + C.band + '"/>');
    });
    // 줄 이름
    [["Attenuation", "감쇠"], ["Distortion", "왜곡"], ["Noise", "잡음"]].forEach(function (nm, i) {
      s += '<text x="18" y="' + (RY[i] - 2) + '" font-size="14" fill="#222" font-weight="700">' + nm[0] + '</text>';
      s += '<text x="18" y="' + (RY[i] + 16) + '" font-size="12" fill="' + C.muted + '">' + nm[1] + '</text>';
    });
    // 열 머리
    s += txt(190, 52, "송신 (보낸 신호)", 11, C.muted) + txt(580, 52, "수신 (받은 신호)", 11, C.muted);

    // ---- ① Attenuation ----
    var y = RY[0];
    s += '<path d="' + curve(sine, 120, 140, y, 26, 40) + '" fill="none" stroke="' + C.sig + '" stroke-width="2.5"/>';
    s += during(1, D, arrow(266, 306, y, "매체"));
    s += drawOn(curve(sine, 312, 130, y, 9, 40), C.sig, 2.5, 1.3, 2.3);
    s += during(1.8, 4.5, txt(377, y + 32, "에너지 손실 → 작아짐", 11, C.hot, ' font-weight="700"'));
    s += during(2.6, D, '<polygon points="452,' + (y - 18) + ' 452,' + (y + 18) + ' 486,' + y + '" fill="' + C.devL + '" stroke="' + C.dev + '" stroke-width="2"/>' +
      txt(469, y + 32, "amplifier", 11, C.dev, ' font-weight="700"'));
    s += drawOn(curve(sine, 510, 140, y, 26, 40), C.sig, 2.5, 3.0, 4.0);
    s += during(3.4, D, txt(705, y - 6, "감쇠 = dB 음수", 11, C.hot, ' font-weight="700"') + txt(705, y + 12, "증폭 = dB 양수", 11, "#2e9e4f", ' font-weight="700"'));

    // ---- ② Distortion ----
    y = RY[1];
    s += '<path d="' + curve(comp, 120, 140, y, 20, 40) + '" fill="none" stroke="' + C.sig + '" stroke-width="2.5"/>';
    s += during(4.5, D, arrow(266, 306, y, "매체"));
    s += during(5.8, D, '<path d="' + curve(comp, 510, 140, y, 20, 40) + '" fill="none" stroke="#b9c4d8" stroke-width="1.5" stroke-dasharray="4 3"/>' +
      txt(580, y - 30, "점선 = 보낸 모양", 11, C.muted));
    s += drawOn(curve(compD, 510, 140, y, 20, 40), C.hot, 2.5, 4.8, 5.8);
    s += during(5, D, txt(385, y - 4, "f 성분: 그대로", 11, C.sig, ' font-weight="700"') + txt(385, y + 14, "3f 성분: 위상 밀림", 11, C.hot, ' font-weight="700"'));
    s += during(6.3, D, txt(705, y - 6, "in phase →", 11, C.muted) + txt(705, y + 12, "out of phase", 11, C.hot, ' font-weight="700"'));

    // ---- ③ Noise ----
    y = RY[2];
    s += '<path d="' + curve(sine, 120, 140, y, 24, 40) + '" fill="none" stroke="' + C.sig + '" stroke-width="2.5"/>';
    s += during(8, D, txt(285, y + 5, "+", 20, "#555", ' font-weight="700"'));
    s += drawOn(poly(function (u, i) { return NOISE[i]; }, 310, 130, y, 9, 60), C.hot, 1.5, 8.2, 9.0);
    s += during(8.2, D, txt(375, y + 32, "noise (열잡음 등)", 11, C.hot, ' font-weight="700"'));
    s += during(9.1, D, txt(475, y + 5, "=", 20, "#555", ' font-weight="700"'));
    s += drawOn(poly(function (u, i) { return sine(u) + NOISE[i] * 0.2; }, 510, 140, y, 24, 70), C.sig, 2, 9.3, 10.2);
    // SNR 막대
    var bx = 680, base = y + 30;
    s += during(10.2, D, txt(715, y - 32, "SNR = S / N", 12, C.dev, ' font-weight="700"') +
      txt(bx, base + 13, "S", 11, C.sig, ' font-weight="700"') + txt(bx + 36, base + 13, "N", 11, C.hot, ' font-weight="700"'));
    s += '<rect x="' + (bx - 9) + '" y="' + base + '" width="18" height="0" fill="' + C.sig + '"><animate attributeName="height" values="0;0;44;44" keyTimes="' + kt([0, 10.3, 11, D]) + '" dur="' + D + 's" fill="freeze"/>' +
      '<animate attributeName="y" values="' + base + ';' + base + ';' + (base - 44) + ';' + (base - 44) + '" keyTimes="' + kt([0, 10.3, 11, D]) + '" dur="' + D + 's" fill="freeze"/></rect>';
    s += '<rect x="' + (bx + 27) + '" y="' + base + '" width="18" height="0" fill="' + C.hot + '"><animate attributeName="height" values="0;0;10;10" keyTimes="' + kt([0, 10.3, 11, D]) + '" dur="' + D + 's" fill="freeze"/>' +
      '<animate attributeName="y" values="' + base + ';' + base + ';' + (base - 10) + ';' + (base - 10) + '" keyTimes="' + kt([0, 10.3, 11, D]) + '" dur="' + D + 's" fill="freeze"/></rect>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1, "신호 손상(signal impairment)의 3가지 원인: attenuation · distortion · noise"],
      [1, 4.5, "attenuation: 매체의 저항을 이기느라 에너지를 잃음 → amplifier 로 되살림"],
      [4.5, 8, "distortion: 일부 주파수 성분의 위상이 어긋나(out of phase) 모양·형태가 변함"],
      [8, 11.5, "noise: 열잡음·유도 잡음·누화·임펄스 잡음이 더해짐 → SNR 로 잰다"],
      [11.5, D, "세 가지 모두 받은 신호 ≠ 보낸 신호 — 원인이 에너지 / 위상 / 외부 잡음으로 다르다"]
    ];
    caps.forEach(function (c) { s += during(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    s += txt(380, 346, "attenuation = 작아짐(dB 음수) · distortion = 모양이 변함 · noise = 원치 않는 신호가 더해짐, SNR = 평균 신호 전력 / 평균 잡음 전력", 11, C.muted);
    s += '</svg>';
    return s;
  }
};
