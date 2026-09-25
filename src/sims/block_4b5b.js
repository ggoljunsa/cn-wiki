// block_4b5b — L3 p.46–47 (L4 p.13–14 복습): 4B/5B mapping 으로 0 연속을 없애 NRZ-I 동기 문제 해결
window.SIMS = window.SIMS || {};
(function (global) {
  "use strict";

  // L3 p.47 4B/5B Mapping Code (Data Sequence → Encoded Sequence)
  var TABLE = [
    ["0000", "11110"], ["0001", "01001"], ["0010", "10100"], ["0011", "10101"],
    ["0100", "01010"], ["0101", "01011"], ["0110", "01110"], ["0111", "01111"],
    ["1000", "10010"], ["1001", "10011"], ["1010", "10110"], ["1011", "10111"],
    ["1100", "11010"], ["1101", "11011"], ["1110", "11100"], ["1111", "11101"]
  ];

  function maxZeros(bits) {
    var m = 0, c = 0;
    for (var i = 0; i < bits.length; i++) {
      if (bits.charAt(i) === "0") { c++; if (c > m) m = c; } else c = 0;
    }
    return m;
  }

  // NRZ-I: 1 이면 레벨 반전, 0 이면 유지. 시작 레벨 = high
  function nrziPath(bits, x0, y, dx, amp) {
    var lvl = 1, d = "M " + x0 + " " + (y - amp);
    for (var i = 0; i < bits.length; i++) {
      var x = x0 + i * dx;
      if (bits.charAt(i) === "1") { lvl = -lvl; d += " L " + x + " " + (y - lvl * amp); }
      d += " L " + (x + dx) + " " + (y - lvl * amp);
    }
    return d;
  }

  function svgFor(input, output, curGroup) {
    return function () {
      var W = 640, H = 250, x0 = 90;
      var total = input.length / 4 * 5;
      var dx = Math.min(28, (W - x0 - 20) / total);
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
      // input
      s += '<text x="10" y="34" fill="#555">입력 (4b)</text>';
      var dxi = dx * 5 / 4;
      for (var i = 0; i < input.length; i++) {
        var g = Math.floor(i / 4);
        var x = x0 + i * dxi;
        s += '<rect x="' + x + '" y="18" width="' + (dxi - 2) + '" height="22" rx="3" fill="' + (g === curGroup ? "#fdeec2" : "#f4f4f4") + '" stroke="' + (g === curGroup ? "#e09a40" : "#ccc") + '"/>';
        s += '<text x="' + (x + dxi / 2 - 1) + '" y="34" text-anchor="middle" font-family="monospace" font-weight="700">' + input.charAt(i) + "</text>";
      }
      s += '<path d="' + nrziPath(input, x0, 75, dxi, 14) + '" fill="none" stroke="#d6465f" stroke-width="2"/>';
      s += '<text x="10" y="80" fill="#d6465f" font-size="11">NRZ-I (입력)</text>';
      // output
      s += '<text x="10" y="134" fill="#555">출력 (5b)</text>';
      for (var j = 0; j < output.length; j++) {
        var g2 = Math.floor(j / 5);
        var xo = x0 + j * dx;
        s += '<rect x="' + xo + '" y="118" width="' + (dx - 2) + '" height="22" rx="3" fill="' + (g2 === curGroup ? "#dff3e4" : "#eef4fb") + '" stroke="' + (g2 === curGroup ? "#2e9e4f" : "#9bb7d8") + '"/>';
        s += '<text x="' + (xo + dx / 2 - 1) + '" y="134" text-anchor="middle" font-family="monospace" font-weight="700">' + output.charAt(j) + "</text>";
      }
      if (output.length) {
        s += '<path d="' + nrziPath(output, x0, 180, dx, 14) + '" fill="none" stroke="#1d65b3" stroke-width="2"/>';
      }
      s += '<text x="10" y="185" fill="#1d65b3" font-size="11">NRZ-I (출력)</text>';
      s += '<text x="' + (W / 2) + '" y="230" text-anchor="middle" fill="#333">최대 연속 0 — 입력: ' + maxZeros(input) + " 개 → 출력: " + maxZeros(output) + " 개 (NRZ-I 는 0 이면 전이 없음)</text>";
      s += "</svg>";
      return s;
    };
  }

  global.SIMS["block_4b5b"] = {
    title: "4B/5B block coding — 4비트를 5비트로",
    desc: "[[4B/5B]]: 입력을 4비트씩 잘라 p.47 표에서 5비트 codeword 로 바꾼다. [[NRZ-I]] 는 0 이 길게 이어지면 신호가 평평해져 동기를 잃으므로, 0 이 길게 이어지지 않는 5비트 패턴만 골라 쓴 것이 [[block coding]] 의 요점.",
    options: [
      { key: "input", label: "입력", values: [
        { value: "00000001", label: "0000 0001" },
        { value: "000000000000", label: "0000 0000 0000" }
      ] }
    ],
    build: function (opts) {
      var input = opts.input === "000000000000" ? "000000000000" : "00000001";
      var groups = [];
      for (var i = 0; i < input.length; i += 4) groups.push(input.substr(i, 4));
      var tableLines = TABLE.map(function (r) { return r[0] + " → " + r[1]; });
      var procLines = [
        "입력을 4비트 그룹으로 자른다",
        "그룹을 4B/5B 표(Data Sequence)에서 찾는다",
        "Encoded Sequence(5비트)를 출력에 붙인다",
        "모든 그룹 끝 → 출력 길이 = 입력 × 5/4",
        "검사: 출력에서 0 이 최대 몇 개 연속?"
      ];
      var steps = [];
      var out = "";
      function vars(cur, code) {
        return {
          input: groups.join(" "), groups: String(groups.length) + " 개",
          cur: cur || "–", code: code || "–",
          output: out ? out.match(/.{1,5}/g).join(" ") : "–",
          len: input.length + " → " + out.length + " bits",
          zin: maxZeros(input) + " 개", zout: out ? maxZeros(out) + " 개" : "–"
        };
      }
      steps.push({
        desc: "입력 '''" + input + "''' (" + input.length + " bits) 를 4비트씩 자른다 → " + groups.join(" / ") + ". 입력에는 0 이 '''" + maxZeros(input) + " 개''' 연속 — [[NRZ-I]] 로 보내면 그 구간 동안 전이가 전혀 없어 수신자가 비트 경계를 잃는다(빨간 파형).",
        pc: { P: 1, T: null }, vars: vars(), status: { P: "running" }, svg: svgFor(input, out, -1)
      });
      groups.forEach(function (g, k) {
        var idx = parseInt(g, 2);
        var code = TABLE[idx][1];
        steps.push({
          desc: "그룹 " + (k + 1) + ": '''" + g + "''' 를 표에서 찾는다 → " + (idx + 1) + "번째 행.",
          pc: { P: 2, T: idx + 1 }, vars: vars(g, "?"), status: { P: "running" }, svg: svgFor(input, out, k)
        });
        out += code;
        steps.push({
          desc: "'''" + g + " → " + code + "'''. 5비트 codeword 를 출력에 붙인다. " +
            (g === "0000" ? "데이터 0000 이 '''11110''' 이 되어 오히려 1 이 네 개다 — 전이가 생긴다." : "0 연속이 길어지지 않는다."),
          pc: { P: 3, T: idx + 1 }, vars: vars(g, code), status: { P: "running" }, svg: svgFor(input, out, k)
        });
      });
      steps.push({
        desc: "모든 그룹 변환 끝. 출력 = '''" + out.match(/.{1,5}/g).join(" ") + "''' (" + out.length + " bits). 4비트마다 1비트가 늘어 '''25% overhead''' — 그 대가로 동기를 얻는다.",
        pc: { P: 4, T: null }, vars: vars(), status: { P: "running" }, svg: svgFor(input, out, -1)
      });
      steps.push({
        desc: "검사: 입력의 최대 연속 0 은 '''" + maxZeros(input) + " 개''', 출력의 최대 연속 0 은 '''" + maxZeros(out) + " 개'''. 파란 NRZ-I 파형에는 이제 전이가 자주 나타난다.",
        pc: { P: 5, T: null }, vars: vars(), status: { P: "done" }, svg: svgFor(input, out, -1),
        note: "출력에 0 이 최대 몇 개 연속? → 이 입력에서는 '''" + maxZeros(out) + " 개'''. 4B/5B 의 모든 데이터 codeword 는 앞쪽 0 이 1개 이하, 뒤쪽 0 이 2개 이하가 되도록 골랐기 때문에, 어떤 입력이든 출력의 0 연속은 '''최대 3개''' 다 → NRZ-I 의 long-0s 동기 문제 해결."
      });
      return {
        panels: [
          { id: "P", title: "절차", lang: "txt", lines: procLines },
          { id: "T", title: "4B/5B Mapping Code (L3 p.47)", lang: "txt", lines: tableLines }
        ],
        vars: [
          { name: "input", label: "입력 (4비트 그룹)", group: "입력" },
          { name: "groups", label: "그룹 수", group: "입력" },
          { name: "cur", label: "현재 그룹", group: "변환" },
          { name: "code", label: "5비트 codeword", group: "변환" },
          { name: "output", label: "출력", group: "출력" },
          { name: "len", label: "길이", group: "출력" },
          { name: "zin", label: "입력 최대 연속 0", group: "검사" },
          { name: "zout", label: "출력 최대 연속 0", group: "검사" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
