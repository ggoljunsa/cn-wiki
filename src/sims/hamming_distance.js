window.SIMS = window.SIMS || {};
// hamming_distance — L5 Ex 3.2 (XOR 로 d 계산) → Ex 3.3 (코드표 모든 쌍 → d_min)
(function (global) {
  "use strict";

  var CODES = {
    ex31: { label: "Ex 3.1 C(3,2)", words: ["000", "011", "101", "110"],
      src: "Ex 3.1 (k = 2, n = 3) 의 codeword 4개" },
    parity: { label: "parity C(5,4) 일부", words: ["00000", "00011", "00101", "00110", "01001"],
      src: "p.38 parity-check code C(5,4) 표의 앞 5개 (dataword 0000~0100)" }
  };

  var LINES = [
    "d(x, y) = (x ⊕ y) 의 1 개수",
    "Ex 3.2 ①: d(000, 011)",
    "Ex 3.2 ②: d(10101, 11110)",
    "Ex 3.3: 코드표의 모든 codeword 쌍 (x, y) 에 대해",
    "  x ⊕ y 를 비트별로 계산",
    "  1 을 세어 d(x, y), 지금까지 최소와 비교",
    "d_min = 모든 쌍 중 가장 작은 d",
    "검출 보장 오류 수 s = d_min − 1"
  ];

  function xor(a, b) {
    var r = "";
    for (var i = 0; i < a.length; i++) r += a[i] === b[i] ? "0" : "1";
    return r;
  }
  function ones(s) { return s.split("").filter(function (c) { return c === "1"; }).length; }

  global.SIMS["hamming_distance"] = {
    title: "Hamming distance — XOR 하고 1 세기, 그리고 d_min",
    desc: "L5 p.28–30. 두 word 의 [[Hamming distance]] 는 서로 다른 비트 수 = x ⊕ y 의 1 개수. " +
      "코드표의 '''모든 쌍'''에 대해 구한 d 중 최솟값이 [[minimum Hamming distance]] d_min 이다.",
    options: [
      { key: "code", label: "코드표", values: [
        { value: "ex31", label: CODES.ex31.label },
        { value: "parity", label: CODES.parity.label }
      ] }
    ],
    build: function (opts) {
      var code = CODES[opts.code] || CODES.ex31;
      var steps = [];
      var st = { x: "-", y: "-", z: "-", d: "-", min: "-", pairs: "-", dmin: "?" };
      var done = [];   // 코드표 쌍 결과 [{x,y,d}]

      function snap() {
        return { x: st.x, y: st.y, z: st.z, d: st.d, min: st.min, pairs: st.pairs, dmin: st.dmin };
      }
      function svg(showXor) {
        var x = st.x, y = st.y, doneSnap = done.slice(), min = st.min;
        return function () {
          var W = 560, H = 230;
          var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
          s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
          if (x !== "-") {
            var z = xor(x, y);
            var rows = [["x", x], ["y", y]];
            if (showXor) rows.push(["x ⊕ y", z]);
            rows.forEach(function (r, ri) {
              var yy = 20 + ri * 36;
              s += '<text x="70" y="' + (yy + 19) + '" text-anchor="end" font-weight="700" fill="#333">' + r[0] + "</text>";
              r[1].split("").forEach(function (b, i) {
                var diff = z[i] === "1";
                var fill = ri === 2 ? (b === "1" ? "#ffd8a8" : "#f1f3f5") : (diff && showXor ? "#ffe3e3" : "#d6ecf7");
                s += '<rect x="' + (82 + i * 30) + '" y="' + yy + '" width="26" height="28" rx="3" fill="' + fill + '" stroke="' + (ri === 2 && b === "1" ? "#e8590c" : "#89a") + '"/>';
                s += '<text x="' + (95 + i * 30) + '" y="' + (yy + 19) + '" text-anchor="middle" font-family="monospace" font-size="15"' +
                  (ri === 2 && b === "1" ? ' font-weight="700" fill="#d9480f"' : ' fill="#222"') + ">" + b + "</text>";
              });
            });
            if (showXor) {
              s += '<text x="' + (92 + x.length * 30) + '" y="' + (20 + 2 * 36 + 19) + '" font-weight="700" fill="#d9480f">→ 1 이 ' + ones(z) + "개 = d</text>";
            }
          }
          // 쌍 표
          if (doneSnap.length) {
            s += '<text x="300" y="30" font-weight="700" fill="#333">코드표 쌍별 d</text>';
            doneSnap.forEach(function (p, i) {
              var yy = 48 + i * 17;
              var isMin = p.d === min;
              s += '<text x="300" y="' + yy + '" font-family="monospace" font-size="12" fill="' + (isMin ? "#c92a2a" : "#333") + '"' + (isMin ? ' font-weight="700"' : "") + ">" +
                "d(" + p.x + ", " + p.y + ") = " + p.d + (isMin ? "  ◀ 최소" : "") + "</text>";
            });
          }
          s += "</svg>";
          return s;
        };
      }
      function push(desc, line, showXor, note) {
        steps.push({ desc: desc, pc: { H: line }, vars: snap(), note: note, svg: svg(showXor) });
      }

      push("정의부터: [[Hamming distance]] d(x, y) = 같은 길이의 두 word 에서 '''대응 비트가 다른 개수'''. " +
        "비트가 다르면 XOR 이 1, 같으면 0 이므로 d(x, y) = (x ⊕ y) 의 1 개수.", 1, false);

      // Ex 3.2
      [["000", "011", "①"], ["10101", "11110", "②"]].forEach(function (p, k) {
        st.x = p[0]; st.y = p[1]; st.z = "-"; st.d = "-";
        push("Ex 3.2 " + p[2] + ": x = `" + p[0] + "`, y = `" + p[1] + "` 를 위아래로 맞춘다.", 2 + k, false);
        st.z = xor(p[0], p[1]); st.d = ones(st.z);
        push("비트별 XOR → `" + st.z + "`. 1 이 " + st.d + "개이므로 '''d(" + p[0] + ", " + p[1] + ") = " + st.d + "'''.", 2 + k, true);
      });

      // Ex 3.3 코드표
      var W = code.words;
      st.x = "-"; st.y = "-"; st.z = "-"; st.d = "-"; st.pairs = 0;
      push("Ex 3.3: 이제 코드표 " + code.src + " `{" + W.join(", ") + "}` 에서 '''가능한 모든 쌍'''을 비교한다. " +
        "codeword 가 " + W.length + "개이므로 쌍은 " + W.length + "×" + (W.length - 1) + "/2 = " + (W.length * (W.length - 1) / 2) + "개.", 4, false);
      for (var a = 0; a < W.length; a++) {
        for (var b = a + 1; b < W.length; b++) {
          st.x = W[a]; st.y = W[b]; st.z = xor(W[a], W[b]); st.d = ones(st.z);
          st.pairs++;
          var newMin = st.min === "-" || st.d < st.min;
          if (newMin) st.min = st.d;
          done.push({ x: W[a], y: W[b], d: st.d });
          push("d(" + W[a] + ", " + W[b] + "): XOR = `" + st.z + "` → d = " + st.d + ". " +
            (newMin ? "지금까지 최소 → '''" + st.min + "'''." : "최소(" + st.min + ")는 그대로."), 6, true);
        }
      }
      st.x = "-"; st.y = "-"; st.z = "-"; st.d = "-";
      st.dmin = st.min;
      var ex31 = opts.code !== "parity";
      push("모든 쌍 비교 끝: '''d_min = " + st.dmin + "'''." +
        (ex31 ? " (Ex 3.3: \"The minimum Hamming distance for our first code scheme is 2.\")" : ""), 7, false);
      push("d_min = s + 1 이므로 s = d_min − 1 = " + (st.dmin - 1) + " → 이 코드는 '''single-bit error 검출만 보장'''한다. " +
        "오류 2개면 다른 valid codeword 가 되어 검출을 놓칠 수 있다 (예: " + (ex31 ? "101 → 011" : "00000 → 00011") + ").", 8, false,
        !ex31 ? "parity-check code 는 linear block code 라 0 이 아닌 codeword 의 최소 weight 로도 바로 d_min = 2 를 얻는다 (00011 의 1 개수 = 2)." : null);

      return {
        panels: [{ id: "H", title: "손으로 푸는 순서", lang: "txt", lines: LINES }],
        vars: [
          { name: "x", label: "x", group: "현재 쌍" },
          { name: "y", label: "y", group: "현재 쌍" },
          { name: "z", label: "x ⊕ y", group: "현재 쌍" },
          { name: "d", label: "d(x, y)", group: "현재 쌍" },
          { name: "pairs", label: "비교한 쌍 수", group: "코드표" },
          { name: "min", label: "현재 최소", group: "코드표" },
          { name: "dmin", label: "d_min", group: "코드표" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
