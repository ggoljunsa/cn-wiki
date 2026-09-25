// pcm_encoder — L3 p.55 (PCM: Quantization) 표를 한 샘플씩: PAM → 양자화 값 → 오차 → 코드 → 비트
window.SIMS = window.SIMS || {};
(function (global) {
  "use strict";

  // L3 p.55 그림의 실제 진폭(V)과 정규화 PAM 값 (Δ = 5 V, 범위 −20 ~ +20 V)
  var AMP = [-6.1, 7.5, 16.2, 19.7, 11.0, -5.5, -11.3, -9.4, -6.0];
  var PAM = [-1.22, 1.50, 3.24, 3.94, 2.20, -1.10, -2.26, -1.88, -1.20];

  function f2(x) {
    var r = Math.round(x * 100) / 100;
    if (Object.is(r, -0)) r = 0;
    return r.toFixed(2);
  }
  function sgn(x) {
    var r = Math.round(x * 100) / 100;
    if (r === 0) return "0";
    return (r > 0 ? "+" : "−") + Math.abs(r).toFixed(2);
  }
  function neg(str) { return str.replace(/^-/, "−"); }
  function bin(n, w) { var s = n.toString(2); while (s.length < w) s = "0" + s; return s; }

  function makeSvg(L, step, k, rows, phase) {
    // step = 구간 폭 (원래 Δ 단위), rows = 지금까지 처리한 샘플 결과
    return function () {
      var W = 600, H = 300, x0 = 70, x1 = 580, yTop = 30, yBot = 270;
      function Y(v) { return yTop + (4 - v) / 8 * (yBot - yTop); }
      function X(i) { return x0 + 30 + i * (x1 - x0 - 40) / 8; }
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="11">';
      // level bands
      for (var c = 0; c < L; c++) {
        var lo = -4 + c * step, hi = lo + step;
        s += '<rect x="' + x0 + '" y="' + Y(hi) + '" width="' + (x1 - x0) + '" height="' + (Y(lo) - Y(hi)) + '" fill="' + (c % 2 ? "#e9e3d3" : "#eef3c9") + '"/>';
        var mid = lo + step / 2;
        s += '<line x1="' + x0 + '" y1="' + Y(mid) + '" x2="' + x1 + '" y2="' + Y(mid) + '" stroke="#999" stroke-dasharray="3,3"/>';
        s += '<text x="' + (x0 - 6) + '" y="' + (Y(mid) + 4) + '" text-anchor="end" fill="#d6465f" font-weight="700">' + c + "</text>";
      }
      for (var g = -4; g <= 4; g++) {
        s += '<text x="' + (x0 - 24) + '" y="' + (Y(g) + 4) + '" text-anchor="end" fill="#777" font-size="10">' + (g === 0 ? "0" : (g < 0 ? "−" : "") + (Math.abs(g) === 1 ? "" : Math.abs(g)) + "Δ") + "</text>";
      }
      s += '<line x1="' + x0 + '" y1="' + Y(0) + '" x2="' + x1 + '" y2="' + Y(0) + '" stroke="#333"/>';
      s += '<text x="' + (x0 - 6) + '" y="20" text-anchor="end" fill="#d6465f" font-size="10">code</text>';
      // samples
      for (var i = 0; i < PAM.length; i++) {
        var done = i < rows.length;
        var cur = i === k;
        var col = cur ? "#1d65b3" : (done ? "#d6465f" : "#bbb");
        s += '<line x1="' + X(i) + '" y1="' + Y(0) + '" x2="' + X(i) + '" y2="' + Y(PAM[i]) + '" stroke="' + col + '" stroke-width="' + (cur ? 3 : 2) + '"/>';
        s += '<circle cx="' + X(i) + '" cy="' + Y(PAM[i]) + '" r="' + (cur ? 5 : 4) + '" fill="' + col + '"/>';
        var r = rows[i];
        if (r && (!cur || phase >= 2)) {
          s += '<rect x="' + (X(i) - 7) + '" y="' + (Y(r.q) - 3) + '" width="14" height="6" fill="#2e9e4f"/>';
        }
        if (r && (!cur || phase >= 5)) {
          s += '<text x="' + X(i) + '" y="290" text-anchor="middle" font-family="monospace" font-weight="700" fill="#d6465f">' + r.bits + "</text>";
        }
      }
      if (k >= 0) {
        s += '<text x="' + (W / 2 + 30) + '" y="16" text-anchor="middle" font-size="12" fill="#1d65b3">샘플 ' + (k + 1) + ": PAM " + neg(f2(PAM[k])) + (rows[k] && phase >= 2 ? " → 양자화 " + neg(f2(rows[k].q)) + " (■)" : "") + "</text>";
      }
      s += "</svg>";
      return s;
    };
  }

  global.SIMS["pcm_encoder"] = {
    title: "PCM encoder — 양자화 표 한 칸씩 (L3 p.55)",
    desc: "[[PAM]] 샘플 9개를 [[quantization]] 하고 [[encoding]] 한다. 각 샘플마다 '''PAM 값 → 가장 가까운 midpoint → 오차 → code → 비트''' 순서. 진폭 범위 −20 ~ +20 V, 값은 Δ 단위로 정규화.",
    options: [
      { key: "L", label: "L (레벨 수)", values: [
        { value: "8", label: "L = 8 (슬라이드, 3 bits)" },
        { value: "4", label: "L = 4 (Δ 두 배, 2 bits)" }
      ] }
    ],
    build: function (opts) {
      var L = opts.L === "4" ? 4 : 8;
      var nb = L === 8 ? 3 : 2;
      var step = 8 / L;                 // 구간 폭 (원래 Δ = 5 V 단위)
      var deltaV = 40 / L;              // 실제 Δ (V)
      var lines = [
        "준비: L = " + L + ", Δ = (20 − (−20)) / " + L + " = " + deltaV + " V, n_b = log₂" + L + " = " + nb,
        "① 정규화 PAM 값 읽기 (진폭 ÷ 5 V)",
        "② 속한 구간의 midpoint 로 → 정규화 양자화 값",
        "③ 정규화 오차 = 양자화 값 − PAM 값",
        "④ quantization code = 구간 번호 (맨 아래 0)",
        "⑤ encoded word = code 를 " + nb + "비트 2진수로",
        "끝: 샘플별 " + nb + "비트를 이어 붙여 전송"
      ];
      var rows = [];
      var steps = [];
      var stream = [];
      var v = { L: String(L), delta: deltaV + " V" + (L === 4 ? " (= 2 × 5 V)" : ""), nb: nb + " bits", k: "–", amp: "–", pam: "–", q: "–", err: "–", code: "–", bits: "–", codes: "", stream: "" };
      function snap() { var o = JSON.parse(JSON.stringify(v)); o.codes = rows.map(function (r) { return r.code; }).join(" ") || "–"; o.stream = stream.join(" ") || "–"; return o; }
      function push(pc, desc, k, phase, note) {
        steps.push({ desc: desc, pc: { P: pc }, vars: snap(), status: { P: pc === 7 ? "done" : "running" }, svg: makeSvg(L, step, k, rows.slice(), phase), note: note });
      }

      push(1, "준비: 진폭 범위 −20 ~ +20 V 를 '''L = " + L + "''' 개 구간으로 나눈다 → 구간 폭 '''Δ = 40 / " + L + " = " + deltaV + " V'''. 코드 하나는 '''n_b = log₂" + L + " = " + nb + " bits'''. " +
        (L === 8 ? "슬라이드 표의 값은 모두 5 V(=Δ) 로 나눈 '''정규화 값'''이다." : "L 을 절반으로 줄이면 Δ 가 두 배(10 V). 표 값은 비교를 위해 슬라이드와 같은 5 V 단위로 적는다 — 구간 경계는 −4, −2, 0, 2, 4, midpoint 는 −3, −1, +1, +3."),
        -1, 0);

      for (var k = 0; k < PAM.length; k++) {
        var p = PAM[k];
        var code = Math.min(L - 1, Math.max(0, Math.floor((p + 4) / step)));
        var q = -4 + code * step + step / 2;
        var err = q - p;
        var bits = bin(code, nb);
        var lo = -4 + code * step, hi = lo + step;
        v.k = (k + 1) + " / 9"; v.amp = neg(AMP[k].toFixed(1)) + " V"; v.pam = neg(f2(p));
        v.q = "–"; v.err = "–"; v.code = "–"; v.bits = "–";
        push(2, "샘플 " + (k + 1) + ": 실제 진폭 " + neg(AMP[k].toFixed(1)) + " V → '''정규화 PAM 값 " + neg(f2(p)) + "''' (= " + neg(AMP[k].toFixed(1)) + " / 5). [[PAM]] 은 아직 '''실수(연속값)''' 이다.", k, 1);
        rows.push({ q: q, code: code, bits: bits });
        v.q = neg(f2(q));
        push(3, neg(f2(p)) + " 는 구간 [" + neg(String(lo)) + ", " + neg(String(hi)) + ") 에 속한다 → 그 구간의 '''midpoint " + neg(f2(q)) + "''' 로 반올림. 이것이 '''정규화 양자화 값'''.", k, 2);
        v.err = sgn(err);
        push(4, "정규화 오차 = 양자화 값 − PAM = " + neg(f2(q)) + " − (" + neg(f2(p)) + ") = '''" + sgn(err) + "'''. 항상 −Δ/2 ~ +Δ/2 (여기서는 ±" + (step / 2).toFixed(2) + ") 안에 있다 — [[quantization error]].", k, 3);
        v.code = String(code);
        push(5, "이 구간은 아래에서 " + code + "번째(0부터) → '''quantization code " + code + "'''.", k, 4);
        v.bits = bits; stream.push(bits);
        push(6, "code " + code + " 를 " + nb + "비트 2진수로 → '''" + bits + "'''. [[encoding]] 끝, 다음 샘플로.", k, 5,
          k === 0 && L === 8 ? "슬라이드 표 첫 열과 비교: −1.22 → −1.50 → −0.28 → 2 → 010." : undefined);
      }
      v.k = "9 / 9 (끝)";
      push(7, "9개 샘플 모두 끝. 전송 비트열 = 샘플당 " + nb + "비트 × 9 = '''" + (nb * 9) + " bits'''. " +
        (L === 8 ? "슬라이드 표의 Encoded words 행과 정확히 같다." : "L = 8 보다 비트는 적지만 오차 범위가 ±0.5 → ±1 로 두 배가 됐다 (Δ 가 커질수록 quantization error 증가)."),
        -1, 5,
        L === 8 ? "시험 포인트: 오차 = 양자화 값 − PAM 값, 범위 −Δ/2 ≤ error ≤ Δ/2. n_b 를 1 늘리면 SNR_dB = 6.02 n_b + 1.76 이 약 6 dB 오른다."
                : "L = 4: n_b = 2, SNR_dB = 6.02 × 2 + 1.76 ≈ 13.8 dB (L = 8 은 ≈ 19.8 dB). 레벨을 줄이면 bit rate 는 줄지만 품질이 떨어진다.");

      return {
        panels: [{ id: "P", title: "손으로 푸는 순서 (샘플마다 ①~⑤)", lang: "txt", lines: lines }],
        vars: [
          { name: "L", label: "L", group: "설정" },
          { name: "delta", label: "Δ", group: "설정" },
          { name: "nb", label: "n_b", group: "설정" },
          { name: "k", label: "샘플", group: "현재 샘플" },
          { name: "amp", label: "실제 진폭", group: "현재 샘플" },
          { name: "pam", label: "정규화 PAM 값", group: "현재 샘플" },
          { name: "q", label: "정규화 양자화 값", group: "현재 샘플" },
          { name: "err", label: "정규화 오차", group: "현재 샘플" },
          { name: "code", label: "quantization code", group: "현재 샘플" },
          { name: "bits", label: "encoded word", group: "현재 샘플" },
          { name: "codes", label: "code 누적", group: "출력" },
          { name: "stream", label: "비트열 누적", group: "출력" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
