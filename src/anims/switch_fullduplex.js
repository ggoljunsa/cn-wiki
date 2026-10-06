// ============================================================
// switch_fullduplex — L7 p.33 Solution #2, p.39–40 (Gigabit: full-duplex, central switch, no collision)
// 왼쪽 hub(공유 매체): 1.5s A·C 동시 전송 → 3.0s hub 에서 충돌(빨강) ~5.2s
// 오른쪽 switch: 5.2s A→D, C→B 동시 전송 → 6.6s buffer 저장 → 7.4~8.6s 목적지 포트로만 전달 → 8.6s~ "No need for CSMA/CD"
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["switch_fullduplex"] = {
  title: "Hub 는 충돌, switch 는 충돌 없음 — 10초",
  desc: "공유 매체인 [[허브]] 에서는 A 와 C 가 동시에 보내면 [[collision]]. link-layer [[스위치]] 는 호스트마다 [[full-duplex]] 전용 링크를 주고 frame 을 buffer 에 저장했다가 목적지 포트로만 보내므로 충돌이 없다 → No need for [[CSMA/CD]]",
  duration: 10,
  build: function () {
    var D = 10;
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
    // (x0,y0)→(x1,y1) 를 t0~t1 동안 이동하고 from~to 동안 보이는 frame 상자
    function frame(x0, y0, x1, y1, t0, t1, from, to, col, colL, label) {
      return '<g opacity="0">' +
        '<g><rect x="-17" y="-8" width="34" height="16" rx="2" fill="' + colL + '" stroke="' + col + '" stroke-width="1.8"/>' +
        txt(0, 4, label, 10, col, ' font-weight="700"') +
        '<animateTransform attributeName="transform" type="translate" values="' + x0 + ',' + y0 + ';' + x0 + ',' + y0 + ';' + x1 + ',' + y1 + ';' + x1 + ',' + y1 +
        '" keyTimes="0;' + r4(t0 / D) + ';' + r4(t1 / D) + ';1" dur="' + D + 's" fill="freeze"/></g>' +
        show(from, to) + '</g>';
    }
    function host(x, y, name, col, colL) {
      return '<rect x="' + (x - 18) + '" y="' + (y - 13) + '" width="36" height="26" rx="4" fill="' + colL + '" stroke="' + col + '" stroke-width="2"/>' + txt(x, y + 5, name, 14, col, ' font-weight="700"');
    }
    var HC = [["A", C.a, C.aL], ["B", C.b, C.bL], ["C", C.c, C.cL], ["D", C.muted, "#eee"]];

    var s = '<svg viewBox="0 0 760 350" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="hub 충돌과 switch full-duplex 비교 애니메이션">';
    s += '<defs><marker id="sf_arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.b + '"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "같은 상황 두 번: A 와 C 가 동시에 frame 을 보낸다"],
      [1.5, 3.0, "Hub = 공유 매체: 모든 호스트가 한 채널을 같이 쓴다 — A, C 의 신호가 hub 에서 만난다"],
      [3.0, 5.2, "Collision! — 공유 매체(hub, bus)에서는 그래서 CSMA/CD 가 필요하다"],
      [5.2, 6.6, "Switch: 호스트마다 full-duplex 전용 링크 — A→D, C→B 를 동시에 보낸다"],
      [6.6, 7.4, "Switch 가 frame 을 buffer 에 저장하고 목적지 MAC 주소를 본다"],
      [7.4, 8.6, "목적지 포트로만 전달 — 동시에 보내도 충돌 없음"],
      [8.6, D, "충돌이 없으니 감지할 필요도 없다 → No need for CSMA/CD"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 패널 제목 ----
    s += txt(190, 58, "① Hub (shared medium)", 13, C.dev, ' font-weight="700"');
    s += txt(570, 58, "② Link-layer switch (full-duplex)", 13, C.dev, ' font-weight="700"');
    s += '<line x1="380" y1="46" x2="380" y2="300" stroke="#ddd" stroke-width="1.5"/>';

    // ---- 왼쪽: hub ----
    var HX = 190, HY = 175;
    var LP = [[80, 100], [300, 100], [80, 250], [300, 250]];   // A B C D
    LP.forEach(function (p) { s += '<line x1="' + HX + '" y1="' + HY + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="#999" stroke-width="3"/>'; });
    LP.forEach(function (p, i) { s += host(p[0], p[1], HC[i][0], HC[i][1], HC[i][2]); });
    var hubBox = '<rect x="' + (HX - 24) + '" y="' + (HY - 14) + '" width="48" height="28" rx="4" fill="' + C.devL + '" stroke="' + C.dev + '" stroke-width="2"/>' + txt(HX, HY + 5, "hub", 13, C.dev, ' font-weight="700"');
    // A, C 동시에 hub 로
    s += frame(LP[0][0], LP[0][1], HX - 20, HY - 12, 1.5, 3.0, 1.5, 3.1, C.a, C.aL, "A");
    s += frame(LP[2][0], LP[2][1], HX - 20, HY + 12, 1.5, 3.0, 1.5, 3.1, C.c, C.cL, "C");
    // 충돌
    s += vis(3.0, 5.2, '<circle cx="' + HX + '" cy="' + HY + '" r="34" fill="' + C.red + '" fill-opacity="0.18" stroke="' + C.red + '" stroke-width="2.5">' +
      '<animate attributeName="r" values="22;38;22" begin="3s" dur="0.7s" repeatCount="3"/></circle>' +
      txt(HX + 62, HY + 5, "collision!", 14, C.red, ' font-weight="700"'));
    LP.forEach(function (p) {
      s += vis(3.2, 5.2, '<line x1="' + HX + '" y1="' + HY + '" x2="' + r4(HX + (p[0] - HX) * 0.78) + '" y2="' + r4(HY + (p[1] - HY) * 0.78) + '" stroke="' + C.red + '" stroke-width="3" stroke-dasharray="6 4"/>');
    });
    s += hubBox;
    s += vis(3.2, D, txt(190, 290, "garbled 신호가 모든 포트로 → 재전송(backoff)", 11, C.red));

    // ---- 오른쪽: switch ----
    var SX = 570, SY = 175;
    var RP = [[460, 100], [680, 100], [460, 250], [680, 250]];
    RP.forEach(function (p) {
      // full-duplex: 두 가닥 (들어가는 선 / 나가는 선)
      var dx = p[0] - SX, dy = p[1] - SY, L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L * 4, ny = dx / L * 4;
      s += '<line x1="' + r4(SX + nx) + '" y1="' + r4(SY + ny) + '" x2="' + r4(p[0] + nx) + '" y2="' + r4(p[1] + ny) + '" stroke="' + C.b + '" stroke-width="1.6"/>';
      s += '<line x1="' + r4(SX - nx) + '" y1="' + r4(SY - ny) + '" x2="' + r4(p[0] - nx) + '" y2="' + r4(p[1] - ny) + '" stroke="' + C.b + '" stroke-width="1.6"/>';
    });
    RP.forEach(function (p, i) { s += host(p[0], p[1], HC[i][0], HC[i][1], HC[i][2]); });
    s += '<rect x="' + (SX - 40) + '" y="' + (SY - 22) + '" width="80" height="44" rx="5" fill="' + C.dev + '"/>' + txt(SX, SY - 5, "switch", 13, "#fff", ' font-weight="700"');
    // buffer 칸
    s += '<rect x="' + (SX - 38) + '" y="' + (SY + 2) + '" width="76" height="14" rx="2" fill="#fff" stroke="#bbb"/>';
    s += txt(SX, SY + 13, "buffer", 9, C.muted);
    // A→switch→D, C→switch→B
    s += frame(RP[0][0], RP[0][1], SX - 18, SY + 9, 5.2, 6.6, 5.2, 7.45, C.a, C.aL, "A→D");
    s += frame(RP[2][0], RP[2][1], SX + 18, SY + 9, 5.2, 6.6, 5.2, 7.45, C.c, C.cL, "C→B");
    s += frame(SX - 18, SY + 9, RP[3][0], RP[3][1] - 24, 7.4, 8.6, 7.4, D, C.a, C.aL, "A→D");
    s += frame(SX + 18, SY + 9, RP[1][0], RP[1][1] + 24, 7.4, 8.6, 7.4, D, C.c, C.cL, "C→B");
    s += vis(6.6, 7.45, '<rect x="' + (SX - 50) + '" y="' + (SY + 27) + '" width="100" height="18" rx="3" fill="#fff" stroke="' + C.dev + '"/>' + txt(SX, SY + 40, "목적지 MAC 확인", 11, C.dev, ' font-weight="700"'));
    s += vis(8.6, D, '<rect x="' + (SX - 140) + '" y="276" width="280" height="24" rx="5" fill="' + C.bL + '" stroke="' + C.b + '"/>' +
      txt(SX, 293, "No collision → No need for CSMA/CD", 13, C.b, ' font-weight="700"'));
    s += vis(5.2, 8.6, txt(570, 290, "링크마다 두 가닥 = 보내기·받기 동시에 (full-duplex)", 11, C.b));

    // ---- 요점 ----
    s += '<rect x="20" y="310" width="720" height="30" rx="6" fill="#f6f6f6" stroke="#ddd"/>';
    s += txt(380, 330, "공유 매체(hub) → 충돌 → CSMA/CD 필요  |  switch + full-duplex 전용 링크 → 충돌 없음 → No need for CSMA/CD", 12, "#333", ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
