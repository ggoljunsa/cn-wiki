// nyquist_shannon — L2 p.51–60 (복습 L3 p.23–32): Example 2.6 / 2.8 / 2.9 를 손으로 푸는 순서대로
window.SIMS = window.SIMS || {};
(function (global) {
  "use strict";

  var EX = {
    "2.6": {
      title: "Example 2.6 — noiseless channel, Nyquist bit rate 로 L 구하기 (L2 p.52)",
      formula: "N",
      lines: [
        "문제: noiseless channel, N = 265 kbps, B = 20 kHz → L = ?",
        "공식 (Nyquist bit rate): N = 2 × B × log₂L",
        "대입: 265,000 = 2 × 20,000 × log₂L",
        "정리: log₂L = 265,000 / 40,000 = 6.625",
        "역산: L = 2^6.625 ≈ 98.7 levels",
        "해석: L 은 2의 거듭제곱이어야 → 6~7 bits/symbol (64 또는 128 levels)"
      ]
    },
    "2.8": {
      title: "Example 2.8 — 전화선의 Shannon capacity (L2 p.55)",
      formula: "C",
      lines: [
        "문제: B = 3000 Hz (300–3300 Hz), SNR = 3162 → C = ?",
        "공식 (Shannon capacity): C = B × log₂(1 + SNR)",
        "대입: C = 3000 × log₂(1 + 3162) = 3000 × log₂3163",
        "log₂3163 = log₁₀3163 / log₁₀2 = 3.500 / 0.301 ≈ 11.62",
        "계산: C = 3000 × 11.62 = 34,860 bps",
        "해석: 더 빨리 보내려면 bandwidth 를 늘리거나 SNR 을 개선"
      ]
    },
    "2.9": {
      title: "Example 2.9 — Shannon 으로 상한, Nyquist 로 L (L2 p.58–60)",
      formula: "both",
      lines: [
        "문제: B = 1 MHz, SNR = 63 → 적절한 bit rate 와 signal level L = ?",
        "① Shannon capacity: C = B × log₂(1 + SNR)",
        "대입: C = 10⁶ × log₂(1 + 63) = 10⁶ × log₂64",
        "log₂64 = 6 → C = 6 Mbps (upper limit)",
        "For better performance → 상한보다 낮은 4 Mbps 선택",
        "② Nyquist bit rate: N = 2 × B × log₂L",
        "대입: 4 Mbps = 2 × 1 MHz × log₂L → log₂L = 2",
        "L = 2² = 4"
      ]
    }
  };

  function card(x, y, w, title, body, on) {
    var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="70" rx="8" fill="' + (on ? "#eef4fb" : "#f6f6f6") +
      '" stroke="' + (on ? "#1d65b3" : "#bbb") + '" stroke-width="' + (on ? 2.5 : 1) + '"/>';
    s += '<text x="' + (x + w / 2) + '" y="' + (y + 22) + '" text-anchor="middle" font-size="12" fill="#555">' + title + "</text>";
    s += '<text x="' + (x + w / 2) + '" y="' + (y + 50) + '" text-anchor="middle" font-size="16" font-weight="700" fill="' + (on ? "#1d65b3" : "#999") + '">' + body + "</text>";
    return s;
  }

  function makeSvg(active, eqn, result) {
    return function () {
      var s = '<svg viewBox="0 0 520 190" width="520" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">';
      s += card(10, 10, 240, "Nyquist bit rate (noiseless)", "N = 2 × B × log₂L", active === "N");
      s += card(270, 10, 240, "Shannon capacity (noisy, AWGN)", "C = B × log₂(1 + SNR)", active === "C");
      s += '<rect x="10" y="96" width="500" height="84" rx="8" fill="#fffbe8" stroke="#d6a017"/>';
      s += '<text x="260" y="124" text-anchor="middle" font-size="13" fill="#333">' + eqn + "</text>";
      s += '<text x="260" y="160" text-anchor="middle" font-size="18" font-weight="700" fill="#2e7a38">' + result + "</text>";
      s += "</svg>";
      return s;
    };
  }

  global.SIMS["nyquist_shannon"] = {
    title: "Nyquist bit rate · Shannon capacity 계산기",
    desc: "슬라이드 Example 2.6 / 2.8 / 2.9 를 '''공식 → 대입 → 계산''' 순서로 한 줄씩 푼다. [[Nyquist bit rate]] 는 noiseless, [[Shannon capacity]] 는 noisy channel 의 상한.",
    options: [
      { key: "example", label: "Example", values: [
        { value: "2.6", label: "Ex 2.6 (Nyquist → L)" },
        { value: "2.8", label: "Ex 2.8 (Shannon, 전화선)" },
        { value: "2.9", label: "Ex 2.9 (Shannon → Nyquist)" }
      ] }
    ],
    build: function (opts) {
      var key = EX[opts.example] ? opts.example : "2.6";
      var ex = EX[key];
      var steps = [];
      var v = { ex: "Example " + key, B: "?", N: "?", SNR: "–", L: "?", logterm: "?", C: "–", ans: "?" };

      function push(pc, desc, active, eqn, result, note) {
        steps.push({
          desc: desc, pc: { P: pc }, vars: JSON.parse(JSON.stringify(v)),
          status: { P: pc === ex.lines.length ? "done" : "running" },
          note: note, svg: makeSvg(active, eqn, result)
        });
      }

      if (key === "2.6") {
        v.B = "20 kHz = 20,000 Hz"; v.N = "265 kbps = 265,000 bps"; v.SNR = "– (noiseless)";
        push(1, "문제 읽기: '''noiseless''' channel 이므로 [[Nyquist bit rate]] 를 쓴다. 알려진 것은 [[bit rate]] N 과 [[bandwidth]] B, 구할 것은 [[signal level|L]].",
          "N", "N = 265,000 bps, B = 20,000 Hz, L = ?", "L = ?");
        push(2, "공식: N = 2 × B × log₂L. 2B 는 1초에 보낼 수 있는 최대 symbol 수, log₂L 은 symbol 하나가 싣는 bit 수다.",
          "N", "N = 2 × B × log₂L", "L = ?");
        push(3, "대입: '''265,000 = 2 × 20,000 × log₂L'''. 단위를 Hz·bps 로 맞춘 뒤 대입한다(kHz 그대로 넣으면 자릿수가 틀린다).",
          "N", "265,000 = 2 × 20,000 × log₂L", "L = ?");
        v.logterm = "log₂L = 6.625";
        push(4, "양변을 40,000 으로 나눈다: '''log₂L = 6.625'''. 즉 symbol 하나에 6.625 bit 가 실려야 한다. ([[log₂ 계산법]])",
          "N", "log₂L = 265,000 / 40,000", "log₂L = 6.625");
        v.L = "2^6.625 ≈ 98.7"; v.ans = "L ≈ 98.7 levels";
        push(5, "역산: L = 2^6.625 ≈ 98.7 levels. (2⁶ = 64, 2⁷ = 128 사이)",
          "N", "L = 2^6.625", "L ≈ 98.7 levels");
        v.ans = "L ≈ 98.7 → 6~7 bits/symbol";
        push(6, "해석: level 수는 정수이고 보통 2의 거듭제곱이므로 슬라이드 결론은 '''\"Should use 6-7 bits for one signal\"'''. 64 levels(6 bits)면 2×20,000×6 = 240 kbps 로 모자라고, 128 levels(7 bits)면 280 kbps 로 충분하다.",
          "N", "L ≈ 98.7 → 2⁶ = 64 또는 2⁷ = 128", "6~7 bits/symbol",
          "시험 포인트: L 이 2의 거듭제곱이 아니면 '''올려서''' 128 levels(7 bits) 를 쓰거나, bit rate 를 낮춰 64 levels 를 쓴다 — 슬라이드는 \"6-7 bits\" 로 답했다.");
      } else if (key === "2.8") {
        v.B = "3000 Hz (300–3300 Hz)"; v.SNR = "3162"; v.N = "–"; v.L = "–";
        push(1, "문제 읽기: 전화선. '''noise 가 있는''' channel 의 이론상 최대 bit rate → [[Shannon capacity]]. [[SNR]] 은 dB 가 아니라 '''비율(3162)''' 로 주어졌다.",
          "C", "B = 3000 Hz, SNR = 3162", "C = ?");
        push(2, "공식: C = B × log₂(1 + SNR). Shannon 식에는 L 이 없다 — 어떤 기법을 써도 넘을 수 없는 상한이다.",
          "C", "C = B × log₂(1 + SNR)", "C = ?");
        v.logterm = "log₂(1 + 3162) = log₂3163";
        push(3, "대입: C = 3000 × log₂(1 + 3162) = 3000 × log₂3163.",
          "C", "C = 3000 × log₂(1 + 3162)", "C = ?");
        v.logterm = "log₂3163 ≈ 11.62";
        push(4, "계산기로 log₂ 가 없으면 밑변환: log₂3163 = log₁₀3163 / log₁₀2 = 3.500 / 0.301 ≈ 11.62. ([[log₂ 계산법]])",
          "C", "log₂3163 = 3.500 / 0.301", "log₂3163 ≈ 11.62");
        v.C = "34,860 bps"; v.ans = "C = 34,860 bps";
        push(5, "'''C = 3000 × 11.62 = 34,860 bps'''. 전화선으로는 이론상 약 34.86 kbps 가 한계.",
          "C", "C = 3000 × 11.62", "C = 34,860 bps");
        push(6, "슬라이드 결론: 이보다 빨리 보내려면 '''bandwidth 를 늘리거나''' '''SNR 을 개선'''해야 한다. ([[SNR]] 을 dB 로 바꾸면 10 log₁₀3162 = 35 dB — [[데시벨]])",
          "C", "C ∝ B, C ∝ log₂(1 + SNR)", "C = 34,860 bps");
      } else {
        v.B = "1 MHz = 10⁶ Hz"; v.SNR = "63";
        push(1, "문제 읽기: B 와 [[SNR]] 이 주어지고 '''적절한''' bit rate 와 [[signal level|L]] 을 묻는다 → 두 공식을 차례로 쓴다.",
          "C", "B = 10⁶ Hz, SNR = 63", "bit rate = ?, L = ?");
        push(2, "① 먼저 [[Shannon capacity]] 로 '''상한'''을 구한다: C = B × log₂(1 + SNR).",
          "C", "C = B × log₂(1 + SNR)", "C = ?");
        v.logterm = "log₂(1 + 63) = log₂64";
        push(3, "대입: C = 10⁶ × log₂(1 + 63) = 10⁶ × log₂64. 1 + 63 = 64 = 2⁶ 으로 딱 떨어지게 설계된 숫자.",
          "C", "C = 10⁶ × log₂64", "C = ?");
        v.logterm = "log₂64 = 6"; v.C = "6 Mbps";
        push(4, "log₂64 = 6 → '''C = 6 Mbps''' (upper limit).",
          "C", "C = 10⁶ × 6", "C = 6 Mbps");
        v.N = "4 Mbps (선택)";
        push(5, "'''For better performance we choose something lower, 4 Mbps.''' 상한에 딱 맞추면 오류가 많아지므로 여유를 둔다.",
          "C", "6 Mbps (상한) → 4 Mbps 선택", "N = 4 Mbps");
        push(6, "② 이제 [[Nyquist bit rate]] 로 4 Mbps 를 내려면 L 이 몇이어야 하는지 구한다: N = 2 × B × log₂L.",
          "N", "N = 2 × B × log₂L", "L = ?");
        v.logterm = "log₂L = 4M / 2M = 2";
        push(7, "대입: 4 × 10⁶ = 2 × 10⁶ × log₂L → '''log₂L = 2'''.",
          "N", "4 Mbps = 2 × 1 MHz × log₂L", "log₂L = 2");
        v.L = "4"; v.ans = "C = 6 Mbps → N = 4 Mbps, L = 4";
        push(8, "'''L = 2² = 4'''. 결론: Shannon 으로 상한 6 Mbps, 여유를 두어 4 Mbps, Nyquist 로 L = 4.",
          "N", "L = 2²", "L = 4",
          "시험 포인트: Shannon 은 '''상한(capacity)''', Nyquist 는 '''L 결정'''. 두 공식을 이 순서로 쓰는 것이 Ex 2.9 의 핵심.");
      }

      return {
        panels: [{ id: "P", title: ex.title, lang: "txt", lines: ex.lines }],
        vars: [
          { name: "ex", label: "문제", group: "주어진 값" },
          { name: "B", label: "B (bandwidth)", group: "주어진 값" },
          { name: "SNR", label: "SNR (비율)", group: "주어진 값" },
          { name: "N", label: "N (bit rate)", group: "주어진 값" },
          { name: "logterm", label: "log₂ 항", group: "계산" },
          { name: "L", label: "L (signal levels)", group: "계산" },
          { name: "C", label: "C (capacity)", group: "계산" },
          { name: "ans", label: "결과", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
