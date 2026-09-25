// db_calc — L2 p.42–46: dB = 10 log10(P2/P1). Ex 2.5 / 3구간 경로 합산 / SNR 3162 → dB
window.SIMS = window.SIMS || {};
(function (global) {
  "use strict";

  var LINES = {
    ex25: [
      "공식: dB = 10 log₁₀(P₂ / P₁)",
      "조건: P₂ = 0.5 P₁ (전력이 절반으로 줄었다)",
      "대입: 10 log₁₀(0.5 P₁ / P₁) = 10 log₁₀0.5",
      "log₁₀0.5 ≈ −0.3",
      "10 × (−0.3) = −3 dB",
      "해석: −3 dB = 전력 절반 (attenuation → 음수)"
    ],
    path: [
      "성질: dB 끼리는 더하면 된다 (log 이므로 곱 → 합)",
      "구간 1→2: 매체 attenuation −3 dB (전력 ×0.5)",
      "구간 2→3: amplifier +7 dB (전력 ×10^0.7 ≈ ×5)",
      "구간 3→4: 다시 attenuation −3 dB (전력 ×0.5)",
      "합산: −3 + 7 − 3 = +1 dB",
      "검산: 10^(1/10) ≈ 1.26 → 끝 전력 ≈ 1.26 P"
    ],
    snr: [
      "공식: SNR_dB = 10 log₁₀ SNR",
      "주어진 SNR = 3162 (Ex 2.8 전화선, 비율)",
      "대입: SNR_dB = 10 log₁₀3162",
      "log₁₀3162 ≈ 3.5 (3162 ≈ 10^3.5 = 1000 × √10)",
      "SNR_dB = 10 × 3.5 = 35 dB"
    ]
  };

  var TITLES = {
    ex25: "Example 2.5 — 전력이 절반 (L2 p.43)",
    path: "3구간 경로 −3 → +7 → −3 dB",
    snr: "SNR 3162 → dB (L2 p.46 공식)"
  };

  // bars: [{label, val, color}], val 은 P 배수(최대 3 기준)
  function barSvg(bars, caption, maxVal) {
    return function () {
      var W = 520, H = 220, base = 170, top = 30, n = bars.length;
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
      s += '<line x1="30" y1="' + base + '" x2="' + (W - 20) + '" y2="' + base + '" stroke="#555"/>';
      var gap = (W - 60) / n;
      bars.forEach(function (b, i) {
        var h = b.val === null ? 0 : (base - top) * b.val / maxVal;
        var x = 40 + i * gap + gap * 0.2, w = gap * 0.6;
        if (b.val !== null) {
          s += '<rect x="' + x + '" y="' + (base - h) + '" width="' + w + '" height="' + h + '" rx="3" fill="' + (b.color || "#1d65b3") + '" opacity="' + (b.dim ? 0.3 : 0.9) + '"/>';
          s += '<text x="' + (x + w / 2) + '" y="' + (base - h - 6) + '" text-anchor="middle" font-weight="700">' + b.text + "</text>";
        } else {
          s += '<text x="' + (x + w / 2) + '" y="' + (base - 10) + '" text-anchor="middle" fill="#aaa">?</text>';
        }
        s += '<text x="' + (x + w / 2) + '" y="' + (base + 18) + '" text-anchor="middle" fill="#555">' + b.label + "</text>";
        if (b.edge) s += '<text x="' + (x + w + gap * 0.2) + '" y="' + (base + 36) + '" text-anchor="middle" fill="' + (b.edge.charAt(0) === "+" ? "#2e9e4f" : "#d6465f") + '" font-weight="700">' + b.edge + "</text>";
      });
      s += '<text x="' + (W / 2) + '" y="18" text-anchor="middle" fill="#333" font-size="13">' + caption + "</text>";
      s += "</svg>";
      return s;
    };
  }

  global.SIMS["db_calc"] = {
    title: "데시벨(dB) 계산 — 10 log₁₀(P₂/P₁)",
    desc: "[[데시벨]] 은 두 전력의 '''비율'''을 log 로 나타낸 값. 음수면 [[attenuation]], 양수면 [[amplifier|증폭]]. 여러 구간은 dB 를 '''더하기만''' 하면 된다.",
    options: [
      { key: "case", label: "경우", values: [
        { value: "ex25", label: "Ex 2.5 (전력 절반)" },
        { value: "path", label: "3구간 경로 −3/+7/−3" },
        { value: "snr", label: "SNR 3162 → dB" }
      ] }
    ],
    build: function (opts) {
      var c = LINES[opts["case"]] ? opts["case"] : "ex25";
      var steps = [];
      var v = { P1: "–", P2: "–", ratio: "–", log: "–", seg: "–", total: "–", dB: "?" };
      var n = LINES[c].length;
      function push(pc, desc, svg, note) {
        steps.push({ desc: desc, pc: { P: pc }, vars: JSON.parse(JSON.stringify(v)), status: { P: pc === n ? "done" : "running" }, svg: svg, note: note });
      }

      if (c === "ex25") {
        var B0 = [{ label: "P₁ (보낸 쪽)", val: 1, text: "P₁" }, { label: "P₂ (받은 쪽)", val: null }];
        var B1 = [{ label: "P₁ (보낸 쪽)", val: 1, text: "P₁", edge: "" }, { label: "P₂ (받은 쪽)", val: 0.5, text: "0.5 P₁", color: "#d6465f" }];
        push(1, "공식: '''dB = 10 log₁₀(P₂/P₁)'''. P₁ 은 앞 지점, P₂ 는 뒤 지점의 전력. 절대값이 아니라 '''상대적인 세기'''를 잰다.",
          barSvg(B0, "dB = 10 log₁₀(P₂ / P₁)", 1.2));
        v.P1 = "P₁"; v.P2 = "0.5 P₁";
        push(2, "Example 2.5: 신호가 매체를 지나며 전력이 '''절반'''으로 줄었다 → P₂ = 0.5 P₁.",
          barSvg(B1, "P₂ = 0.5 P₁", 1.2));
        v.ratio = "P₂/P₁ = 0.5";
        push(3, "대입하면 P₁ 이 약분된다: 10 log₁₀(0.5 P₁ / P₁) = '''10 log₁₀0.5'''. dB 는 비율만 알면 된다.",
          barSvg(B1, "10 log₁₀(0.5)", 1.2));
        v.log = "log₁₀0.5 ≈ −0.3";
        push(4, "log₁₀0.5 = −log₁₀2 ≈ '''−0.3''' (log₁₀2 ≈ 0.301 은 외워두자).",
          barSvg(B1, "log₁₀0.5 = −log₁₀2 ≈ −0.3", 1.2));
        v.dB = "−3 dB";
        push(5, "'''10 × (−0.3) = −3 dB'''.", barSvg(B1, "10 × (−0.3) = −3 dB", 1.2));
        push(6, "슬라이드 결론: '''A loss of 3 dB (−3 dB) is equivalent to losing one-half the power.''' 음수 = [[attenuation]] (전력 손실).",
          barSvg(B1, "−3 dB ⇔ 전력 절반", 1.2),
          "−3 dB ↔ ×½, +3 dB ↔ ×2, ±10 dB ↔ ×10 / ÷10 — 이 세 쌍은 계산 없이 바로 나와야 한다.");
      } else if (c === "path") {
        var pts = ["지점 1", "지점 2", "지점 3", "지점 4"];
        var vals = [1, Math.pow(10, -0.3), Math.pow(10, 0.4), Math.pow(10, 0.1)];
        var texts = ["P", "≈0.5P", "≈2.51P", "≈1.26P"];
        var edges = ["−3 dB", "+7 dB", "−3 dB"];
        function bars(k) {
          return pts.map(function (p, i) {
            return { label: p, val: i <= k ? vals[i] : null, text: texts[i], edge: i < k ? edges[i] : "", color: i === 0 ? "#1d65b3" : (vals[i] < 1 ? "#d6465f" : "#2e9e4f") };
          });
        }
        v.P1 = "P (지점 1)"; v.total = "0 dB";
        push(1, "3구간 경로: 신호가 지점 1 → 2 → 3 → 4 로 간다. dB 는 log 이므로 전력 배수의 '''곱'''이 dB 의 '''합'''이 된다: dB_total = dB₁ + dB₂ + dB₃.",
          barSvg(bars(0), "지점 1: 전력 P, 누적 0 dB", 3));
        v.seg = "1→2: −3 dB"; v.total = "−3 dB"; v.P2 = "≈0.5 P (지점 2)";
        push(2, "구간 1→2: 전송 매체에서 [[attenuation]] '''−3 dB''' → 전력은 약 절반(0.5P).",
          barSvg(bars(1), "누적 −3 dB", 3));
        v.seg = "2→3: +7 dB"; v.total = "−3 + 7 = +4 dB"; v.P2 = "≈2.51 P (지점 3)";
        push(3, "구간 2→3: [[amplifier]] 가 '''+7 dB''' 증폭 (×10^0.7 ≈ ×5). 누적 +4 dB, 전력 약 2.51P.",
          barSvg(bars(2), "누적 +4 dB", 3));
        v.seg = "3→4: −3 dB"; v.total = "+1 dB"; v.P2 = "≈1.26 P (지점 4)";
        push(4, "구간 3→4: 다시 attenuation '''−3 dB''' → 누적 +1 dB.",
          barSvg(bars(3), "누적 +1 dB", 3));
        v.dB = "+1 dB";
        push(5, "합산: '''−3 + 7 − 3 = +1 dB'''. 각 지점의 전력을 일일이 구할 필요 없이 dB 만 더하면 된다 — 이것이 dB 를 쓰는 이유.",
          barSvg(bars(3), "−3 + 7 − 3 = +1 dB", 3));
        v.ratio = "P₄/P₁ = 10^0.1 ≈ 1.26";
        push(6, "검산: +1 dB → P₄/P₁ = 10^(1/10) ≈ 1.26. 곱으로 해도 10^−0.3 × 10^0.7 × 10^−0.3 = 10^0.1 로 같다.",
          barSvg(bars(3), "P₄ / P₁ = 10^0.1 ≈ 1.26", 3),
          "지점별 전력 값(0.5P, 2.51P, 1.26P)은 이해를 돕는 계산값이고, 문제에서 묻는 것은 '''dB 합 +1 dB''' 이다.");
      } else {
        v.P1 = "noise power"; v.P2 = "signal power";
        var S0 = [{ label: "SNR (비율)", val: null }, { label: "SNR_dB", val: null }];
        push(1, "[[SNR]] 을 dB 로: '''SNR_dB = 10 log₁₀ SNR'''. P₂/P₁ 자리에 signal power / noise power 가 들어간 것뿐이다.",
          barSvg(S0, "SNR_dB = 10 log₁₀ SNR", 40));
        v.ratio = "SNR = 3162";
        push(2, "주어진 SNR = 3162 (Example 2.8 전화선). 신호 전력이 잡음 전력의 3162 배라는 '''비율'''.",
          barSvg(S0, "SNR = 3162 (배)", 40));
        push(3, "대입: SNR_dB = '''10 log₁₀3162'''.", barSvg(S0, "10 log₁₀3162", 40));
        v.log = "log₁₀3162 ≈ 3.5";
        push(4, "3162 ≈ 1000 × √10 = 10³ × 10^0.5 = 10^3.5 → log₁₀3162 ≈ '''3.5'''.",
          barSvg(S0, "3162 ≈ 10^3.5", 40));
        v.dB = "35 dB";
        push(5, "'''SNR_dB = 10 × 3.5 = 35 dB'''. 반대로 문제에서 35 dB 를 주면 SNR = 10^3.5 ≈ 3162 로 되돌려 [[Shannon capacity]] 에 넣어야 한다.",
          barSvg([{ label: "SNR_dB", val: 35, text: "35 dB", color: "#2e9e4f" }], "SNR_dB = 35 dB", 40),
          "Shannon 공식 C = B log₂(1 + SNR) 에는 '''dB 가 아닌 비율'''을 넣는다. dB 를 그대로 넣는 실수 주의.");
      }

      return {
        panels: [{ id: "P", title: TITLES[c], lang: "txt", lines: LINES[c] }],
        vars: [
          { name: "P1", label: "P₁ (기준)", group: "전력" },
          { name: "P2", label: "P₂ (비교)", group: "전력" },
          { name: "ratio", label: "비율", group: "계산" },
          { name: "log", label: "log₁₀ 항", group: "계산" },
          { name: "seg", label: "현재 구간", group: "계산" },
          { name: "total", label: "누적 dB", group: "계산" },
          { name: "dB", label: "결과", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
