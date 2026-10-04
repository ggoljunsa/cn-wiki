window.SIMS = window.SIMS || {};
// fast_ethernet_length — L7 p.31–33, p.39–40 + L6 Ex 3.12: 최소 프레임 512 bits 를 지키면서 속도를 올리면 최대 길이가 줄어든다
(function (global) {
  "use strict";

  var MINF = 512;      // bits
  var V = 2e8;         // m/s (Ex 3.12 와 같은 가정)

  var LINES = [
    "최소 프레임 = 512 bits (64 bytes) — 호환성 때문에 그대로",
    "T_fr = 512 bits ÷ rate",
    "CSMA/CD 조건 T_fr ≥ 2T_p → T_p ≤ T_fr / 2",
    "최대 길이 = T_p × 전파 속도 (2 × 10^8 m/s)",
    "결론: 표준값과 비교"
  ];

  var RATE = {
    "10": { bps: 1e7, label: "10 Mbps (Standard Ethernet)", std: "2500 m", stdM: 2500 },
    "100": { bps: 1e8, label: "100 Mbps (Fast Ethernet)", std: "250 m", stdM: 250 },
    "1000": { bps: 1e9, label: "1 Gbps (Gigabit Ethernet)", std: "< 25 m?", stdM: 25 }
  };
  var ORDER = ["10", "100", "1000"];

  function fmt(x) { return String(Math.round(x * 1000) / 1000); }

  global.SIMS["fast_ethernet_length"] = {
    title: "속도 ×10 → 최대 길이 ÷10 — Fast/Gigabit Ethernet 의 CSMA/CD",
    desc: "L7 p.31–33, p.39–40 (L6 Example 3.12 연계). [[CSMA/CD]] 가 동작하려면 [[T_fr]] ≥ 2[[T_p]]. [[최소 프레임 크기]] 512 bits 를 그대로 두고 rate 를 10배 올리면 " +
      "T_fr 이 10배 짧아지므로, 충돌을 10배 빨리 감지해야 하고 → 네트워크 최대 길이가 '''10배 짧아진다'''.",
    options: [
      { key: "rate", label: "rate", values: ORDER.map(function (k) { return { value: k, label: RATE[k].label }; }) }
    ],
    build: function (opts) {
      var key = RATE[opts.rate] ? opts.rate : "10";
      var r = RATE[key];
      var steps = [];
      var tfr = MINF / r.bps * 1e6;      // μs
      var tp = tfr / 2;                  // μs
      var len = tp * 1e-6 * V;           // m
      var st = { rate: r.label.split(" (")[0], minf: "512 bits", Tfr: "?", Tp: "?", len: "?", std: "?" };
      var phase = 0;

      function snap() { return { rate: st.rate, minf: st.minf, v: "2 × 10^8 m/s", Tfr: st.Tfr, Tp: st.Tp, len: st.len, std: st.std }; }
      function svg() {
        var ph = phase;
        return function () {
          var W = 620, H = 220, x0 = 150, maxW = 440;
          var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
          s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
          s += '<text x="' + (W / 2) + '" y="20" text-anchor="middle" font-weight="700" fill="#333">최대 길이 (계산값, 선형 축 — 10 Mbps = 5120 m 기준)</text>';
          ORDER.forEach(function (k, i) {
            var rr = RATE[k], y = 44 + i * 56, on = k === key;
            var L = MINF / rr.bps / 2 * V;
            var reveal = on ? ph >= 4 : ph >= 5;
            s += '<text x="' + (x0 - 10) + '" y="' + (y + 14) + '" text-anchor="end" font-weight="' + (on ? 700 : 400) + '" fill="' + (on ? "#1d65b3" : "#777") + '">' + rr.label.split(" (")[0] + '</text>';
            s += '<rect x="' + x0 + '" y="' + y + '" width="' + maxW + '" height="20" rx="3" fill="#f3f3f3"/>';
            if (reveal) {
              var w = Math.max(2, maxW * L / 5120);
              s += '<rect x="' + x0 + '" y="' + y + '" width="' + w + '" height="20" rx="3" fill="' + (on ? "#1d65b3" : "#9cc3ea") + '"/>';
              var lab = "≈ " + fmt(L) + " m  (표준 " + rr.std.replace("<", "&lt;") + ")";
              var inside = w > 300;
              s += '<text x="' + (inside ? x0 + 8 : x0 + w + 6) + '" y="' + (y + 14) + '" fill="' + (inside ? "#fff" : "#333") + '" font-weight="700">' + lab + '</text>';
              var sw = Math.min(maxW, maxW * rr.stdM / 5120);
              s += '<line x1="' + (x0 + sw) + '" y1="' + (y - 4) + '" x2="' + (x0 + sw) + '" y2="' + (y + 24) + '" stroke="#e09a40" stroke-width="2" stroke-dasharray="3 2"/>';
            }
          });
          s += '<line x1="20" y1="200" x2="34" y2="200" stroke="#e09a40" stroke-width="2" stroke-dasharray="3 2"/><text x="40" y="204" fill="#777" font-size="11">= 표준이 정한 길이 (리피터·장치 지연 여유 포함이라 계산값보다 짧다)</text>';
          s += "</svg>";
          return s;
        };
      }
      function push(desc, line, note) { steps.push({ desc: desc, pc: { P: line }, vars: snap(), note: note, svg: svg() }); }

      push("rate = '''" + r.label + "'''. Fast/Gigabit Ethernet 은 Standard Ethernet 과 '''호환'''되어야 하므로 frame format 과 [[최소 프레임 크기]] '''512 bits = 64 bytes''' 를 바꿀 수 없다.", 1);
      phase = 2; st.Tfr = "512 ÷ " + st.rate + " = " + fmt(tfr) + " μs";
      push("최소 프레임 하나를 다 보내는 시간 [[T_fr]] = 512 bits ÷ " + st.rate + " = '''" + fmt(tfr) + " μs'''.", 2);
      phase = 3; st.Tp = "≤ " + fmt(tfr) + " / 2 = " + fmt(tp) + " μs";
      push("[[CSMA/CD]] 는 '''보내는 도중에''' 충돌을 감지해야 하므로 T_fr ≥ 2T_p → [[T_p]] ≤ T_fr / 2 = '''" + fmt(tp) + " μs'''.", 3,
        "최악의 경우 충돌 소식이 되돌아오기까지 왕복 2T_p 가 걸린다 (Example 3.12 와 같은 논리를 거꾸로 푼 것).");
      phase = 4; st.len = fmt(tp) + " μs × 2×10^8 m/s ≈ " + fmt(len) + " m";
      push("최대 길이 = T_p × 전파 속도 = " + fmt(tp) + " × 10⁻⁶ s × 2 × 10⁸ m/s ≈ '''" + fmt(len) + " m'''.", 4);
      phase = 5; st.std = r.std;
      var concl, note;
      if (key === "10") {
        concl = "계산값 ≈ 5120 m, 실제 Standard Ethernet 표준 최대 길이는 '''2500 m'''.";
        note = "슬라이드의 2500 m 는 리피터·장치 지연·jamming 여유를 둔 표준값이라 이상적인 계산값(5120 m)보다 짧다. 10배 빠르면 10배 짧다 — 이것이 기준점.";
      } else if (key === "100") {
        concl = "계산값 ≈ 512 m — 10 Mbps 의 '''정확히 1/10'''. 표준은 2500 m → '''250 m''' (Solution #1: bus 를 버리고 passive hub + star).";
        note = "10배 빠르면 10배 짧다: 512 bits 를 10배 빨리 보내면 T_fr 이 1/10 → 충돌도 10배 빨리 감지해야 → 최대 길이 1/10.";
      } else {
        concl = "계산값 ≈ 51 m — 100 Mbps 의 또 1/10. 슬라이드 p.39 \"&lt; 25 m?\" — LAN 으로 쓰기엔 너무 짧다 → '''CSMA/CD 를 버리고''' full-duplex [[스위치]] (no collision).";
        note = "10배 빠르면 10배 짧다. 그래서 Gigabit Ethernet 은 거의 full-duplex mode 로만 쓰인다: 각 호스트가 switch 와 전용 링크 → 충돌이 없으니 감지할 필요도 없다.";
      }
      push(concl, 5, note);

      return {
        panels: [{ id: "P", title: "손으로 푸는 순서", lang: "txt", lines: LINES }],
        vars: [
          { name: "rate", label: "rate", group: "주어진 값" },
          { name: "minf", label: "최소 프레임", group: "주어진 값" },
          { name: "v", label: "전파 속도", group: "주어진 값" },
          { name: "Tfr", label: "T_fr", group: "계산" },
          { name: "Tp", label: "T_p (최대)", group: "계산" },
          { name: "len", label: "최대 길이 (계산)", group: "결과" },
          { name: "std", label: "표준 최대 길이", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
