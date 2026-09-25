// ============================================================
// hamming_sphere — L5 p.29 (검출) / p.33 (정정) 의 "geographical meaning of d_min"
// 예: d_min = 5 → 검출 s = 4 (d_min = s+1), 정정 t = 2 (d_min = 2t+1)
// 시간축(초): 0 x, y 표시 → 1.5 반지름 s 원이 커짐 → 3.5 y 에 안 닿음(검출) → 6 두 영역 반지름 t
//   → 8.5 손상된 codeword 가 가장 가까운 x 로 복원 → 13
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["hamming_sphere"] = {
  title: "d_min 의 기하학적 의미 — 검출 원과 정정 영역 13초",
  desc: "valid codeword x, y 사이 거리가 [[minimum Hamming distance]] d_min. 검출은 반지름 s 원이 y 에 안 닿으면(d_min = s+1), 정정은 반지름 t 영역 두 개가 안 겹치면(d_min = 2t+1) 된다 ([[Hamming distance]])",
  duration: 13,
  build: function () {
    var D = 13;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", b: "#2e9e4f", bL: "#dff3e4",
      c: "#e09a40", cL: "#fdeec2", dev: "#3b2f4a", devL: "#efe9f6",
      red: "#d6465f", muted: "#777"
    };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function box(x, y, w, h, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.6"' + (extra || "") + '/>';
    }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    // from~to 초에만 보이기 (0.12초 페이드, 앞뒤 자막이 겹치지 않게 to 직전에 사라짐. to >= D 이면 끝까지 유지)
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    // 반지름이 t0→t1 동안 0→R 로 커지는 원
    function grow(cx, cy, R, t0, t1, style) {
      return '<circle cx="' + cx + '" cy="' + cy + '" r="0" ' + style + '>' +
        '<animate attributeName="r" values="0;0;' + R + ';' + R + '" keyTimes="0;' + r4(t0 / D) + ';' + r4(t1 / D) + ';1" dur="' + D + 's" fill="freeze"/></circle>';
    }
    var DM = 'd<tspan baseline-shift="sub" font-size="75%">min</tspan>';

    var U = 34;                      // Hamming distance 1 = 34px
    var XX = 190, YX = XX + 5 * U, CY = 200;   // x, y 위치 (거리 5)
    var S = 4, T = 2;

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hamming distance 기하학적 의미 애니메이션">';
    s += '<defs><marker id="hs_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C.b + '"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "valid codeword x, y — 둘 사이의 Hamming distance 가 가장 작은 값 = " + DM + " = 5"],
      [1.5, 3.5, "검출: x 가 s 비트 이하로 손상되면 → x 중심 반지름 s 원 안의 어딘가"],
      [3.5, 6, DM + " = s + 1 이면 원이 y 에 안 닿음 → 손상돼도 다른 valid codeword 가 될 수 없다"],
      [6, 8.5, "정정: x, y 각각 반지름 t 영역(territory) — " + DM + " = 2t + 1 이면 두 영역이 안 겹친다"],
      [8.5, D, "t 비트 이하로 손상된 codeword 는 한 영역에만 속함 → 가장 가까운 valid codeword 로 복원"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 1단계: 검출 원 (반지름 s) ----
    var ph1 = grow(XX, CY, S * U, 1.5, 3.3, 'fill="' + C.aL + '" fill-opacity="0.6" stroke="' + C.a + '" stroke-width="2"');
    // 손상된 codeword 들 (각도°, 거리)
    var dots1 = [[70, 1], [100, 2], [160, 3], [215, 4], [280, 2.5], [335, 3.5], [60, 3], [200, 1.5], [130, 4], [305, 4], [250, 3.5], [20, 2.5]];
    dots1.forEach(function (p, i) {
      var ang = p[0] * Math.PI / 180;
      var px = r4(XX + Math.cos(ang) * p[1] * U), py = r4(CY - Math.sin(ang) * p[1] * U);
      ph1 += vis(2 + i * 0.1, 6, '<circle cx="' + px + '" cy="' + py + '" r="4.5" fill="' + C.red + '"/>');
    });
    ph1 += vis(2.2, 6, '<line x1="' + XX + '" y1="' + CY + '" x2="' + XX + '" y2="' + (CY + S * U) + '" stroke="' + C.a + '" stroke-width="2" stroke-dasharray="5 3"/>' +
      '<text x="' + (XX + 6) + '" y="' + (CY + S * U - 30) + '" font-size="13" fill="' + C.a + '" font-weight="700">반지름 s = 4</text>');
    s += vis(1.5, 6, ph1);
    // y 는 원 밖
    s += vis(3.5, 6, box(YX - 40, CY - 64, 104, 26, "#fff", C.b) + txt(YX + 12, CY - 46, "y 는 원 밖 ✓", 13, C.b, ' font-weight="700"'));

    // ---- 2단계: 정정 영역 (반지름 t) ----
    var ph2 = grow(XX, CY, T * U, 6.2, 7.8, 'fill="' + C.aL + '" fill-opacity="0.7" stroke="' + C.a + '" stroke-width="2"');
    ph2 += grow(YX, CY, T * U, 6.2, 7.8, 'fill="' + C.bL + '" fill-opacity="0.7" stroke="' + C.b + '" stroke-width="2"');
    ph2 += vis(7.8, D, txt(XX, CY - T * U - 10, "Territory of x (t = 2)", 12, C.a, ' font-weight="700"') + txt(YX, CY - T * U - 10, "Territory of y (t = 2)", 12, C.b, ' font-weight="700"'));
    // 영역 사이 틈 (거리 1)
    ph2 += vis(7.8, D, '<path d="M' + (XX + T * U) + ',' + (CY + 10) + ' v6 h' + U + ' v-6" fill="none" stroke="' + C.red + '" stroke-width="1.5"/>' +
      txt(XX + T * U + U / 2, CY + 32, "틈", 12, C.red, ' font-weight="700"'));
    // 손상된 codeword r: x 에서 거리 2 → x 로 복원
    var ra = -55 * Math.PI / 180;
    var rx = r4(XX + Math.cos(ra) * 1.9 * U), ry = r4(CY - Math.sin(ra) * 1.9 * U);
    ph2 += vis(8.5, D, '<circle cx="' + rx + '" cy="' + ry + '" r="6" fill="' + C.red + '"/>' +
      '<text x="' + (rx + 10) + '" y="' + (ry + 18) + '" font-size="12" fill="' + C.red + '" font-weight="700">수신 (2 비트 오류)</text>');
    ph2 += vis(9.3, D, '<line x1="' + rx + '" y1="' + ry + '" x2="' + (XX + 8) + '" y2="' + (CY + 9) + '" stroke="' + C.b + '" stroke-width="2.5" marker-end="url(#hs_arrow)"/>' +
      '<text x="' + (rx + 10) + '" y="' + (ry + 34) + '" font-size="12" fill="' + C.b + '" font-weight="700">가장 가까운 x 로 복원 ✓</text>');
    s += vis(6, D, ph2);

    // ---- x, y 점과 거리 눈금 (항상) ----
    var axis = '<line x1="' + XX + '" y1="' + CY + '" x2="' + YX + '" y2="' + CY + '" stroke="#555" stroke-width="1.2" stroke-dasharray="2 3"/>';
    for (var k = 1; k < 5; k++) {
      axis += '<line x1="' + (XX + k * U) + '" y1="' + (CY - 5) + '" x2="' + (XX + k * U) + '" y2="' + (CY + 5) + '" stroke="#555" stroke-width="1.2"/>';
      axis += txt(XX + k * U, CY - 9, String(k), 11, C.muted);
    }
    s += axis;
    s += '<rect x="' + (XX - 8) + '" y="' + (CY - 8) + '" width="16" height="16" fill="#333"/>' + txt(XX - 18, CY + 5, "x", 15, "#222", ' font-weight="700"');
    s += '<rect x="' + (YX - 8) + '" y="' + (CY - 8) + '" width="16" height="16" fill="#333"/>' + txt(YX + 18, CY + 5, "y", 15, "#222", ' font-weight="700"');

    // ---- 오른쪽 공식 판 ----
    s += box(540, 70, 205, 250, "#fafafa", "#ccc");
    s += txt(642, 94, "Legend", 12, C.muted, ' font-weight="700"');
    s += '<rect x="556" y="106" width="12" height="12" fill="#333"/><text x="576" y="117" font-size="12" fill="#333">valid codeword</text>';
    s += '<circle cx="562" cy="134" r="5" fill="' + C.red + '"/><text x="576" y="138" font-size="12" fill="#333">corrupted codeword</text>';
    s += vis(3.5, D, box(552, 156, 181, 66, C.aL, C.a) +
      txt(642, 176, "검출 (detection)", 12, C.a, ' font-weight="700"') +
      txt(642, 196, DM + " = s + 1", 15, "#222", ' font-weight="700"') +
      txt(642, 214, "5 = 4 + 1 → s = 4", 12, C.muted));
    s += vis(6, D, box(552, 234, 181, 70, C.bL, C.b) +
      txt(642, 254, "정정 (correction)", 12, C.b, ' font-weight="700"') +
      txt(642, 275, DM + " = 2t + 1", 15, "#222", ' font-weight="700"') +
      txt(642, 294, "5 = 2·2 + 1 → t = 2", 12, C.muted));

    // ---- 요점 ----
    s += txt(380, 360, "s 개 오류 검출 ⟺ " + DM + " = s + 1 · t 개 오류 정정 ⟺ " + DM + " = 2t + 1 — 정정은 영역 두 개가 안 겹칠 만큼 멀어야 한다", 12, "#333");
    s += '</svg>';
    return s;
  }
};
