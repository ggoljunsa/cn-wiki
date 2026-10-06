// ============================================================
// hidden_station — L8 p.20–21 (hidden station problem / RTS·CTS 해결), p.35 (exposed station)
// ① 0–5.8s: A→B Data 중 C 가 채널 idle 로 보고 전송 → B 에서 collision (A·C 는 모름)
// ② 5.8–11.6s: A 의 RTS → B 의 CTS 가 A·C 양쪽에 닿음 → C 가 NAV 타이머 → A 의 Data 무사
// ③ 11.6–14s: exposed station — A→B 전송 중, C 는 D 에게 보내도 되는데 A 의 RTS 때문에 참음
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["hidden_station"] = {
  title: "Hidden station 과 RTS/CTS — 14초",
  desc: "A 와 C 는 서로의 전파 범위 밖이라 C 는 A 의 전송을 못 듣고 보내 버린다 → B 에서 [[collision]], 그런데 아무도 감지 못 함([[hidden station problem]]). [[RTS와 CTS]] 핸드셰이크에서 B 의 CTS 가 C 에게도 닿으면 C 는 [[NAV]] 를 세우고 기다린다. 마지막 장면은 반대 경우인 [[exposed station problem]]",
  duration: 14,
  build: function () {
    var D = 14;
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
    function frame(x0, y0, x1, y1, t0, t1, from, to, col, colL, label, w) {
      w = w || 40;
      return '<g opacity="0">' +
        '<g><rect x="' + (-w / 2) + '" y="-9" width="' + w + '" height="18" rx="2" fill="' + colL + '" stroke="' + col + '" stroke-width="1.8"/>' +
        txt(0, 4, label, 11, col, ' font-weight="700"') +
        '<animateTransform attributeName="transform" type="translate" values="' + x0 + ',' + y0 + ';' + x0 + ',' + y0 + ';' + x1 + ',' + y1 + ';' + x1 + ',' + y1 +
        '" keyTimes="0;' + r4(t0 / D) + ';' + r4(t1 / D) + ';1" dur="' + D + 's" fill="freeze"/></g>' +
        show(from, to) + '</g>';
    }
    // 전파가 퍼지는 원 (t0→t1 동안 반지름 0→rx)
    function ring(cx, cy, rx, ry, t0, t1, from, to, col) {
      var kt = '0;' + r4(t0 / D) + ';' + r4(t1 / D) + ';1';
      return '<g opacity="0"><ellipse cx="' + cx + '" cy="' + cy + '" rx="0" ry="0" fill="' + col + '" fill-opacity="0.07" stroke="' + col + '" stroke-width="2" stroke-dasharray="5 3">' +
        '<animate attributeName="rx" values="0;0;' + rx + ';' + rx + '" keyTimes="' + kt + '" dur="' + D + 's" fill="freeze"/>' +
        '<animate attributeName="ry" values="0;0;' + ry + ';' + ry + '" keyTimes="' + kt + '" dur="' + D + 's" fill="freeze"/>' +
        '</ellipse>' + show(from, to) + '</g>';
    }
    function host(x, y, name, col, colL) {
      return '<rect x="' + (x - 20) + '" y="' + (y - 15) + '" width="40" height="30" rx="4" fill="' + colL + '" stroke="' + col + '" stroke-width="2"/>' + txt(x, y + 5, name, 15, col, ' font-weight="700"');
    }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="hidden station 문제와 RTS/CTS 해결, exposed station 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "A 와 C 는 서로의 전파 범위 밖 — 가운데 B 만 둘 다 들린다"],
      [1.5, 2.6, "A → B 로 Data 전송 시작 (A 의 신호는 C 까지 못 간다)"],
      [2.6, 3.5, "C 가 carrier sense: 아무것도 안 들림 → 채널 idle 로 판단"],
      [3.5, 4.4, "C 도 B 에게 전송 시작 — C 에게 A 는 숨은(hidden) 스테이션"],
      [4.4, 5.8, "B 에서 collision! — A·C 는 서로 못 들으니 CSMA/CD 로는 감지 못 함"],
      [5.8, 7.0, "해결: A 가 먼저 짧은 RTS(Request To Send) 를 보낸다"],
      [7.0, 8.6, "B 의 CTS(Clear To Send, duration 포함) 가 A 와 C 양쪽에 닿는다"],
      [8.6, 10.6, "C 는 CTS 의 duration 으로 NAV 타이머를 세우고 조용히 기다린다"],
      [10.6, 11.6, "A 의 Data 가 충돌 없이 B 에 도착 — hidden station 문제 해결"],
      [11.6, D, "반대 경우 exposed station: C→D 는 괜찮은데 A 의 RTS 를 들어서 참는다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 장면 제목 ----
    s += vis(0, 5.8, txt(380, 54, "① 문제: hidden station problem", 13, C.red, ' font-weight="700"'));
    s += vis(5.8, 11.6, txt(380, 54, "② 해결: RTS/CTS handshake + NAV", 13, C.b, ' font-weight="700"'));
    s += vis(11.6, D, txt(380, 54, "③ 반대 경우: exposed station problem (p.35)", 13, C.dev, ' font-weight="700"'));

    // ================= ①·② 공통 그림 (0–11.6s) =================
    var Y = 175, AX = 225, BX = 380, CX = 535, RX = 215, RY = 92;
    var m = '';
    m += '<ellipse cx="' + AX + '" cy="' + Y + '" rx="' + RX + '" ry="' + RY + '" fill="' + C.a + '" fill-opacity="0.04" stroke="' + C.a + '" stroke-width="1.4"/>';
    m += '<ellipse cx="' + CX + '" cy="' + Y + '" rx="' + RX + '" ry="' + RY + '" fill="' + C.c + '" fill-opacity="0.05" stroke="' + C.c + '" stroke-width="1.4"/>';
    m += txt(AX - 70, Y - RY + 18, "Range of A", 12, C.a);
    m += txt(CX + 70, Y - RY + 18, "Range of C", 12, C.c);
    m += txt(BX, Y + 32, "겹친 영역", 11, C.muted);
    // 장면별 동적 요소
    // ① A→B Data, C→B Data, 충돌
    m += ring(AX, Y, RX, RY, 1.5, 2.6, 1.5, 4.4, C.a);
    m += frame(AX + 30, Y - 34, BX - 34, Y - 34, 1.5, 4.4, 1.5, 5.8, C.a, C.aL, "Data");
    m += vis(2.6, 3.5, '<rect x="' + (CX - 68) + '" y="' + (Y - 66) + '" width="136" height="22" rx="11" fill="#fff" stroke="' + C.c + '"/>' + txt(CX, Y - 51, "…조용함 = idle?", 12, C.c, ' font-weight="700"'));
    m += vis(2.6, 5.8, '<line x1="' + (AX + RX) + '" y1="' + (Y + 40) + '" x2="' + (AX + RX) + '" y2="' + (Y + 66) + '" stroke="' + C.a + '" stroke-width="3"/>' + txt(AX + RX + 6, Y + 62, "← A 신호는 여기까지 (C 에 못 닿음)", 11, C.a, ' text-anchor="start"'));
    m += frame(CX - 30, Y - 34, BX + 34, Y - 34, 3.5, 4.4, 3.5, 5.8, C.c, C.cL, "Data");
    m += vis(4.4, 5.8, '<circle cx="' + BX + '" cy="' + (Y - 34) + '" r="30" fill="' + C.red + '" fill-opacity="0.18" stroke="' + C.red + '" stroke-width="2.5">' +
      '<animate attributeName="r" values="24;36;24" begin="4.4s" dur="0.7s" repeatCount="2"/></circle>' +
      txt(BX, Y - 74, "collision!", 15, C.red, ' font-weight="700"'));
    m += vis(4.4, 5.8, txt(AX, Y + 46, "A: 충돌 모름", 12, C.red, ' font-weight="700"') + txt(CX, Y + 46, "C: 충돌 모름", 12, C.red, ' font-weight="700"'));
    // ② RTS, CTS, NAV, Data
    m += ring(AX, Y, RX, RY, 5.8, 6.8, 5.8, 7.0, C.a);
    m += frame(AX + 30, Y - 34, BX - 30, Y - 34, 5.8, 6.9, 5.8, 7.1, C.a, C.aL, "RTS", 34);
    m += ring(BX, Y, 200, 80, 7.0, 8.0, 7.0, 8.7, C.b);
    m += frame(BX - 30, Y - 34, AX + 30, Y - 34, 7.0, 8.1, 7.0, 8.7, C.b, C.bL, "CTS", 34);
    m += frame(BX + 30, Y - 34, CX - 30, Y - 34, 7.0, 8.1, 7.0, 8.7, C.b, C.bL, "CTS", 34);
    m += vis(7.6, 8.7, txt(BX, Y + 110, "CTS 안에 duration(= Data+ACK 시간) 이 들어 있다", 12, C.b, ' font-weight="700"'));
    // NAV 막대 (C 아래, 줄어드는 타이머)
    var NW = 110, NX = CX - NW / 2, NY = Y + 28;
    m += vis(8.6, 11.6, '<rect x="' + NX + '" y="' + NY + '" width="' + NW + '" height="14" rx="2" fill="#fff" stroke="' + C.muted + '"/>' +
      '<rect x="' + NX + '" y="' + NY + '" width="' + NW + '" height="14" rx="2" fill="#ccc">' +
      '<animate attributeName="width" values="' + NW + ';' + NW + ';0;0" keyTimes="0;' + r4(8.6 / D) + ';' + r4(11.4 / D) + ';1" dur="' + D + 's" fill="freeze"/></rect>' +
      txt(CX, NY + 11, "NAV", 10, "#333", ' font-weight="700"') +
      txt(CX, NY + 30, "C: 타이머 끝날 때까지 대기", 11, C.c, ' font-weight="700"'));
    m += frame(AX + 30, Y - 34, BX - 34, Y - 34, 8.8, 10.6, 8.8, 11.6, C.a, C.aL, "Data");
    m += vis(10.6, 11.6, txt(BX, Y - 58, "✓ 무사 도착", 13, C.b, ' font-weight="700"'));
    // 호스트
    m += host(AX, Y, "A", C.a, C.aL) + host(BX, Y, "B", C.b, C.bL) + host(CX, Y, "C", C.c, C.cL);
    s += '<g>' + m + '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;' + r4(11.5 / D) + ';' + r4(11.6 / D) + ';1" dur="' + D + 's" fill="freeze"/></g>';

    // ================= ③ exposed station (11.6–14s) =================
    var e = '', EY = 165, EB = 150, EA = 320, EC = 490, ED = 660;
    e += '<ellipse cx="' + EA + '" cy="' + EY + '" rx="200" ry="80" fill="' + C.a + '" fill-opacity="0.05" stroke="' + C.a + '" stroke-width="1.4"/>';
    e += txt(EA, EY - 86, "Range of A", 12, C.a);
    e += frame(EA - 30, EY - 32, EB + 30, EY - 32, 11.8, 13.0, 11.8, D, C.a, C.aL, "Data");
    e += txt(EB + 28, EY + 40, "A → B 전송 중", 11, C.a);
    e += '<line x1="' + (EC + 24) + '" y1="' + EY + '" x2="' + (ED - 26) + '" y2="' + EY + '" stroke="' + C.muted + '" stroke-width="2" stroke-dasharray="6 4"/>';
    e += '<path d="M' + (ED - 26) + ',' + EY + ' l-9,-5 v10 z" fill="' + C.muted + '"/>';
    e += txt((EC + ED) / 2, EY - 10, "C→D ?", 12, C.muted, ' font-weight="700"');
    e += vis(12.4, D, txt((EC + ED) / 2 + 2, EY + 6, "✗", 20, C.red, ' font-weight="700"') +
      '<rect x="' + (EC - 70) + '" y="' + (EY + 30) + '" width="250" height="40" rx="6" fill="#fff" stroke="' + C.red + '"/>' +
      txt(EC + 55, EY + 47, "A 의 RTS 를 들었으니 참는다…", 12, C.red, ' font-weight="700"') +
      txt(EC + 55, EY + 63, "사실 D 쪽은 B 와 무관 → 보내도 됐다", 11, C.muted));
    e += host(EB, EY, "B", C.b, C.bL) + host(EA, EY, "A", C.a, C.aL) + host(EC, EY, "C", C.c, C.cL) + host(ED, EY, "D", C.muted, "#eee");
    s += vis(11.6, D, e);

    // ---- 요점 ----
    s += '<rect x="20" y="318" width="720" height="30" rx="6" fill="#f6f6f6" stroke="#ddd"/>';
    s += txt(380, 338, "Hidden: 못 들어서 충돌(감지도 못 함) → RTS/CTS + NAV 로 완화  |  Exposed: 들려서 괜히 참음 → 효율 ↓", 12, "#333", ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
