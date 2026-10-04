// ============================================================
// ethernet_evolution — L7 p.13 Evolution + p.29–42 (Fast / Gigabit / 10 Gigabit)
// 4세대가 시간축 위에 차례로: 10M(1.0s) → 100M(3.5) → 1G(6.0) → 10G(8.5). 10.5s 부터 결론
// 각 세대: 위 = 속도·이름, 가운데 = 작은 그림(bus / hub star / switch / fiber), 아래 = 바뀐 것
// 맨 아래 띠 = 같게 유지된 것 (3.5s 부터)
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["ethernet_evolution"] = {
  title: "Ethernet 4세대 — 무엇이 바뀌고 무엇이 그대로인가 (12초)",
  desc: "10 Mbps → 100 Mbps → 1 Gbps → 10 Gbps. '''48-bit [[MAC 주소]], frame format, 최소 64 / 최대 1518 bytes''' 는 그대로 두고, 속도를 올리는 대가로 거리를 줄이거나([[허브]] star, 250 m) [[CSMA/CD]] 를 버렸다([[스위치]] + [[full-duplex]])",
  duration: 12,
  build: function () {
    var D = 12;
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
    function host(x, y, col, colL) { return '<rect x="' + (x - 9) + '" y="' + (y - 7) + '" width="18" height="14" rx="2" fill="' + colL + '" stroke="' + col + '" stroke-width="1.5"/>'; }

    var XS = [140, 310, 480, 650], T0 = [1.0, 3.5, 6.0, 8.5];
    var GY = 168;   // 그림 중심 y

    var s = '<svg viewBox="0 0 760 368" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ethernet 세대별 진화 애니메이션">';
    s += '<defs><marker id="ee_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker>' +
      '<marker id="ee_arrowB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C.b + '"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.0, "Ethernet 은 4세대를 거쳤다 — 속도가 10배씩 올라갔다"],
      [1.0, 3.5, "Standard Ethernet 10 Mbps: 공유 bus(coax) + CSMA/CD (1-persistent), 최대 2500 m"],
      [3.5, 6.0, "Fast Ethernet 100 Mbps: 512 bits 를 지키려 bus 를 버리고 hub + star, 2500 m → 250 m"],
      [6.0, 8.5, "Gigabit Ethernet 1 Gbps: 거리를 또 줄이면 25 m? → switch + full-duplex, 충돌 없음"],
      [8.5, 10.5, "10 Gigabit Ethernet 10 Gbps: fiber + full-duplex only, 300 m ~ 40 km"],
      [10.5, D, "4세대 내내 48-bit 주소 · frame format · 64 / 1518 bytes 는 그대로였다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 시간축 ----
    s += '<line x1="30" y1="64" x2="740" y2="64" stroke="#555" stroke-width="2" marker-end="url(#ee_arrow)"/>';
    s += txt(735, 82, "시간", 11, C.muted, ' text-anchor="end"');
    var names = [["10 Mbps", "Standard"], ["100 Mbps", "Fast"], ["1 Gbps", "Gigabit"], ["10 Gbps", "10 Gigabit"]];
    XS.forEach(function (x, i) {
      s += vis(T0[i], D, '<circle cx="' + x + '" cy="64" r="7" fill="' + C.a + '" stroke="#fff" stroke-width="2"/>' +
        txt(x, 102, names[i][0], 16, C.a, ' font-weight="700"') + txt(x, 118, names[i][1] + " Ethernet", 11, C.muted));
    });

    // ---- 세대별 그림 ----
    // 1) bus + coax
    var x = XS[0];
    var g1 = '<line x1="' + (x - 70) + '" y1="' + GY + '" x2="' + (x + 70) + '" y2="' + GY + '" stroke="#555" stroke-width="4"/>';
    [-48, 0, 48].forEach(function (dx, k) {
      var cl = [[C.a, C.aL], [C.b, C.bL], [C.c, C.cL]][k];
      g1 += '<line x1="' + (x + dx) + '" y1="' + (GY - 22) + '" x2="' + (x + dx) + '" y2="' + GY + '" stroke="#999"/>' + host(x + dx, GY - 28, cl[0], cl[1]);
    });
    g1 += txt(x, GY + 20, "bus (coax) · CSMA/CD", 11, "#333");
    s += vis(T0[0], D, g1);
    // 2) hub + star
    x = XS[1];
    var g2 = '';
    [[-55, -26], [55, -26], [-55, 26], [55, 26]].forEach(function (p, k) {
      var cl = [[C.a, C.aL], [C.b, C.bL], [C.c, C.cL], [C.muted, "#eee"]][k];
      g2 += '<line x1="' + x + '" y1="' + GY + '" x2="' + (x + p[0]) + '" y2="' + (GY + p[1]) + '" stroke="#999"/>' + host(x + p[0], GY + p[1], cl[0], cl[1]);
    });
    g2 += '<rect x="' + (x - 18) + '" y="' + (GY - 10) + '" width="36" height="20" rx="3" fill="' + C.devL + '" stroke="' + C.dev + '" stroke-width="1.5"/>' + txt(x, GY + 4, "hub", 11, C.dev, ' font-weight="700"');
    g2 += txt(x, GY + 52, "passive hub · star · 250 m", 11, "#333");
    s += vis(T0[1], D, g2);
    // 3) switch + full-duplex
    x = XS[2];
    var g3 = '';
    [[-55, -26], [55, -26], [-55, 26], [55, 26]].forEach(function (p, k) {
      var cl = [[C.a, C.aL], [C.b, C.bL], [C.c, C.cL], [C.muted, "#eee"]][k];
      var ex = x + p[0] * 0.72, ey = GY + p[1] * 0.72;
      g3 += '<line x1="' + (x + p[0] * 0.3) + '" y1="' + (GY + p[1] * 0.3) + '" x2="' + ex + '" y2="' + ey + '" stroke="' + C.b + '" stroke-width="1.5" marker-start="url(#ee_arrowB)" marker-end="url(#ee_arrowB)"/>' + host(x + p[0], GY + p[1], cl[0], cl[1]);
    });
    g3 += '<rect x="' + (x - 22) + '" y="' + (GY - 11) + '" width="44" height="22" rx="3" fill="' + C.dev + '"/>' + txt(x, GY + 4, "switch", 11, "#fff", ' font-weight="700"');
    g3 += txt(x, GY + 52, "full-duplex · no collision", 11, "#333");
    s += vis(T0[2], D, g3);
    // 4) fiber
    x = XS[3];
    var g4 = '<rect x="' + (x - 22) + '" y="' + (GY - 11) + '" width="44" height="22" rx="3" fill="' + C.dev + '"/>' + txt(x, GY + 4, "switch", 11, "#fff", ' font-weight="700"');
    g4 += '<line x1="' + (x - 75) + '" y1="' + GY + '" x2="' + (x - 22) + '" y2="' + GY + '" stroke="' + C.c + '" stroke-width="4"/>' + host(x - 80, GY, C.a, C.aL);
    g4 += '<line x1="' + (x + 22) + '" y1="' + GY + '" x2="' + (x + 75) + '" y2="' + GY + '" stroke="' + C.c + '" stroke-width="4"/>' + host(x + 80, GY, C.b, C.bL);
    g4 += txt(x, GY + 26, "fiber (850~1350 nm)", 11, "#333");
    g4 += txt(x, GY + 52, "full-duplex only", 11, "#333");
    s += vis(T0[3], D, g4);
    s += vis(8.6, 11.4, '<circle r="4" fill="#fff" stroke="' + C.c + '" stroke-width="1.5"><animateMotion path="M' + (x - 72) + ',' + GY + ' H' + (x - 26) + '" begin="8.6s" dur="0.7s" repeatCount="4" fill="freeze"/></circle>');

    // ---- 바뀐 것 ----
    var changed = [
      ["coax / UTP / fiber", "최대 2500 m"],
      ["UTP·STP / fiber", "250 m (10배 ↓)"],
      ["half → mostly full-duplex", "CSMA/CD 불필요"],
      ["fiber 전용", "64B/66B 등 encoding"]
    ];
    s += vis(1.0, D, txt(20, 246, "바뀐 것", 12, C.red, ' text-anchor="start" font-weight="700"'));
    XS.forEach(function (xx, i) {
      s += vis(T0[i], D, txt(xx, 246, changed[i][0], 11, C.red) + txt(xx, 262, changed[i][1], 11, C.red, ' font-weight="700"'));
    });

    // ---- 같게 유지된 것 ----
    s += vis(3.5, D, '<rect x="20" y="280" width="720" height="30" rx="6" fill="' + C.aL + '" stroke="' + C.a + '"/>' +
      txt(380, 300, "같게 유지: 48-bit 주소 · frame format · 최소 64 / 최대 1518 bytes (compatible with Standard Ethernet)", 13, C.a, ' font-weight="700"'));
    s += vis(3.5, D, '<rect x="20" y="280" width="720" height="30" rx="6" fill="none" stroke="' + C.a + '" stroke-width="3">' +
      '<animate attributeName="stroke-opacity" values="1;0.1;1" begin="3.6s" dur="0.6s" repeatCount="2"/></rect>');

    // ---- 요점 ----
    s += vis(10.5, D, txt(380, 346, "호환성을 지키려 frame 은 그대로, 거리를 줄이거나 CSMA/CD 를 버렸다", 15, "#222", ' font-weight="700"'));
    s += vis(0, 10.5, txt(380, 346, "속도 ×10 → 최소 frame(512 bits)을 보내는 시간 ÷10 → 충돌 감지 거리도 ÷10", 12, C.muted));
    s += '</svg>';
    return s;
  }
};
