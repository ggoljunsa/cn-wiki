window.SIMS = window.SIMS || {};
// aloha_throughput — L6 p.29 Example 3.11 (slotted) + 같은 조건의 pure ALOHA 비교
(function (global) {
  "use strict";

  var RATES = {
    a: { rate: 1000, G: 1, Gs: "1" },
    b: { rate: 500, G: 0.5, Gs: "1/2" },
    c: { rate: 250, G: 0.25, Gs: "1/4" }
  };
  // 슬라이드/교재 풀이 값 그대로 (S 는 소수 셋째 자리, 생존 프레임은 교재 값)
  var RESULT = {
    slotted: { a: { S: "0.368", N: 368 }, b: { S: "0.303", N: 151 }, c: { S: "0.195", N: 49 } },
    pure: { a: { S: "0.135", N: 135 }, b: { S: "0.184", N: 92 }, c: { S: "0.152", N: 38 } }
  };

  var LINES = [
    "T_fr = frame 크기 / bandwidth",
    "G = (초당 frame 수) × T_fr   // T_fr 동안 평균 몇 개?",
    "slotted: S = G · e^(−G)     |  pure: S = G · e^(−2G)",
    "S 에 G 값을 대입",
    "생존 frame 수 = (초당 frame 수) × S"
  ];

  function sFun(proto, G) { return proto === "pure" ? G * Math.exp(-2 * G) : G * Math.exp(-G); }

  global.SIMS["aloha_throughput"] = {
    title: "ALOHA throughput — Example 3.11 (frames/s → G → S)",
    desc: "L6 p.29. 200-bit frame, 200 kbps 공유 채널. 초당 frame 수로 [[offered load G|G]] 를 구하고 " +
      "[[slotted ALOHA]] S = G·e^(−G) (또는 pure S = G·e^(−2G)) 에 넣어 살아남는 frame 수를 구한다. [[T_fr]] 가 G 의 단위 시간.",
    options: [
      { key: "rate", label: "부하", values: [
        { value: "a", label: "a. 1000 frames/s" },
        { value: "b", label: "b. 500 frames/s" },
        { value: "c", label: "c. 250 frames/s" }
      ] },
      { key: "protocol", label: "프로토콜", values: [
        { value: "slotted", label: "slotted ALOHA (Ex 3.11)" },
        { value: "pure", label: "pure ALOHA (비교)" }
      ] }
    ],
    build: function (opts) {
      var key = RATES[opts.rate] ? opts.rate : "a";
      var proto = opts.protocol === "pure" ? "pure" : "slotted";
      var R = RATES[key], res = RESULT[proto][key];
      var steps = [];
      var st = { size: "200 bits", bw: "200 kbps", rate: R.rate + " frames/s", Tfr: "?", G: "?", formula: "?", S: "?", N: "?" };
      var showPt = false;

      function snap() {
        return { size: st.size, bw: st.bw, rate: st.rate, Tfr: st.Tfr, G: st.G, formula: st.formula, S: st.S, N: st.N };
      }
      function svg() {
        var pt = showPt;
        return function () {
          var W = 520, H = 250, x0 = 56, y0 = 210, gx = 150, gy = 440; // G 0..3, S 0..0.4
          function X(g) { return x0 + g * gx; }
          function Y(v) { return y0 - v * gy; }
          var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="11">';
          s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
          // 축
          s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + X(3) + '" y2="' + y0 + '" stroke="#333"/>';
          s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + Y(0.4) + '" stroke="#333"/>';
          [0, 0.5, 1, 1.5, 2, 2.5, 3].forEach(function (g) {
            s += '<text x="' + X(g) + '" y="' + (y0 + 14) + '" text-anchor="middle" fill="#555">' + g + "</text>";
          });
          [0.1, 0.2, 0.3, 0.4].forEach(function (v) {
            s += '<line x1="' + x0 + '" y1="' + Y(v) + '" x2="' + X(3) + '" y2="' + Y(v) + '" stroke="#eee"/>';
            s += '<text x="' + (x0 - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end" fill="#555">' + v.toFixed(1) + "</text>";
          });
          s += '<text x="' + X(3) + '" y="' + (y0 + 30) + '" text-anchor="end" fill="#333">G (offered load)</text>';
          s += '<text x="14" y="' + Y(0.4) + '" fill="#333">S</text>';
          // 곡선
          ["slotted", "pure"].forEach(function (p) {
            var d = "";
            for (var i = 0; i <= 120; i++) {
              var g = i * 3 / 120;
              d += (i ? " L" : "M") + X(g).toFixed(1) + " " + Y(sFun(p, g)).toFixed(1);
            }
            var active = p === proto;
            s += '<path d="' + d + '" fill="none" stroke="' + (p === "slotted" ? "#1c7ed6" : "#e8590c") + '" stroke-width="' + (active ? 2.5 : 1.2) + '"' + (active ? "" : ' stroke-dasharray="4 3"') + "/>";
          });
          s += '<text x="' + X(1.75) + '" y="' + Y(0.385) + '" fill="#1c7ed6">slotted: Ge^(−G), max 0.368 @ G=1</text>';
          s += '<text x="' + X(1.75) + '" y="' + Y(0.13) + '" fill="#e8590c">pure: Ge^(−2G), max 0.184 @ G=1/2</text>';
          if (pt) {
            var Sv = sFun(proto, R.G);
            s += '<line x1="' + X(R.G) + '" y1="' + y0 + '" x2="' + X(R.G) + '" y2="' + Y(Sv) + '" stroke="#999" stroke-dasharray="3 3"/>';
            s += '<circle cx="' + X(R.G) + '" cy="' + Y(Sv) + '" r="6" fill="#fcc419" stroke="#333"/>';
            s += '<text x="' + (X(R.G) + 10) + '" y="' + (Y(Sv) - 6) + '" font-weight="700" font-size="12">G=' + R.Gs + ", S=" + res.S + "</text>";
          }
          s += "</svg>";
          return s;
        };
      }
      function push(desc, line, note) {
        steps.push({ desc: desc, pc: { P: line }, vars: snap(), note: note, svg: svg() });
      }

      push("Example 3.11: 200-bit frame, 200 kbps 공유 채널, 시스템 전체가 초당 '''" + R.rate + "''' frame 을 만든다 (" + key + "). " +
        (proto === "slotted" ? "slotted ALOHA." : "같은 조건을 '''pure ALOHA''' 로 바꿔 비교한다 (슬라이드가 'previous exercise' 라 부르는 교재 Example 3.10 — 슬라이드에는 없음)."), 1);
      st.Tfr = "1 ms";
      push("[[T_fr]] = 200 bits / 200 kbps = 200 / 200,000 s = '''1 ms'''. frame 하나를 내보내는 데 1 ms.", 1);
      st.G = R.G;
      push("[[offered load G|G]] = " + R.rate + " frames/s × 1 ms = " + (R.rate / 1000) + " → '''G = " + R.Gs + "'''. " +
        "T_fr 한 칸(1 ms) 동안 평균 " + R.Gs + " 개의 frame 이 전송을 시도한다는 뜻.", 2);
      st.formula = proto === "slotted" ? "S = G·e^(−G)" : "S = G·e^(−2G)";
      push("throughput 공식: " + (proto === "slotted"
        ? "[[slotted ALOHA]] 는 vulnerable time 이 T_fr 이므로 '''S = G·e^(−G)'''."
        : "pure ALOHA 는 vulnerable time 이 2T_fr 이므로 '''S = G·e^(−2G)'''."), 3);
      st.S = res.S;
      showPt = true;
      var expr = proto === "slotted" ? R.Gs + " × e^(−" + R.Gs + ")" : R.Gs + " × e^(−2×" + R.Gs + ")";
      push("S = " + expr + " = '''" + res.S + "''' (" + (parseFloat(res.S) * 100).toFixed(1) + " %). 그래프의 노란 점.", 4,
        (proto === "slotted" && key === "a") ? "G = 1 은 slotted ALOHA 의 최대 throughput 지점 (S_max = 0.368)." :
          (proto === "pure" && key === "b") ? "G = 1/2 는 pure ALOHA 의 최대 throughput 지점 (S_max = 0.184)." : null);
      st.N = res.N;
      var note = null;
      if (proto === "slotted" && (key === "a" || key === "b")) {
        note = "슬라이드 풀이의 '" + R.rate + " × 0.0" + res.S.slice(2) + "' 은 교재 오타 — 실제로는 " + R.rate + " × " + res.S + " 이다.";
      }
      if (proto === "slotted" && key === "b") note += " 500 × 0.303 = 151.5 → 교재는 151 로 적었다.";
      push("생존 frame = " + R.rate + " × " + res.S + " ≈ '''" + res.N + " frames/s'''. " + R.rate + " 개 중 " + res.N + " 개만 살아남는다." +
        (proto === "pure" ? " (slotted 였다면 " + RESULT.slotted[key].N + " 개.)" : " (pure 였다면 " + RESULT.pure[key].N + " 개.)"), 5, note);

      return {
        panels: [{ id: "P", title: "손으로 푸는 순서", lang: "txt", lines: LINES }],
        vars: [
          { name: "size", label: "frame 크기", group: "주어진 값" },
          { name: "bw", label: "bandwidth", group: "주어진 값" },
          { name: "rate", label: "부하", group: "주어진 값" },
          { name: "Tfr", label: "T_fr", group: "계산" },
          { name: "G", label: "G", group: "계산" },
          { name: "formula", label: "공식", group: "계산" },
          { name: "S", label: "S (throughput)", group: "계산" },
          { name: "N", label: "생존 frame/s", group: "계산" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
