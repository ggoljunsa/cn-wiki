// delta_modulation — L3 p.65 Delta Modulation (DM): 매 T 마다 곡선과 계단을 비교해 1(+d) / 0(−d)
window.SIMS = window.SIMS || {};
(function (global) {
  "use strict";

  // 슬라이드 그림에는 곡선의 수치가 없다. 아래 샘플값(d 단위)은
  // 그림의 모양(올라갔다 내려와 바닥에서 다시 조금 오름)을 따르면서
  // 비트열 0 1 1 1 1 1 1 0 0 0 0 0 0 1 1 이 정확히 나오도록 설계한 값이다.
  var X = [0.4, 1.3, 2.2, 3.0, 3.8, 4.6, 5.2, 5.3, 4.6, 3.6, 2.5, 1.5, 0.7, 0.6, 1.1];
  var S0 = 1;       // 시작 계단 값 (d 단위)
  var EXPECT = "011111100000011";

  function fmt(x) { return (Math.round(x * 10) / 10).toFixed(1); }

  // Catmull-Rom → cubic bezier 로 부드러운 곡선
  function smooth(pts) {
    var d = "M " + pts[0][0] + " " + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += " C " + c1x.toFixed(1) + " " + c1y.toFixed(1) + " " + c2x.toFixed(1) + " " + c2y.toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }
    return d;
  }

  function svgFor(n, phase, stairs, bits) {
    // n: 현재 샘플 번호(0..14, -1 = 시작), phase 1 = 비교 중, 2 = 결정 후
    return function () {
      var W = 640, H = 270, x0 = 50, dx = 38, y0 = 200, dy = 24;
      function PX(t) { return x0 + t * dx; }
      function PY(v) { return y0 - v * dy; }
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="11">';
      for (var g = 0; g <= 7; g++) s += '<line x1="' + x0 + '" y1="' + PY(g) + '" x2="' + PX(15) + '" y2="' + PY(g) + '" stroke="#e3e3e3"/>';
      for (var t = 0; t <= 15; t++) s += '<line x1="' + PX(t) + '" y1="' + PY(0) + '" x2="' + PX(t) + '" y2="' + PY(7) + '" stroke="#e3e3e3"/>';
      s += '<line x1="' + x0 + '" y1="' + PY(0) + '" x2="' + (PX(15) + 12) + '" y2="' + PY(0) + '" stroke="#333"/>';
      s += '<line x1="' + x0 + '" y1="' + PY(0) + '" x2="' + x0 + '" y2="' + (PY(7) - 6) + '" stroke="#333"/>';
      for (var g2 = 0; g2 <= 7; g2++) s += '<text x="' + (x0 - 6) + '" y="' + (PY(g2) + 4) + '" text-anchor="end" fill="#777" font-size="10">' + g2 + "d</text>";
      // curve
      var pts = X.map(function (v, i) { return [PX(i), PY(v)]; });
      pts.push([PX(15), PY(1.3)]);
      s += '<path d="' + smooth(pts) + '" fill="none" stroke="#d6465f" stroke-width="2.5"/>';
      // initial reference
      s += '<line x1="' + (x0 - 2) + '" y1="' + PY(S0) + '" x2="' + (x0 + 6) + '" y2="' + PY(S0) + '" stroke="#555" stroke-width="3"/>';
      // staircase: stairs[k] = 값 during segment k (after decision k)
      var path = "";
      for (var k = 0; k < stairs.length; k++) {
        var prev = k === 0 ? S0 : stairs[k - 1];
        path += (k === 0 ? "M " + PX(0) + " " + PY(prev) : "") + " L " + PX(k) + " " + PY(stairs[k]) + " L " + PX(k + 1) + " " + PY(stairs[k]);
      }
      if (path) s += '<path d="' + path + '" fill="none" stroke="#555" stroke-width="2.5"/>';
      // current sample marker
      if (n >= 0) {
        var cur = n === 0 ? S0 : stairs[n - 1];
        s += '<line x1="' + PX(n) + '" y1="' + PY(X[n]) + '" x2="' + PX(n) + '" y2="' + PY(cur) + '" stroke="#1d65b3" stroke-width="2" stroke-dasharray="3,2"/>';
        s += '<circle cx="' + PX(n) + '" cy="' + PY(X[n]) + '" r="5" fill="#d6465f"/>';
        s += '<circle cx="' + PX(n) + '" cy="' + PY(cur) + '" r="4" fill="#555"/>';
      }
      // bits
      s += '<rect x="' + x0 + '" y="' + (y0 + 14) + '" width="' + (15 * dx) + '" height="26" fill="#fff36b" stroke="#333"/>';
      for (var b = 0; b < bits.length; b++) {
        s += '<text x="' + (PX(b) + dx / 2) + '" y="' + (y0 + 33) + '" text-anchor="middle" font-size="15" font-weight="700" fill="' + (b === n ? "#1d65b3" : "#d6465f") + '">' + bits.charAt(b) + "</text>";
      }
      s += '<text x="' + (W - 8) + '" y="16" text-anchor="end" fill="#555">빨강 = 원 신호 · 회색 계단 = 복원 신호 · 한 칸 = T</text>';
      s += "</svg>";
      return s;
    };
  }

  global.SIMS["delta_modulation"] = {
    title: "Delta modulation — 계단으로 곡선 따라가기 (L3 p.65)",
    desc: "[[delta modulation]] 은 샘플 값 대신 '''직전 값보다 올랐나 내렸나''' 1비트만 보낸다: 매 T 마다 곡선을 계단과 비교해 곡선이 위면 '''1 (+d)''', 아래면 '''0 (−d)'''. 슬라이드 그림의 비트열 0 1 1 1 1 1 1 0 0 0 0 0 0 1 1 을 재현한다.",
    options: [],
    build: function () {
      var lines = [
        "시작: 계단(복원 값) s = 1d, step size d, 주기 T",
        "매 T: 원 신호(곡선) 샘플 x 를 계단 값 s 와 비교",
        "x > s (곡선이 위) → 비트 1, 계단 s ← s + d",
        "x < s (곡선이 아래) → 비트 0, 계단 s ← s − d",
        "비트를 출력열에 붙이고 다음 T 로",
        "끝: 비트열 = 0 1 1 1 1 1 1 0 0 0 0 0 0 1 1"
      ];
      var steps = [];
      var stairs = [];
      var bits = "";
      var s = S0;
      function vars(n, cmp, bit, sNew) {
        return {
          n: n < 0 ? "–" : String(n + 1) + " / 15", t: n < 0 ? "–" : n + "T",
          x: n < 0 ? "–" : fmt(X[n]) + "d", s: fmt(s) + "d",
          cmp: cmp || "–", bit: bit === undefined ? "–" : bit, snew: sNew === undefined ? "–" : fmt(sNew) + "d",
          bits: bits ? bits.split("").join(" ") : "–"
        };
      }
      steps.push({
        desc: "시작: 복원 계단의 기준값 '''s = 1d'''. [[PCM]] 은 샘플마다 n_b 비트를 보내지만, delta modulation 은 '''변화 방향 1비트''' 만 보낸다 (DM encodes the change from the previous sample). 곡선 값은 그림을 재현하도록 정한 예시값(d 단위).",
        pc: { P: 1 }, vars: vars(-1), status: { P: "running" }, svg: svgFor(-1, 0, [], "")
      });
      for (var n = 0; n < X.length; n++) {
        var up = X[n] > s;
        var cmp = fmt(X[n]) + "d " + (up ? ">" : "<") + " " + fmt(s) + "d";
        steps.push({
          desc: "t = " + n + "T: 곡선 x = " + fmt(X[n]) + "d, 계단 s = " + fmt(s) + "d → '''" + cmp + "''' (곡선이 계단보다 " + (up ? "'''위'''" : "'''아래'''") + ").",
          pc: { P: 2 }, vars: vars(n, cmp), status: { P: "running" }, svg: svgFor(n, 1, stairs.slice(), bits)
        });
        var bit = up ? "1" : "0";
        var sNew = up ? s + 1 : s - 1;
        bits += bit;
        stairs.push(sNew);
        var v = vars(n, cmp, bit, sNew);
        s = sNew;
        v.s = fmt(s) + "d";
        var extra = "";
        if (n === 6) extra = " 곡선의 꼭대기 근처 — 계단이 곡선을 넘어섰으니 다음부터는 0 이 나온다.";
        if (n === 12) extra = " 계단이 바닥(0)까지 내려왔다. 곡선은 바닥에서 거의 평평 → 다시 1 이 나오기 시작.";
        steps.push({
          desc: (up ? "곡선이 위 → '''비트 1''', 계단을 '''+d''' 올린다" : "곡선이 아래 → '''비트 0''', 계단을 '''−d''' 내린다") + " (s = " + fmt(sNew) + "d)." + extra,
          pc: { P: up ? 3 : 4 }, vars: v, status: { P: "running" }, svg: svgFor(n, 2, stairs.slice(), bits)
        });
      }
      var fin = vars(-1);
      fin.n = "15 / 15 (끝)";
      steps.push({
        desc: "완료. 생성된 비트열 '''" + bits.split("").join(" ") + "''' — 슬라이드 그림과 같다" + (bits === EXPECT ? "" : " (불일치!)") + ". 수신자는 같은 규칙(1 이면 +d, 0 이면 −d)으로 계단을 다시 쌓아 원 신호를 근사한다.",
        pc: { P: 6 }, vars: fin, status: { P: "done" }, svg: svgFor(-1, 0, stairs.slice(), bits),
        note: "계단은 한 번에 d 씩만 움직이므로 곡선이 d/T 보다 빨리 변하면 따라가지 못하고(slope overload), 곡선이 평평하면 계단이 위아래로 흔들린다(granular noise). d 가 작을수록 정밀하지만 급변을 못 따라간다."
      });
      return {
        panels: [{ id: "P", title: "DM encoder 절차", lang: "txt", lines: lines }],
        vars: [
          { name: "n", label: "샘플", group: "현재" },
          { name: "t", label: "시각 t", group: "현재" },
          { name: "x", label: "곡선값 x", group: "현재" },
          { name: "s", label: "계단값 s", group: "현재" },
          { name: "cmp", label: "비교", group: "현재" },
          { name: "bit", label: "비트", group: "현재" },
          { name: "snew", label: "새 계단값", group: "현재" },
          { name: "bits", label: "출력 비트열", group: "출력" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
