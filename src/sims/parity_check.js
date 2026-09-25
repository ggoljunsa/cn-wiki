window.SIMS = window.SIMS || {};
// parity_check — L5 p.42 Example 3.7: simple parity-check code C(5,4) 의 다섯 경우
(function (global) {
  "use strict";

  var CASES = {
    "1": { rx: "10111", what: "No error — 오류 없음" },
    "2": { rx: "10011", what: "a₁ 한 비트 오류 (single-bit error)" },
    "3": { rx: "10110", what: "r₀ 한 비트 오류 — dataword 비트는 멀쩡함" },
    "4": { rx: "00110", what: "r₀ 와 a₃ 두 비트 오류" },
    "5": { rx: "01011", what: "a₃, a₂, a₁ 세 비트 오류" }
  };
  var NAMES_TX = ["a₃", "a₂", "a₁", "a₀", "r₀"];
  var NAMES_RX = ["b₃", "b₂", "b₁", "b₀", "q₀"];

  var ENC = [
    "dataword a₃a₂a₁a₀ = 1011",
    "r₀ = a₃ + a₂ + a₁ + a₀  (mod 2)",
    "codeword = a₃a₂a₁a₀ r₀  → 채널로 전송"
  ];
  var DEC = [
    "수신 codeword b₃b₂b₁b₀ q₀",
    "s₀ = b₃ + b₂ + b₁ + b₀ + q₀  (mod 2)",
    "s₀ == 0 → dataword b₃b₂b₁b₀ accept",
    "s₀ == 1 → discard (dataword 만들지 않음)"
  ];

  function sum(bits) { return bits.split("").reduce(function (a, c) { return a + (c === "1" ? 1 : 0); }, 0); }

  global.SIMS["parity_check"] = {
    title: "parity-check code — Example 3.7 다섯 경우",
    desc: "L5 p.42. 송신자는 dataword 1011 에 parity bit r₀ 를 붙여 1 의 개수를 짝수로 만든다(10111). " +
      "수신자는 5비트를 모두 더한 [[syndrome]] s₀ 로 accept/discard 를 정한다. 짝수 개 오류는 서로 상쇄되어 못 잡는다.",
    options: [
      { key: "case", label: "case", values: [
        { value: "1", label: "1: 10111 (오류 없음)" },
        { value: "2", label: "2: 10011 (a₁ 오류)" },
        { value: "3", label: "3: 10110 (r₀ 오류)" },
        { value: "4", label: "4: 00110 (2비트 오류)" },
        { value: "5", label: "5: 01011 (3비트 오류)" }
      ] }
    ],
    build: function (opts) {
      var cs = CASES[opts["case"]] || CASES["1"];
      var caseNo = CASES[opts["case"]] ? opts["case"] : "1";
      var data = "1011";
      var steps = [];
      var st = { a: data, r0: "?", tx: "?", rx: "?", flips: "?", s0: "?", verdict: "?" };

      function snap() {
        return { a: st.a, r0: st.r0, tx: st.tx, rx: st.rx, flips: st.flips, s0: st.s0, verdict: st.verdict };
      }
      function svg() {
        var tx = st.tx, rx = st.rx, s0 = st.s0, verdict = st.verdict;
        return function () {
          var W = 560, H = 200;
          var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
          s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
          function row(y, label, bits, names, ref) {
            s += '<text x="98" y="' + (y + 22) + '" text-anchor="end" font-weight="700" fill="#333">' + label + "</text>";
            for (var i = 0; i < 5; i++) {
              var b = bits === "?" ? "?" : bits[i];
              var bad = ref && ref !== "?" && bits !== "?" && ref[i] !== bits[i];
              var fill = i === 4 ? "#ffe8cc" : "#d6ecf7";
              if (bad) fill = "#ffc9c9";
              s += '<rect x="' + (110 + i * 40) + '" y="' + y + '" width="36" height="32" rx="3" fill="' + fill + '" stroke="' + (bad ? "#c92a2a" : "#89a") + '" stroke-width="' + (bad ? 2 : 1) + '"/>';
              s += '<text x="' + (128 + i * 40) + '" y="' + (y + 22) + '" text-anchor="middle" font-family="monospace" font-size="16"' +
                (bad ? ' fill="#c92a2a" font-weight="700"' : ' fill="#222"') + ">" + b + "</text>";
              s += '<text x="' + (128 + i * 40) + '" y="' + (y - 4) + '" text-anchor="middle" font-size="10" fill="#777">' + names[i] + "</text>";
            }
          }
          row(22, "송신 codeword", tx, NAMES_TX, null);
          s += '<text x="220" y="80" text-anchor="middle" fill="#888">↓ 채널 (빨간 칸 = 뒤집힌 비트)</text>';
          row(100, "수신 codeword", rx, NAMES_RX, tx);
          // syndrome 박스
          var col = s0 === "?" ? "#adb5bd" : (s0 === 0 ? "#2f9e44" : "#c92a2a");
          s += '<rect x="340" y="96" width="200" height="40" rx="6" fill="#fff" stroke="' + col + '" stroke-width="2"/>';
          s += '<text x="440" y="121" text-anchor="middle" font-size="14" font-weight="700" fill="' + col + '">syndrome s₀ = ' + s0 + "</text>";
          if (verdict !== "?") {
            var wrong = verdict.indexOf("잘못") >= 0;
            s += '<text x="280" y="170" text-anchor="middle" font-size="14" font-weight="700" fill="' + (wrong ? "#c92a2a" : (s0 === 0 ? "#2f9e44" : "#555")) + '">' + verdict + "</text>";
          }
          s += "</svg>";
          return s;
        };
      }
      function push(desc, pc, status, note) {
        steps.push({ desc: desc, pc: pc, vars: snap(), status: status, note: note, svg: svg() });
      }

      push("Example 3.7: 송신자의 dataword 는 `1011` (a₃a₂a₁a₀). case " + caseNo + " = " + cs.what + ".", { E: 1, D: null }, { E: "running" });
      var r0 = sum(data) % 2;
      st.r0 = r0;
      push("r₀ = 1 + 0 + 1 + 1 = 3, mod 2 → '''r₀ = " + r0 + "'''. (1 의 개수를 짝수로 맞추는 even parity)", { E: 2, D: null }, { E: "running" });
      st.tx = data + r0;
      push("codeword = `" + st.tx + "` 을 전송한다. 1 의 개수 = 4 (짝수).", { E: 3, D: null }, { E: "done" });

      st.rx = cs.rx;
      var flips = [];
      for (var i = 0; i < 5; i++) if (st.tx[i] !== st.rx[i]) flips.push(NAMES_TX[i]);
      st.flips = flips.length ? flips.join(", ") + " (" + flips.length + "개)" : "없음";
      push("수신자가 받은 codeword = `" + st.rx + "`. 송신값과 비교하면 뒤집힌 비트: " + st.flips + ". " +
        "(수신자는 이걸 모른다 — 알 수 있는 건 syndrome 뿐.)", { E: null, D: 1 }, { E: "done", D: "running" });

      var tot = sum(st.rx);
      st.s0 = tot % 2;
      push("s₀ = " + st.rx.split("").join(" + ") + " = " + tot + ", mod 2 → '''s₀ = " + st.s0 + "'''. " +
        "(송신 때 1 의 개수를 짝수로 맞췄으니, 오류가 없으면 0 이어야 한다.)", { E: null, D: 2 }, { E: "done", D: "running" });

      var note = null;
      if (st.s0 === 0) {
        var dw = st.rx.slice(0, 4);
        if (dw === data) {
          st.verdict = "accept: dataword " + dw;
          push("syndrome 0 → dataword `" + dw + "` 를 만들어 상위 계층에 넘긴다. 정상.", { E: null, D: 3 }, { E: "done", D: "accept" });
        } else {
          st.verdict = "accept: dataword " + dw + " (잘못)";
          note = "짝수 개 오류는 검출 불가 — 두 오류가 서로 상쇄되어 syndrome 이 0 이 된다. simple parity check 의 d_min = 2 이므로 1개만 검출이 보장된다.";
          push("syndrome 0 → dataword `" + dw + "` 를 accept… 하지만 원래 dataword 는 `1011` 이다! " +
            "r₀ 와 a₃ 두 비트가 뒤집혀 1 의 개수가 여전히 짝수(2개)라서 '''wrongly created'''.", { E: null, D: 3 }, { E: "done", D: "wrong" }, note);
        }
      } else {
        st.verdict = "discard";
        var extra = caseNo === "3" ? " dataword 비트는 멀쩡했지만(r₀ 만 오류) 이 코드는 '''어느 비트가 틀렸는지 알려줄 만큼 정교하지 않아서''' 그래도 버린다."
          : (caseNo === "5" ? " 오류가 3개(홀수)여도 검출된다 — simple parity check 는 '''홀수 개''' 오류를 모두 잡는다." : " single-bit error 는 반드시 검출된다.");
        push("syndrome 1 → '''discard''' (dataword 를 만들지 않음)." + extra, { E: null, D: 4 }, { E: "done", D: "discard" });
      }

      return {
        panels: [
          { id: "E", title: "Encoder (송신자)", lang: "txt", lines: ENC },
          { id: "D", title: "Decoder (수신자)", lang: "txt", lines: DEC }
        ],
        vars: [
          { name: "a", label: "a₃a₂a₁a₀", group: "송신" },
          { name: "r0", label: "r₀", group: "송신" },
          { name: "tx", label: "송신 codeword", group: "송신" },
          { name: "rx", label: "수신 b₃b₂b₁b₀q₀", group: "수신" },
          { name: "flips", label: "뒤집힌 비트", group: "수신" },
          { name: "s0", label: "syndrome s₀", group: "수신" },
          { name: "verdict", label: "판정", group: "수신" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
