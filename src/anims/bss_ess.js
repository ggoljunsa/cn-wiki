// ============================================================
// bss_ess — L8 p.10–12 (BSS: ad hoc / infrastructure, ESS + distribution system, station mobility 3종)
// 0–1.5s 구성 → 1.5–4.0 no-transition(BSS1 안) → 4.6–7.0 BSS-transition(AP1→AP2) → 7.6–10.0 ESS-transition(다른 ESS) → 10–13 "연속성 보장 ✗"
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["bss_ess"] = {
  title: "BSS · ESS 와 station mobility — 13초",
  desc: "AP 가 없는 BSS 는 ad hoc, AP 가 있으면 infrastructure([[ad-hoc과 infrastructure]]). AP 가 있는 [[BSS]] 둘 이상을 [[distribution system]] 으로 묶으면 [[ESS]]. 스테이션은 BSS 안에서만(no-transition) → 다른 BSS 로(BSS-transition) → 다른 ESS 로(ESS-transition) 움직이며, IEEE 802.11 은 이동 중 연속성을 보장하지 않는다([[station mobility]])",
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
    function sta(x, y, col, colL) {
      return '<rect x="' + (x - 13) + '" y="' + (y - 9) + '" width="26" height="18" rx="3" fill="' + (colL || "#eee") + '" stroke="' + (col || "#999") + '" stroke-width="1.5"/>' +
        '<line x1="' + (x - 15) + '" y1="' + (y + 11) + '" x2="' + (x + 15) + '" y2="' + (y + 11) + '" stroke="' + (col || "#999") + '" stroke-width="2"/>';
    }
    function ap(x, y, name) {
      return '<line x1="' + (x + 12) + '" y1="' + (y - 11) + '" x2="' + (x + 12) + '" y2="' + (y - 20) + '" stroke="' + C.dev + '" stroke-width="2"/>' +
        '<rect x="' + (x - 22) + '" y="' + (y - 11) + '" width="44" height="22" rx="4" fill="' + C.dev + '"/>' + txt(x, y + 5, name, 12, "#fff", ' font-weight="700"');
    }

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="BSS, ESS, distribution system 과 station mobility 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "BSS = 스테이션들의 묶음. AP 가 있으면 infrastructure, 없으면 ad hoc"],
      [1.5, 4.0, "① No-transition mobility: 정지해 있거나 한 BSS 안에서만 움직인다"],
      [4.0, 4.6, "AP 가 있는 BSS 들이 distribution system 으로 연결 = ESS"],
      [4.6, 7.6, "② BSS-transition mobility: 같은 ESS 안에서 다른 BSS 로 (AP1 → AP2)"],
      [7.6, 10.0, "③ ESS-transition mobility: 한 ESS 에서 다른 ESS 로"],
      [10.0, D, "IEEE 802.11 은 이동 중 통신이 끊기지 않는다(continuous)고 보장하지 않는다 ✗"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- ad hoc BSS (오른쪽 위) ----
    var AH = [[620, 70], [700, 62], [665, 98]];
    s += '<rect x="585" y="42" width="160" height="78" rx="10" fill="#fffaf0" stroke="' + C.c + '" stroke-width="1.6"/>';
    [[0, 1], [1, 2], [0, 2]].forEach(function (p) {
      s += '<line x1="' + AH[p[0]][0] + '" y1="' + AH[p[0]][1] + '" x2="' + AH[p[1]][0] + '" y2="' + AH[p[1]][1] + '" stroke="' + C.c + '" stroke-width="1.5" stroke-dasharray="4 3">' +
        '<animate attributeName="stroke-dashoffset" values="0;-140" dur="' + D + 's" fill="freeze"/></line>';
    });
    AH.forEach(function (p) { s += sta(p[0], p[1], C.c, C.cL); });
    s += txt(665, 136, "Ad hoc BSS (AP 없음, 직접 통신)", 11, C.c, ' font-weight="700"');

    // ---- ESS 1 ----
    s += '<rect x="18" y="108" width="546" height="196" rx="10" fill="none" stroke="' + C.dev + '" stroke-width="1.6" stroke-dasharray="7 4"/>';
    s += txt(30, 124, "ESS", 13, C.dev, ' text-anchor="start" font-weight="700"');
    // BSS 박스
    s += '<rect x="30" y="152" width="252" height="140" rx="8" fill="' + C.aL + '" fill-opacity="0.45" stroke="' + C.a + '" stroke-width="1.5"/>';
    s += '<rect x="298" y="152" width="252" height="140" rx="8" fill="' + C.bL + '" fill-opacity="0.55" stroke="' + C.b + '" stroke-width="1.5"/>';
    s += txt(156, 286, "BSS 1 (infrastructure)", 11, C.a, ' font-weight="700"');
    s += txt(424, 286, "BSS 2 (infrastructure)", 11, C.b, ' font-weight="700"');
    // distribution system
    var A1 = [156, 180], A2 = [424, 180], A3 = [665, 190];
    s += '<path d="M' + A1[0] + ',' + (A1[1] - 11) + ' V140 H' + A2[0] + ' V' + (A2[1] - 11) + '" fill="none" stroke="' + C.dev + '" stroke-width="5"/>';
    s += txt(290, 133, "distribution system (wired / wireless)", 12, C.red, ' font-weight="700"');
    s += vis(4.0, 4.7, '<path d="M' + A1[0] + ',' + (A1[1] - 11) + ' V140 H' + A2[0] + ' V' + (A2[1] - 11) + '" fill="none" stroke="' + C.c + '" stroke-width="9" stroke-opacity="0.5"/>');
    // 다른 스테이션들
    [[70, 248], [245, 230], [340, 220], [515, 250], [470, 215]].forEach(function (p) { s += sta(p[0], p[1]); });

    // ---- 다른 ESS ----
    s += '<rect x="585" y="152" width="160" height="152" rx="10" fill="none" stroke="' + C.muted + '" stroke-width="1.6" stroke-dasharray="7 4"/>';
    s += txt(665, 286, "다른 ESS", 11, C.muted, ' font-weight="700"');
    s += sta(715, 255);
    s += ap(A3[0], A3[1], "AP3");

    // ---- 이동하는 스테이션 ----
    var T = [0, 1.5, 2.7, 4.0, 4.6, 7.0, 7.6, 10.0, D];
    var P = [[105, 222], [105, 222], [215, 258], [150, 228], [150, 228], [390, 252], [390, 252], [650, 248], [650, 248]];
    var kt = T.map(function (t) { return r4(t / D); }).join(";");
    var px = P.map(function (p) { return p[0]; }).join(";"), py = P.map(function (p) { return p[1]; }).join(";");
    function link(apx, apy, from, to, col, dash) {
      return vis(from, to, '<line x1="' + apx + '" y1="' + (apy + 11) + '" x2="' + P[0][0] + '" y2="' + P[0][1] + '" stroke="' + col + '" stroke-width="2" stroke-dasharray="' + dash + '">' +
        '<animate attributeName="x2" values="' + px + '" keyTimes="' + kt + '" dur="' + D + 's" fill="freeze"/>' +
        '<animate attributeName="y2" values="' + py + '" keyTimes="' + kt + '" dur="' + D + 's" fill="freeze"/></line>');
    }
    s += link(A1[0], A1[1], 0, 5.8, C.a, "5 3");
    s += link(A2[0], A2[1], 5.8, 8.7, C.b, "5 3");
    s += link(A3[0], A3[1], 9.6, D, C.muted, "2 4");
    s += ap(A1[0], A1[1], "AP1") + ap(A2[0], A2[1], "AP2");
    s += '<g><g>' + sta(0, 0, C.a, C.aL) + txt(0, 4, "S", 11, C.a, ' font-weight="700"') + '</g>' +
      '<animateTransform attributeName="transform" type="translate" values="' + P.map(function (p) { return p[0] + ',' + p[1]; }).join(";") + '" keyTimes="' + kt + '" dur="' + D + 's" fill="freeze"/></g>';

    // ---- 단계별 표지 ----
    s += vis(1.5, 4.0, '<rect x="30" y="80" width="260" height="22" rx="11" fill="#fff" stroke="' + C.a + '"/>' + txt(160, 95, "① no-transition (BSS 1 안)", 11, C.a, ' font-weight="700"'));
    s += vis(5.8, 7.6, '<rect x="30" y="80" width="260" height="22" rx="11" fill="#fff" stroke="' + C.b + '"/>' + txt(160, 95, "② BSS-transition: AP1 → AP2", 11, C.b, ' font-weight="700"'));
    s += vis(8.6, 9.7, '<circle cx="572" cy="250" r="18" fill="' + C.red + '" fill-opacity="0.15" stroke="' + C.red + '" stroke-width="2"/>' + txt(572, 256, "✗", 16, C.red, ' font-weight="700"') +
      txt(572, 222, "연결 끊김", 11, C.red, ' font-weight="700"'));
    s += vis(9.6, D, '<rect x="30" y="80" width="260" height="22" rx="11" fill="#fff" stroke="' + C.red + '"/>' + txt(160, 95, "③ ESS-transition: 다른 ESS 로", 11, C.red, ' font-weight="700"') +
      '<rect x="620" y="215" width="90" height="18" rx="3" fill="#fff" stroke="' + C.red + '"/>' + txt(665, 228, "연속성 보장 ✗", 12, C.red, ' font-weight="700"'));

    // ---- 요점 ----
    s += '<rect x="20" y="326" width="720" height="32" rx="6" fill="#f6f6f6" stroke="#ddd"/>';
    s += txt(380, 347, "BSS(ad hoc / infrastructure) 여럿 + distribution system = ESS  |  mobility: no-transition · BSS-transition · ESS-transition", 12, "#333", ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
