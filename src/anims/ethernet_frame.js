// ============================================================
// ethernet_frame — L7 p.18 Ethernet frame format
// 7 필드가 왼쪽부터 차례로 등장: Preamble(1.0s) → SFD(2.5) → Dest(4.0) → Src(5.0) → Type(6.0) → Data+padding(7.0) → CRC(8.8)
// 9.6s 부터 최소 64 / 최대 1518 괄호, 끝까지 유지
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["ethernet_frame"] = {
  title: "Ethernet frame — 7 필드가 차례로 나가는 12초",
  desc: "[[MAC 주소]] 두 개, Type, Data and padding(46–1500 bytes), [[CRC]]-32. 앞의 Preamble + SFD 는 physical-layer header 라 최소 64 / 최대 1518 bytes 계산에 들어가지 않는다",
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

    var Y = 112, HH = 50;
    // [이름, 폭, 크기 라벨, 등장 시각, 채움, 테두리]
    var F = [
      ["Preamble", 105, "7 bytes", 1.0, C.cL, C.c],
      ["SFD", 45, "1 byte", 2.5, C.cL, C.c],
      ["Destination address", 100, "6 bytes", 4.0, C.aL, C.a],
      ["Source address", 100, "6 bytes", 5.0, C.aL, C.a],
      ["Type", 60, "2 bytes", 6.0, C.devL, C.dev],
      ["Data and padding", 200, "46–1500 bytes", 7.0, C.bL, C.b],
      ["CRC", 60, "4 bytes", 8.8, C.devL, C.dev]
    ];
    var x = 60;
    F.forEach(function (f) { f.push(x); x += f[1]; });   // f[6] = x 시작
    var XEND = x;

    var s = '<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ethernet frame format 애니메이션">';
    s += '<defs><marker id="ef_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker>' +
      '<marker id="ef_arrowR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.0, "Ethernet frame (IEEE 802.3) — 필드가 왼쪽부터 차례로 회선에 실린다"],
      [1.0, 2.5, "Preamble 7 bytes: 56 bits of alternating 1s and 0s — 수신자 clock 을 맞추는 경보"],
      [2.5, 4.0, "SFD 1 byte = 10101011: 마지막 '11' 이 \"이제 진짜 frame 시작\" 이라는 flag"],
      [4.0, 5.0, "Destination address 6 bytes — 받는 쪽 MAC 주소가 먼저 온다"],
      [5.0, 6.0, "Source address 6 bytes — 보낸 쪽 MAC 주소"],
      [6.0, 7.0, "Type 2 bytes — 위 계층 프로토콜(예: IP)이 무엇인지"],
      [7.0, 8.8, "Data and padding: 데이터가 46 bytes 보다 짧으면 padding 으로 46 까지 채운다"],
      [8.8, 9.6, "CRC 4 bytes (CRC-32) — 오류가 있으면 drop silently"],
      [9.6, D, "최소 6+6+2+46+4 = 64 bytes (512 bits) / 최대 6+6+2+1500+4 = 1518 bytes"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 전송 방향 화살표 (왼쪽이 먼저 나감) ----
    var ym = Y + HH / 2;
    s += '<path d="M56,' + (ym - 6) + ' H34 V' + (ym - 16) + ' L14,' + ym + ' L34,' + (ym + 16) + ' V' + (ym + 6) + ' H56 z" fill="' + C.red + '"/>';
    s += txt(36, Y + HH + 18, "먼저 나감", 11, C.muted);

    // ---- 필드 ----
    F.forEach(function (f, i) {
      var fx = f[6], w = f[1], inner = '<rect x="' + fx + '" y="' + Y + '" width="' + w + '" height="' + HH + '" fill="' + f[4] + '" stroke="' + f[5] + '" stroke-width="1.5"/>';
      if (f[0] === "Destination address" || f[0] === "Source address") {
        inner += txt(fx + w / 2, Y + 21, f[0].split(" ")[0], 12, "#222") + txt(fx + w / 2, Y + 36, "address", 12, "#222");
      } else if (f[0] === "Data and padding") {
        inner += "";
      } else if (f[0] === "SFD") {
        inner += txt(fx + w / 2, Y + 30, "SFD", 12, "#222", ' font-weight="700"');
      } else {
        inner += txt(fx + w / 2, Y + 30, f[0], 12, "#222", ' font-weight="700"');
      }
      inner += txt(fx + w / 2, Y + HH + 16, f[2], 11, C.muted);
      s += vis(f[3], D, inner);
    });

    // Preamble 비트 깜빡임 (1.0~2.5s)
    var P = F[0];
    s += vis(1.0, 2.5, '<g>' + txt(P[6] + P[1] / 2, Y - 8, "1010101010…", 12, C.c, ' font-family="monospace" font-weight="700"') +
      '<animate attributeName="opacity" values="1;0.2;1" begin="1s" dur="0.3s" repeatCount="5"/></g>');
    s += vis(2.5, D, txt(P[6] + P[1] / 2, Y - 8, "56 bits 1010…", 11, C.muted, ' font-family="monospace"'));
    // SFD 깃발
    var S = F[1], fx = S[6] + S[1] / 2;
    s += vis(2.5, D, '<line x1="' + fx + '" y1="' + Y + '" x2="' + fx + '" y2="' + (Y - 46) + '" stroke="' + C.c + '" stroke-width="2"/>' +
      '<path d="M' + fx + ',' + (Y - 46) + ' l40,8 l-40,8 z" fill="' + C.c + '"/>' +
      txt(fx + 46, Y - 34, "10101011", 12, C.c, ' text-anchor="start" font-family="monospace" font-weight="700"'));

    // Data + padding (7.0~8.5s 동안 data 가 자라고 padding 이 나머지를 채움)
    var Dt = F[5], dx = Dt[6], dw = Dt[1], dataW = 120;
    var k0 = r4(7.0 / D), k1 = r4(7.7 / D), k2 = r4(8.5 / D);
    s += vis(7.0, D,
      '<rect x="' + dx + '" y="' + (Y + 1) + '" width="0" height="' + (HH - 2) + '" fill="#9fd6ae">' +
      '<animate attributeName="width" values="0;0;' + dataW + ';' + dataW + '" keyTimes="0;' + k0 + ';' + k1 + ';1" dur="' + D + 's" fill="freeze"/></rect>' +
      '<rect x="' + (dx + dataW) + '" y="' + (Y + 1) + '" width="0" height="' + (HH - 2) + '" fill="#d9d9d9">' +
      '<animate attributeName="width" values="0;0;' + (dw - dataW) + ';' + (dw - dataW) + '" keyTimes="0;' + k1 + ';' + k2 + ';1" dur="' + D + 's" fill="freeze"/></rect>' +
      txt(dx + dataW / 2, Y + 24, "data", 12, "#14532d", ' font-weight="700"') +
      txt(dx + dataW / 2, Y + 39, "예: 30 bytes", 10, "#14532d"));
    s += vis(7.7, D, txt(dx + dataW + (dw - dataW) / 2, Y + 24, "padding", 12, "#444", ' font-weight="700"') +
      txt(dx + dataW + (dw - dataW) / 2, Y + 39, "+16 → 46", 10, "#444"));
    // payload 범위 화살표 (위)
    s += vis(7.0, D, '<line x1="' + dx + '" y1="' + (Y - 12) + '" x2="' + (dx + dw) + '" y2="' + (Y - 12) + '" stroke="#555" stroke-width="1.2" marker-start="url(#ef_arrowR)" marker-end="url(#ef_arrowR)"/>' +
      txt(dx + dw / 2, Y - 20, "payload 46 ~ 1500 bytes", 11, "#333", ' font-weight="700"'));

    // ---- 괄호: physical-layer header / frame 길이 ----
    var yb = Y + HH + 34;
    var phys = '<path d="M' + F[0][6] + ',' + (yb - 6) + ' v6 H' + (F[1][6] + F[1][1]) + ' v-6" fill="none" stroke="' + C.c + '" stroke-width="1.8"/>' +
      txt((F[0][6] + F[1][6] + F[1][1]) / 2, yb + 16, "Physical-layer", 12, C.c, ' font-weight="700"') +
      txt((F[0][6] + F[1][6] + F[1][1]) / 2, yb + 31, "header", 12, C.c, ' font-weight="700"');
    var fr = '<path d="M' + F[2][6] + ',' + (yb - 6) + ' v6 H' + XEND + ' v-6" fill="none" stroke="' + C.a + '" stroke-width="1.8"/>' +
      txt((F[2][6] + XEND) / 2, yb + 16, "Minimum frame length: 512 bits = 64 bytes", 13, C.a, ' font-weight="700"') +
      txt((F[2][6] + XEND) / 2, yb + 33, "Maximum frame length: 12,144 bits = 1518 bytes", 13, C.a, ' font-weight="700"');
    s += vis(9.6, D, phys + fr);
    s += vis(10.4, D, txt((F[2][6] + XEND) / 2, yb + 56, "최소 64 → CSMA/CD 충돌 감지(T_fr ≥ 2T_p) / 최대 1518 → 한 station 의 독점 방지·buffer 크기", 11, C.muted));
    s += vis(10.4, D, txt((F[0][6] + F[1][6] + F[1][1]) / 2, yb + 56, "(8 bytes 제외)", 11, C.muted));

    // ---- 요점 ----
    s += '<rect x="20" y="304" width="720" height="28" rx="6" fill="#f6f6f6" stroke="#ddd"/>';
    s += txt(380, 323, "Preamble + SFD 는 physical-layer header 라 64 / 1518 bytes 에 안 들어간다 (Dest ~ CRC 만 센다)", 13, "#333", ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
