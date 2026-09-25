// ============================================================
// pcm_pipeline — PCM 인코더 3단계: sampling(PAM) → quantizing(L=8) → encoding(3비트)
// CONTRACT §7. 슬라이드 L3 p.49–57.
// 시간축(초): 0 아날로그 곡선 → 1.5 PAM 막대가 T 마다 솟음 → 4.5 L=8 격자에 스냅 + 오차(빨강)
//   → 8 3비트 코드가 차례로 → 11.5 비트열 + bit rate = f_s × n_b → 14 끝
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["pcm_pipeline"] = {
  title: "PCM — 아날로그 곡선이 비트열이 되기까지 (sampling → quantizing → encoding)",
  desc: "[[PCM]] 인코더: T 초마다 [[sampling]] 해 [[PAM]] 막대를 만들고, L = 8 레벨에 [[quantization|양자화]](빨간 선 = [[quantization error]]), 레벨 번호를 3비트로 [[encoding]] 한다",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { sig: "#1d65b3", sigL: "#9fbfe6", hot: "#d6465f", dev: "#3b2f4a", devL: "#efe9f6", muted: "#777", grid: "#c9cfdb", ok: "#2e9e4f" };
    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + esc(s) + '</text>';
    }
    function show(a, b) {
      var k = [0], v = [a <= 0 ? 1 : 0];
      if (a > 0) { k.push(a / D, Math.min(1, (a + 0.1) / D)); v.push(0, 1); }
      if (b < D) { k.push(b / D, Math.min(1, (b + 0.1) / D)); v.push(1, 0); }
      if (k[k.length - 1] < 1) { k.push(1); v.push(v[v.length - 1]); }
      return '<animate attributeName="opacity" values="' + v.join(";") + '" keyTimes="' + k.map(function (x) { return +x.toFixed(4); }).join(";") + '" dur="' + D + 's" fill="freeze"/>';
    }
    function during(a, b, inner) { return '<g opacity="' + (a <= 0 ? 1 : 0) + '">' + inner + show(a, b) + '</g>'; }
    function kt(arr) { return arr.map(function (t) { return +(t / D).toFixed(4); }).join(";"); }
    function r1(v) { return Math.round(v * 10) / 10; }

    var X0 = 70, W = 470, CY = 160, S = 88;          // 값 1 → 88px
    function f(t) { return 0.62 * Math.sin(2 * Math.PI * t) + 0.28 * Math.sin(6 * Math.PI * t + 0.8); }
    function yv(v) { return CY - S * v; }
    // 아날로그 곡선 (점 40개, Catmull-Rom)
    var P = [], i;
    for (i = 0; i < 40; i++) { var u = i / 39; P.push([X0 + u * W, yv(f(u))]); }
    var curve = "M" + r1(P[0][0]) + " " + r1(P[0][1]);
    for (i = 0; i < 39; i++) {
      var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(39, i + 2)];
      curve += "C" + r1(p1[0] + (p2[0] - p0[0]) / 6) + " " + r1(p1[1] + (p2[1] - p0[1]) / 6) + " " +
        r1(p2[0] - (p3[0] - p1[0]) / 6) + " " + r1(p2[1] - (p3[1] - p1[1]) / 6) + " " + r1(p2[0]) + " " + r1(p2[1]);
    }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PCM 인코딩 애니메이션">';

    // ---- 축 ----
    s += '<line x1="' + X0 + '" y1="' + (CY - S - 8) + '" x2="' + X0 + '" y2="' + (CY + S + 8) + '" stroke="#555" stroke-width="1.5"/>';
    s += '<line x1="' + X0 + '" y1="' + CY + '" x2="' + (X0 + W + 10) + '" y2="' + CY + '" stroke="#555" stroke-width="1.5"/>';
    s += txt(X0 - 6, yv(1) + 4, "V_max", 11, C.muted, ' text-anchor="end"') + txt(X0 - 6, yv(-1) + 4, "V_min", 11, C.muted, ' text-anchor="end"');

    // ---- 양자화 격자 L = 8 (4.5초부터) ----
    var L = 8, DL = 2 / L, grid = "";
    for (i = 0; i <= L; i++) grid += '<line x1="' + X0 + '" y1="' + r1(yv(-1 + i * DL)) + '" x2="' + (X0 + W) + '" y2="' + r1(yv(-1 + i * DL)) + '" stroke="' + C.grid + '" stroke-dasharray="4 3"/>';
    for (i = 0; i < L; i++) {
      var mid = -1 + (i + 0.5) * DL;
      grid += txt(X0 + W + 16, r1(yv(mid) + 4), String(i), 11, C.dev, ' font-weight="700"');
    }
    grid += txt(X0 + W + 16, yv(1) - 8, "code", 11, C.muted);
    grid += '<line x1="' + (X0 + W + 30) + '" y1="' + r1(yv(1)) + '" x2="' + (X0 + W + 30) + '" y2="' + r1(yv(1 - DL)) + '" stroke="' + C.dev + '" stroke-width="2"/>' +
      txt(X0 + W + 36, r1(yv(1 - DL / 2) + 4), "Δ", 12, C.dev, ' font-weight="700" text-anchor="start"');
    s += during(4.5, D, grid);

    // 아날로그 곡선 (그려짐)
    s += '<path d="' + curve + '" fill="none" stroke="' + C.sig + '" stroke-width="2.5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100">' +
      '<animate attributeName="stroke-dashoffset" values="100;100;0;0" keyTimes="' + kt([0, 0.2, 1.4, D]) + '" dur="' + D + 's" fill="freeze"/>' +
      '<animate attributeName="opacity" values="1;1;0.45;0.45" keyTimes="' + kt([0, 4.5, 5, D]) + '" dur="' + D + 's" fill="freeze"/></path>';

    // ---- 샘플 10개 ----
    var N = 10, codes = [];
    for (var k = 0; k < N; k++) {
      var t = (k + 0.5) / N, x = r1(X0 + t * W), v = f(t);
      var idx = Math.max(0, Math.min(L - 1, Math.floor((v + 1) / DL)));
      var q = -1 + (idx + 0.5) * DL;
      var code = ("00" + idx.toString(2)).slice(-3);
      codes.push(code);
      var ha = Math.abs(S * v), ya = Math.min(CY, yv(v)), hq = Math.abs(S * q), yq = Math.min(CY, yv(q));
      var ts = 1.6 + k * 0.28, tq = 5 + k * 0.2;
      // PAM 막대: 0 → 원래 값 → 양자화 값
      s += '<rect x="' + (x - 8) + '" y="' + CY + '" width="16" height="0" fill="' + C.sigL + '" stroke="' + C.sig + '" stroke-width="1.2">' +
        '<animate attributeName="height" values="0;0;' + r1(ha) + ';' + r1(ha) + ';' + r1(hq) + ';' + r1(hq) + '" keyTimes="' + kt([0, ts, ts + 0.3, tq, tq + 0.3, D]) + '" dur="' + D + 's" fill="freeze"/>' +
        '<animate attributeName="y" values="' + CY + ';' + CY + ';' + r1(ya) + ';' + r1(ya) + ';' + r1(yq) + ';' + r1(yq) + '" keyTimes="' + kt([0, ts, ts + 0.3, tq, tq + 0.3, D]) + '" dur="' + D + 's" fill="freeze"/>' +
        '<animate attributeName="fill" values="' + C.sigL + ';' + C.sigL + ';' + C.devL + ';' + C.devL + '" keyTimes="' + kt([0, tq, tq + 0.3, D]) + '" dur="' + D + 's" fill="freeze"/></rect>';
      // 원래 값 점
      s += during(ts + 0.3, D, '<circle cx="' + x + '" cy="' + r1(yv(v)) + '" r="3.5" fill="' + C.sig + '"/>');
      // 양자화 오차 (빨간 선)
      s += during(tq + 0.3, D, '<line x1="' + (x + 11) + '" y1="' + r1(yv(v)) + '" x2="' + (x + 11) + '" y2="' + r1(yv(q)) + '" stroke="' + C.hot + '" stroke-width="3"/>');
      // 코드 (아래)
      s += during(8.2 + k * 0.28, D, txt(x, 290, code, 13, C.dev, ' font-weight="700" font-family="monospace"'));
      s += during(8.2 + k * 0.28, D, txt(x, 272, String(idx), 11, C.muted));
    }
    s += during(8, D, txt(X0 - 6, 272, "code", 11, C.muted, ' text-anchor="end"') + txt(X0 - 6, 290, "bits", 11, C.muted, ' text-anchor="end"'));
    s += during(5.8, D, txt(300, 57, "빨간 선 = 양자화 오차 (−Δ/2 ~ +Δ/2)", 11, C.hot, ' font-weight="700"'));
    // 비트열
    s += during(11.5, D, '<rect x="' + X0 + '" y="303" width="' + W + '" height="24" rx="5" fill="#fbf3b0" stroke="#b9a520"/>' +
      txt(X0 + W / 2, 320, codes.join(" "), 13, "#333", ' font-family="monospace" font-weight="700"'));

    // ---- 오른쪽 단계 패널 ----
    var PX = 612;
    s += '<rect x="' + PX + '" y="60" width="140" height="228" rx="8" fill="#f7f8fb" stroke="#d0d6e2"/>';
    var st = [
      [1.5, 4.5, "① Sampling", "T 마다 → PAM"],
      [4.5, 8, "② Quantizing", "L = 8 레벨에 스냅"],
      [8, 11.5, "③ Encoding", "n_b = log₂8 = 3비트"]
    ];
    st.forEach(function (e, j) {
      var yy = 92 + j * 58;
      s += during(e[0], e[1], '<rect x="' + (PX + 5) + '" y="' + (yy - 20) + '" width="130" height="48" rx="6" fill="#ffe3e8" stroke="' + C.hot + '" stroke-width="1.5"/>');
      s += txt(PX + 70, yy, e[2], 13, C.dev, ' font-weight="700"') + txt(PX + 70, yy + 18, e[3], 11, C.muted);
    });
    s += during(11.5, D, txt(PX + 70, 268, "bit rate = f_s × n_b", 12, C.hot, ' font-weight="700"'));

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "PCM 인코더: 아날로그 신호 → sampling → quantizing → encoding → 디지털 데이터"],
      [1.5, 4.5, "① Sampling: T 초마다 순간 진폭을 잰다 → PAM(Pulse Amplitude Modulation) 신호"],
      [4.5, 8, "② Quantizing: V_min~V_max 를 L = 8 레벨로 나눠 가장 가까운 중간값으로 근사"],
      [8, 11.5, "③ Encoding: 각 샘플의 레벨 번호(0~7)를 n_b = 3비트 코드워드로"],
      [11.5, D, "결과: 샘플당 3비트짜리 비트열 — bit rate = f_s × n_b"]
    ];
    caps.forEach(function (c) { s += during(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    s += txt(380, 350, "Δ = (V_max − V_min) / L · 오차는 반올림 때문에 생기고 되돌릴 수 없다 — L 을 키우면(비트 +1) 오차가 줄어 SNR_dB ≈ 6.02 n_b + 1.76", 11, C.muted);
    s += '</svg>';
    return s;
  }
};
