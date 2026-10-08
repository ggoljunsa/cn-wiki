// ============================================================
// bluetooth_piconet — L9 p.7–8 (piconet · scatternet) + p.15–16 (TDD-TDMA 슬롯, multiple-secondary)
// 0–4.6s piconet 1(primary 1 + secondary 7) → 4.6–7.0 piconet 2 + 공유 기기 = scatternet
// 7.2–13.2 시간축 625 μs slot 0..5 (짝수 primary, 홀수 지목된 secondary), slot 마다 주파수 hop → 13.2–14 결과 유지
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["bluetooth_piconet"] = {
  title: "Bluetooth piconet · scatternet 과 TDD-TDMA 슬롯 — 14초",
  desc: "[[piconet]] 은 primary 1 대 + secondary 최대 7 대 = 최대 8 대([[primary와 secondary]]). 한 기기가 두 piconet 에 동시에 속하면 [[scatternet]]. piconet 안에서는 [[TDD-TDMA]]: 625 μs [[Bluetooth 시간 슬롯]] 중 짝수 slot 에 primary 가 보내고(나머지는 듣기만), 지목된 secondary 가 다음 홀수 slot 에 응답한다. slot 마다 주파수가 바뀐다([[FHSS]], 1600 hops/s)",
  duration: 14,
  build: function () {
    var D = 14;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", b: "#2e9e4f", bL: "#dff3e4", c: "#e09a40", cL: "#fdeec2",
      dev: "#3b2f4a", devL: "#efe9f6", red: "#d6465f", muted: "#777"
    };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    function grow(w, t0, t1) {
      return '<animate attributeName="width" values="0;0;' + w + ';' + w + '" keyTimes="0;' + r4(t0 / D) + ';' + r4(t1 / D) + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function dev(x, y, col, colL, label) {
      return '<rect x="' + (x - 14) + '" y="' + (y - 10) + '" width="28" height="19" rx="3" fill="' + colL + '" stroke="' + col + '" stroke-width="1.5"/>' +
        '<line x1="' + (x - 17) + '" y1="' + (y + 11) + '" x2="' + (x + 17) + '" y2="' + (y + 11) + '" stroke="' + col + '" stroke-width="2"/>' +
        txt(x, y + 4, label, 11, col, ' font-weight="700"');
    }
    function line(x1, y1, x2, y2, col, w, dash) {
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (w || 1.5) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
    }

    var s = '<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bluetooth piconet, scatternet, TDD-TDMA 슬롯 애니메이션">';
    s += '<defs><marker id="bp_arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker>' +
      '<marker id="bp_arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.a + '"/></marker>' +
      '<marker id="bp_arrB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.b + '"/></marker></defs>';

    // ---- 단계 자막 ----
    var T0 = 7.2; // slot 0 시작
    var caps = [
      [0, 0.6, "Bluetooth piconet: primary 1 대가 가운데에 있다"],
      [0.6, 3.7, "secondary 가 하나씩 붙는다 — primary 가 아닌 나머지는 모두 secondary"],
      [3.7, 4.6, "piconet 완성: 최대 8 stations = primary 1 + secondary 7"],
      [4.6, 7.0, "piconet 들을 묶으면 scatternet — 한 기기(S7)가 두 piconet 에 동시에 속한다"],
      [7.0, T0, "piconet 1 안의 통신: 시간을 625 μs slot 으로 나눈다 (TDD-TDMA)"],
      [T0, T0 + 1, "slot 0 (짝수): primary 가 S1 에게 보낸다 — 나머지 secondary 는 듣기만"],
      [T0 + 1, T0 + 2, "slot 1 (홀수): 지목된 S1 이 primary 에게 응답한다"],
      [T0 + 2, T0 + 3, "slot 2 (짝수): primary 가 이번엔 S2 를 지목해 보낸다"],
      [T0 + 3, T0 + 4, "slot 3 (홀수): S2 가 응답 — 주파수는 slot 마다 바뀐다 (FHSS)"],
      [T0 + 4, T0 + 6, "slot 4 · 5: 다시 primary → S1, S1 → primary (동시에 보내는 일은 없다)"],
      [T0 + 6, D, "1 slot = 625 μs = 1 hop → 1 초에 1600 hops (FHSS)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- piconet 1 ----
    var P = [255, 70], SY = 132;
    var SX = [75, 135, 195, 255, 315, 375, 435];
    s += '<rect x="22" y="38" width="442" height="134" rx="8" fill="' + C.aL + '" fill-opacity="0.4" stroke="#555" stroke-width="1.4" stroke-dasharray="6 4"/>';
    s += txt(32, 56, "Piconet 1", 13, C.red, ' text-anchor="start" font-weight="700"');
    SX.forEach(function (x, i) {
      var t = 0.6 + i * 0.45;
      s += vis(t, D, line(P[0], P[1] + 12, x, SY - 10, C.muted, 1.4, "4 3") + dev(x, SY, C.b, C.bL, "S" + (i + 1)));
    });
    s += dev(P[0], P[1], C.a, C.aL, "P");
    s += txt(P[0] + 22, P[1] - 4, "Primary", 12, C.a, ' text-anchor="start" font-weight="700"');
    s += vis(3.7, D, txt(32, 74, "최대 8대 = 1 + 7", 12, C.red, ' text-anchor="start" font-weight="700"'));
    s += txt(32, 162, "Secondary ×7", 11, C.b, ' text-anchor="start" font-weight="700"');

    // ---- piconet 2 + scatternet ----
    var B = [435, SY], Q = [[520, 74], [620, 100], [700, 138]];
    s += vis(4.6, D,
      '<rect x="405" y="46" width="335" height="132" rx="8" fill="' + C.cL + '" fill-opacity="0.35" stroke="#555" stroke-width="1.4" stroke-dasharray="6 4"/>' +
      txt(730, 62, "Piconet 2", 13, C.red, ' text-anchor="end" font-weight="700"'));
    Q.forEach(function (q, i) {
      var t = 5.0 + i * 0.35;
      s += vis(t, D, line(B[0] + 14, B[1] - 8, q[0], q[1] + 6, C.muted, 1.4, "4 3") + dev(q[0], q[1], C.b, C.bL, "s"));
    });
    s += vis(4.6, D, dev(B[0], B[1], C.c, C.cL, "S7"));
    s += vis(4.6, D, txt(456, 160, "← S7 = piconet 2 의 primary", 10, C.c, ' text-anchor="start" font-weight="700"'));
    s += vis(6.0, D, txt(650, 173, "scatternet = piconet 1 + 2", 12, C.c, ' font-weight="700"'));

    // ---- 시간축 ----
    var X0 = 140, W = 95, NS = 6;
    var RY = [236, 261, 286, 308];
    var RL = [["Primary", C.a], ["S1", C.b], ["S2", C.b], ["S3–S7", C.muted]];
    var tl = "";
    RL.forEach(function (r, i) {
      tl += line(X0, RY[i], 728, RY[i], "#999", 1.2);
      tl += txt(30, RY[i] - 4, r[0], 13, r[1], ' text-anchor="start" font-weight="700"');
    });
    tl += txt(84, RY[3] - 4, "(듣기만)", 10, C.muted, ' text-anchor="start"');
    for (var k = 0; k <= NS; k++) tl += line(X0 + k * W, 194, X0 + k * W, 318, "#999", 1, "3 3");
    tl += '<line x1="' + X0 + '" y1="318" x2="740" y2="318" stroke="#555" stroke-width="1.5" marker-end="url(#bp_arr)"/>';
    tl += txt(738, 312, "Time", 11, "#555", ' text-anchor="end"');
    for (k = 0; k < NS; k++) {
      var ev = k % 2 === 0;
      tl += txt(X0 + k * W + W / 2, 333, "slot " + k + (ev ? " 짝수" : " 홀수"), 11, ev ? C.a : C.b, ' font-weight="700"');
    }
    s += vis(7.0, D, tl);
    s += vis(7.0, D, '<line x1="' + X0 + '" y1="196" x2="' + (X0 + W) + '" y2="196" stroke="' + C.red + '" stroke-width="1.2"/>' +
      txt(X0 + 26, 192, "625 μs", 10, C.red, ' font-weight="700"'));

    // slot 별: [송신 행, 지목 행(받는 쪽), 주파수, 지목된 secondary index]
    var SL = [[0, 1, "f17", 0], [1, 0, "f3", 0], [0, 2, "f55", 1], [2, 0, "f40", 1], [0, 1, "f9", 0], [1, 0, "f71", 0]];
    SL.forEach(function (g, k) {
      var t0 = T0 + k, t1 = t0 + 0.6, x = X0 + k * W + 4, bw = 62;
      var ev = k % 2 === 0, col = ev ? C.a : C.b, colL = ev ? C.aL : C.bL, y = RY[g[0]];
      // 주파수 번호 (slot 이 시작될 때 hop)
      s += vis(t0, D, '<rect x="' + (X0 + k * W + W / 2 + 4) + '" y="200" width="34" height="15" rx="7" fill="' + C.devL + '" stroke="' + C.dev + '"/>' +
        txt(X0 + k * W + W / 2 + 21, 211, g[2], 11, C.dev, ' font-weight="700"'));
      // 블록
      s += '<rect x="' + x + '" y="' + (y - 16) + '" height="16" width="0" fill="' + colL + '" stroke="' + col + '" stroke-width="1.6">' + grow(bw, t0, t1) + '</rect>';
      s += '<rect x="' + x + '" y="' + (y - 16) + '" height="16" width="0" fill="' + col + '" fill-opacity="0.35">' + grow(9, t0, t0 + 0.1) + '</rect>';
      // 받는 쪽 화살표
      var ax = x + bw + 10, ya = g[0] < g[1] ? y + 2 : y - 18, yb = g[0] < g[1] ? RY[g[1]] - 18 : RY[g[1]] + 2;
      s += vis(t1, t0 + 1, '<line x1="' + ax + '" y1="' + ya + '" x2="' + ax + '" y2="' + yb + '" stroke="' + col + '" stroke-width="1.8" marker-end="url(#bp_arr' + (ev ? "A" : "B") + ')"/>');
      // 짝수 slot: 지목 안 된 secondary 들은 듣기만
      if (ev) {
        [1, 2, 3].forEach(function (r) {
          if (r === g[1]) return;
          s += vis(t0, t0 + 1, '<rect x="' + x + '" y="' + (RY[r] - 12) + '" width="' + bw + '" height="10" rx="2" fill="none" stroke="#aaa" stroke-dasharray="3 2"/>');
        });
      }
      // 위쪽 piconet 에서 지금 통신하는 쌍 강조
      var sx = SX[g[3]];
      s += vis(t0, t0 + 1, line(P[0], P[1] + 12, sx, SY - 10, col, 3.5) +
        '<circle cx="' + sx + '" cy="' + SY + '" r="20" fill="none" stroke="' + col + '" stroke-width="2"/>' +
        '<circle cx="' + P[0] + '" cy="' + P[1] + '" r="20" fill="none" stroke="' + col + '" stroke-width="2"/>');
    });

    // ---- 요점 ----
    s += '<rect x="20" y="342" width="720" height="30" rx="6" fill="#f6f6f6" stroke="#ddd"/>';
    s += txt(380, 362, "TDD-TDMA = 시간으로 나눈 half-duplex: 짝수 slot primary, 홀수 slot secondary, slot = 625 μs = 1 hop", 12.5, "#333", ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
