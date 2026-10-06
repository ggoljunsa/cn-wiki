// ============================================================
// csma_ca_timeline — L8 p.14–15 (DCF 그림 · NAV). 슬라이드의 세로 시간축을 가로로 눕힘
// 줄: A(Source) / B(Destination) / Other stations(C, D)
// 1.2s DIFS → 2.2 RTS → 3.4 SIFS → 4.0 CTS → 5.2 SIFS → 5.8 Data → 8.4 SIFS → 9.0 ACK → 10.2 끝 (NAV 는 RTS 끝~ACK 끝)
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["csma_ca_timeline"] = {
  title: "CSMA/CA 타임라인 — DIFS·RTS·CTS·Data·ACK 와 NAV",
  desc: "[[DCF]] 의 [[CSMA/CA]]: A 는 DIFS 를 기다린 뒤 RTS, B 는 SIFS 뒤 CTS, A 는 SIFS 뒤 Data, B 는 SIFS 뒤 ACK. 다른 스테이션들은 RTS/CTS 에 담긴 duration 으로 [[NAV]] 를 세우고 그동안 채널을 보지 않는다. 간격은 [[interframe space]]",
  duration: 13,
  build: function () {
    var D = 13;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", b: "#2e9e4f", bL: "#dff3e4", c: "#e09a40", cL: "#fdeec2",
      dev: "#3b2f4a", devL: "#efe9f6", red: "#d6465f", muted: "#777"
    };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    function grow(w, t0, t1) {
      return '<animate attributeName="width" values="0;0;' + w + ';' + w + '" keyTimes="0;' + r4(t0 / D) + ';' + r4(t1 / D) + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    var X0 = 160, RH = 34;
    var ROWS = [[95, "A", "Source", C.a, C.aL], [165, "B", "Destination", C.b, C.bL], [235, "C, D", "Other stations", C.muted, "#eee"]];
    // 왼쪽→오른쪽 픽셀 구간: [x0, x1, row, label, t0, t1, kind]
    var SEG = [
      [160, 205, 0, "DIFS", 1.2, 2.2, "ifs"],
      [205, 275, 0, "RTS", 2.2, 3.4, "frame"],
      [275, 297, 1, "SIFS", 3.4, 4.0, "ifs"],
      [297, 367, 1, "CTS", 4.0, 5.2, "frame"],
      [367, 389, 0, "SIFS", 5.2, 5.8, "ifs"],
      [389, 589, 0, "Data", 5.8, 8.4, "frame"],
      [589, 611, 1, "SIFS", 8.4, 9.0, "ifs"],
      [611, 681, 1, "ACK", 9.0, 10.2, "frame"]
    ];

    var s = '<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CSMA/CA DCF 타임라인 애니메이션">';
    s += '<defs><pattern id="ct_hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#f3f3f3"/><line x1="0" y1="0" x2="0" y2="6" stroke="#bbb" stroke-width="2"/></pattern>' +
      '<marker id="ct_arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.2, "송신 A 에 보낼 frame 이 생겼다 — 먼저 채널이 idle 인지 감지(carrier sense)"],
      [1.2, 2.2, "채널 idle → DIFS(DCF interframe space) 만큼 더 기다린다"],
      [2.2, 3.4, "A → B: RTS (Request To Send) — 채널을 점유할 duration 을 담는다"],
      [3.4, 4.0, "B 는 SIFS(short interframe space) 만큼 기다린 뒤"],
      [4.0, 5.2, "B → A: CTS (Clear To Send) — 다른 스테이션들은 NAV 를 세운다"],
      [5.2, 5.8, "A 도 SIFS 를 기다린 뒤"],
      [5.8, 8.4, "A → B: Data — 다른 스테이션들은 NAV 가 끝날 때까지 채널을 보지 않는다"],
      [8.4, 9.0, "B 는 SIFS 뒤에"],
      [9.0, 10.2, "B → A: ACK — 충돌을 감지하는 대신 ACK 로 성공을 확인한다"],
      [10.2, D, "ACK 끝 = NAV 끝 → 다른 스테이션들이 다시 채널을 감지할 수 있다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 줄 라벨·기준선 ----
    ROWS.forEach(function (r) {
      s += '<line x1="' + X0 + '" y1="' + (r[0] + RH / 2) + '" x2="725" y2="' + (r[0] + RH / 2) + '" stroke="#ccc" stroke-width="1.2"/>';
      s += txt(80, r[0] + 14, r[1], 15, r[3], ' font-weight="700"');
      s += txt(80, r[0] + 30, r[2], 11, C.muted);
    });
    s += '<line x1="' + X0 + '" y1="62" x2="' + X0 + '" y2="280" stroke="#ccc" stroke-dasharray="3 3"/>';
    s += '<line x1="' + X0 + '" y1="290" x2="730" y2="290" stroke="#555" stroke-width="1.5" marker-end="url(#ct_arr)"/>';
    s += txt(722, 284, "Time", 12, "#555", ' text-anchor="end"');

    // ---- 블록들 ----
    SEG.forEach(function (g) {
      var r = ROWS[g[2]], y = r[0], w = g[1] - g[0], mid = (g[0] + g[1]) / 2;
      if (g[6] === "ifs") {
        s += '<rect x="' + g[0] + '" y="' + (y + 6) + '" height="' + (RH - 12) + '" width="0" fill="url(#ct_hatch)" stroke="#999">' + grow(w, g[4], g[5]) + '</rect>';
        s += vis(g[4], D, txt(mid, y - 4, g[3], 11, "#555", ' font-weight="700"'));
      } else {
        s += '<rect x="' + g[0] + '" y="' + y + '" height="' + RH + '" width="0" rx="2" fill="' + r[4] + '" stroke="' + r[3] + '" stroke-width="2">' + grow(w, g[4], g[5]) + '</rect>';
        s += vis(Math.max(g[4] + 0.3, g[5] - 0.4), D, txt(mid, y + 22, g[3], 14, r[3], ' font-weight="700"'));
      }
    });
    // A↔B 방향 표시 (frame 이 끝날 때 상대 줄로)
    [[1, 240, 0, 1], [3, 332, 1, 0], [5, 489, 0, 1], [7, 646, 1, 0]].forEach(function (q) {
      var g = SEG[q[0]], y0 = ROWS[q[2]][0], y1 = ROWS[q[3]][0];
      var ya = q[2] < q[3] ? y0 + RH + 2 : y0 - 2, yb = q[2] < q[3] ? y1 - 2 : y1 + RH + 2;
      s += vis(g[5], D, '<line x1="' + q[1] + '" y1="' + ya + '" x2="' + q[1] + '" y2="' + yb + '" stroke="#555" stroke-width="1.4" stroke-dasharray="3 2" marker-end="url(#ct_arr)"/>');
    });

    // ---- NAV: RTS 끝(275) → ACK 끝(681), 지금 진행 중인 블록의 오른쪽 끝을 따라 자란다 ----
    var NY = ROWS[2][0], NX = 275;
    var kt = [0, 3.4, 4.0, 5.2, 5.8, 8.4, 9.0, 10.2, D].map(function (t) { return r4(t / D); }).join(";");
    var wv = [0, 0, 297, 367, 389, 589, 611, 681, 681].map(function (x, i) { return i < 2 ? 0 : x - NX; }).join(";");
    s += '<rect x="' + NX + '" y="' + NY + '" height="' + RH + '" width="0" fill="#d9d9d9" stroke="#777" stroke-width="1.5">' +
      '<animate attributeName="width" values="' + wv + '" keyTimes="' + kt + '" dur="' + D + 's" fill="freeze"/></rect>';
    s += vis(4.0, 9.0, txt(NX + 8, NY + 22, "NAV", 13, "#333", ' text-anchor="start" font-weight="700"'));
    s += vis(9.0, D, txt(478, NY + 22, "NAV — 이 시간 동안 채널을 감지하지 않음", 13, "#333", ' font-weight="700"'));
    s += vis(3.4, D, txt(NX, NY + RH + 15, "RTS 의 duration 으로 설정 (CTS 를 들은 쪽도)", 10, C.muted, ' text-anchor="start"'));
    s += vis(10.2, D, '<line x1="681" y1="62" x2="681" y2="280" stroke="' + C.b + '" stroke-dasharray="4 3" stroke-width="1.5"/>' +
      txt(690, NY + 14, "이제", 11, C.b, ' text-anchor="start" font-weight="700"') + txt(690, NY + 28, "감지 가능", 11, C.b, ' text-anchor="start" font-weight="700"'));

    // ---- 요점 ----
    s += '<rect x="20" y="302" width="720" height="30" rx="6" fill="#f6f6f6" stroke="#ddd"/>';
    s += txt(380, 322, "CSMA/CA 는 충돌을 감지하지 않고(무선은 half-duplex) 피한다: RTS/CTS + NAV + IFS", 13, "#333", ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
