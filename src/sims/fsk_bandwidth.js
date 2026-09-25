// fsk_bandwidth — L4 p.41–42 Example 5: B = (1 + d)S + 2Δf 로 S, N 구하기
window.SIMS = window.SIMS || {};
(function (global) {
  "use strict";

  function svgFor(st) {
    return function () {
      var W = 620, H = 230, x0 = 40, x1 = 590;
      function X(f) { return x0 + (f - 180) / 140 * (x1 - x0); }
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
      // available band
      s += '<rect x="' + X(200) + '" y="40" width="' + (X(300) - X(200)) + '" height="130" fill="#f4f4f4" stroke="#999" stroke-dasharray="4,3"/>';
      s += '<text x="' + X(250) + '" y="32" text-anchor="middle" fill="#555">가용 대역 200–300 kHz (B = 100 kHz)</text>';
      s += '<line x1="' + x0 + '" y1="170" x2="' + x1 + '" y2="170" stroke="#333"/>';
      for (var f = 180; f <= 320; f += 20) {
        s += '<line x1="' + X(f) + '" y1="170" x2="' + X(f) + '" y2="176" stroke="#333"/>';
        s += '<text x="' + X(f) + '" y="190" text-anchor="middle" font-size="10" fill="#555">' + f + "</text>";
      }
      s += '<text x="' + x1 + '" y="206" text-anchor="end" font-size="10" fill="#777">f (kHz)</text>';
      if (st.fc) {
        s += '<line x1="' + X(250) + '" y1="44" x2="' + X(250) + '" y2="170" stroke="#777" stroke-dasharray="2,3"/>';
        s += '<text x="' + X(250) + '" y="218" text-anchor="middle" fill="#777" font-weight="700">f_c = 250</text>';
      }
      if (st.f1) {
        [[st.f1, "#1d65b3", "f₁"], [st.f2, "#2e9e4f", "f₂"]].forEach(function (a) {
          s += '<line x1="' + X(a[0]) + '" y1="80" x2="' + X(a[0]) + '" y2="170" stroke="' + a[1] + '" stroke-width="2"/>';
          s += '<text x="' + X(a[0]) + '" y="74" text-anchor="middle" fill="' + a[1] + '" font-weight="700">' + a[2] + "=" + a[0] + "</text>";
        });
        s += '<line x1="' + X(st.f1) + '" y1="152" x2="' + X(st.f2) + '" y2="152" stroke="#d6465f" stroke-width="1.5"/>';
        s += '<text x="' + X((st.f1 + st.f2) / 2) + '" y="148" text-anchor="middle" fill="#d6465f" font-size="11">2Δf=' + st.d2f + "</text>";
      }
      if (st.S) {
        var half = st.S; // (1+d)S / 2 = S (d=1)
        [[st.f1, "#1d65b3"], [st.f2, "#2e9e4f"]].forEach(function (a, i) {
          var lo = a[0] - half, hi = a[0] + half;
          s += '<rect x="' + X(lo) + '" y="' + (96 + i * 10) + '" width="' + (X(hi) - X(lo)) + '" height="40" rx="10" fill="' + a[1] + '" opacity="0.28" stroke="' + a[1] + '"/>';
          s += '<text x="' + X(a[0]) + '" y="' + (120 + i * 10) + '" text-anchor="middle" font-size="10" fill="' + a[1] + '">(1+d)S=' + (2 * st.S) + "</text>";
        });
      }
      s += "</svg>";
      return s;
    };
  }

  global.SIMS["fsk_bandwidth"] = {
    title: "FSK 대역폭 — Example 5 (L4 p.42)",
    desc: "[[FSK]] 의 [[변조 대역폭]] B = (1 + d)S + 2Δf: 두 [[carrier]] f₁, f₂ 가 각각 (1+d)S 폭을 차지하고 2Δf 만큼 떨어져 있다. 200–300 kHz, [[roll-off factor|d]] = 1 에서 [[baud|S]] 와 N 을 구한다.",
    options: [
      { key: "d2f", label: "2Δf", values: [
        { value: "50", label: "2Δf = 50 kHz (슬라이드)" },
        { value: "20", label: "2Δf = 20 kHz" }
      ] }
    ],
    build: function (opts) {
      var d2f = opts.d2f === "20" ? 20 : 50;
      var f1 = 250 - d2f / 2, f2 = 250 + d2f / 2;
      var twoS = 100 - d2f, S = twoS / 2;
      var lines = [
        "주어진 것: 가용 대역 200–300 kHz → B = 100 kHz, FSK, d = 1, r = 1",
        "carrier(중심) f_c = (200 + 300) / 2 = 250 kHz",
        "2Δf = " + d2f + " kHz 선택 → f₁ = " + f1 + " kHz, f₂ = " + f2 + " kHz",
        "공식: B = (1 + d) × S + 2Δf",
        "대입: 100 = (1 + 1) × S + " + d2f + " → 2S = " + twoS + " kHz",
        "S = " + S + " kbaud",
        "FSK 는 r = 1 → N = r × S = " + S + " kbps"
      ];
      var steps = [];
      var v = { B: "100 kHz (200–300)", d: "1", r: "1 (FSK: 1 bit/symbol)", fc: "?", d2f: "?", f12: "?", twoS: "?", S: "?", N: "?" };
      var st = {};
      function push(pc, desc, note) {
        steps.push({ desc: desc, pc: { P: pc }, vars: JSON.parse(JSON.stringify(v)), status: { P: pc === 7 ? "done" : "running" }, svg: svgFor(JSON.parse(JSON.stringify(st))), note: note });
      }
      push(1, "문제: 가용 [[bandwidth]] 100 kHz (200–300 kHz), [[FSK]], '''d = 1'''. carrier frequency 와 bit rate 를 구하라. FSK 는 symbol 하나가 1 bit (r = 1) 이므로 '''S = N''' ([[signal rate와 bit rate]]).");
      v.fc = "250 kHz"; st.fc = true;
      push(2, "carrier 는 대역의 '''한가운데''' 에 둔다: (200 + 300) / 2 = '''250 kHz'''.");
      v.d2f = d2f + " kHz"; v.f12 = f1 + " / " + f2 + " kHz"; st.f1 = f1; st.f2 = f2; st.d2f = d2f;
      push(3, "두 주파수 사이 간격 '''2Δf = " + d2f + " kHz''' 를 고른다 → f₁ = 250 − " + (d2f / 2) + " = " + f1 + " kHz (bit 0), f₂ = 250 + " + (d2f / 2) + " = " + f2 + " kHz (bit 1).");
      push(4, "공식: '''B = (1 + d) × S + 2Δf'''. f₁ 대역 반쪽 + f₁~f₂ 간격 + f₂ 대역 반쪽 = (1+d)S/2 + 2Δf + (1+d)S/2.");
      v.twoS = twoS + " kHz";
      push(5, "대입: 100 = (1 + 1) × S + " + d2f + " → '''2S = " + twoS + " kHz'''.");
      v.S = S + " kbaud"; st.S = S;
      push(6, "'''S = " + S + " kbaud'''. 각 carrier 가 차지하는 폭 (1+d)S = " + (2 * S) + " kHz → f₁ 대역 " + (f1 - S) + "–" + (f1 + S) + ", f₂ 대역 " + (f2 - S) + "–" + (f2 + S) + " kHz.");
      v.N = S + " kbps";
      push(7, "r = 1 이므로 '''N = S = " + S + " kbps'''. " + (d2f === 50
        ? "슬라이드 답: carrier 250 kHz, '''S = 25 kbaud, N = 25 kbps'''."
        : "2Δf 를 20 kHz 로 줄이면 S 에 쓸 대역이 늘어 '''S = 40 kbaud, N = 40 kbps'''. 대신 두 대역(" + (f1 - S) + "–" + (f1 + S) + ", " + (f2 - S) + "–" + (f2 + S) + ")이 크게 겹쳐 f₁ 과 f₂ 를 구분하기 어려워진다 — 슬라이드는 50 kHz 를 골랐다."),
        "B 가 고정이면 2Δf 를 키울수록 S(=N) 가 줄고, 줄일수록 S 가 는다: 2S = B − 2Δf.");
      return {
        panels: [{ id: "P", title: "Example 5 풀이 순서", lang: "txt", lines: lines }],
        vars: [
          { name: "B", label: "B", group: "주어진 값" },
          { name: "d", label: "d (roll-off)", group: "주어진 값" },
          { name: "r", label: "r", group: "주어진 값" },
          { name: "fc", label: "f_c (carrier)", group: "주파수" },
          { name: "d2f", label: "2Δf", group: "주파수" },
          { name: "f12", label: "f₁ / f₂", group: "주파수" },
          { name: "twoS", label: "2S", group: "결과" },
          { name: "S", label: "S (signal rate)", group: "결과" },
          { name: "N", label: "N (bit rate)", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
