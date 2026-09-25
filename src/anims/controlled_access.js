// ============================================================
// controlled_access — L6 p.50–54 Controlled access 세 장면
// 시간축(초): 0~5 Reservation(minislot 1·3·4 에 1 → Data station 1, 3, 4)
//   → 5~10.5 Polling(Select: SEL→ACK→Data→ACK / Poll: Poll→NAK, Poll→Data→ACK)
//   → 10.5~15 Token passing(token 이 logical ring 을 돌고, 가진 스테이션만 전송)
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["controlled_access"] = {
  title: "Controlled access — reservation · polling · token passing 15초",
  desc: "누가 보낼지 미리 정하는 [[controlled access]] 세 가지: [[reservation]](minislot 에 예약한 순서대로), [[polling]](primary 가 SEL/Poll 로 지명), [[token passing]](token 을 가진 스테이션만 전송)",
  duration: 15,
  build: function () {
    var D = 15;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", aM: "#9cc3ea", b: "#2e9e4f", bL: "#dff3e4",
      c: "#e09a40", cL: "#fdeec2", dev: "#3b2f4a", devL: "#efe9f6",
      red: "#d6465f", redL: "#fbe3e7", yel: "#fff59d", yelS: "#b59b00", muted: "#777"
    };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function box(x, y, w, h, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5"' + (extra || "") + '/>';
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

    var S1 = [0, 5], S2 = [5, 10.5], S3 = [10.5, D];

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Controlled access 애니메이션">';
    s += '<defs><marker id="ca_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#444"/></marker>' +
      '<marker id="ca_blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.a + '"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 2.6, "Reservation: 전송 전에 reservation frame 의 자기 minislot 에 1 을 표시해 예약"],
      [2.6, 5, "예약한 스테이션만 reservation frame 뒤에 차례로 data frame 전송 (1 → 3 → 4)"],
      [5, 7.6, "Polling · Select: primary 가 보낼 게 있을 때 SEL 로 준비 확인 → ACK → Data → ACK"],
      [7.6, 10.5, "Polling · Poll: primary 가 차례로 Poll — 보낼 게 없으면 NAK, 있으면 Data → primary 가 ACK"],
      [10.5, 12.8, "Token passing: token 이 logical ring 을 돈다 — token 을 가진 스테이션만 채널 접근"],
      [12.8, D, "전송을 마치면 token 을 다음 스테이션에 넘긴다 → 동시에 보내는 일이 없다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 장면 탭 ----
    [["① Reservation", 130, S1], ["② Polling", 380, S2], ["③ Token passing", 630, S3]].forEach(function (t) {
      s += box(t[1] - 90, 38, 180, 22, "#fff", "#ccc") + txt(t[1], 54, t[0], 12, C.muted);
      s += vis(t[2][0], t[2][1], box(t[1] - 90, 38, 180, 22, C.devL, C.dev) + txt(t[1], 54, t[0], 12, C.dev, ' font-weight="700"'));
    });

    // =============== 장면 1: Reservation ===============
    var g1 = "";
    g1 += '<line x1="60" y1="84" x2="716" y2="84" stroke="' + C.a + '" stroke-width="2" marker-end="url(#ca_blue)"/>';
    g1 += txt(388, 78, "Direction of packet movement", 12, C.a);
    var MX = 560, MW = 28, MY = 120;
    function slotX(n) { return MX + (5 - n) * MW; }     // minislot n (5 4 3 2 1 순서로 왼→오)
    for (var n = 5; n >= 1; n--) {
      g1 += txt(slotX(n) + MW / 2, MY - 6, String(n), 12, "#333");
      g1 += '<rect x="' + slotX(n) + '" y="' + MY + '" width="' + MW + '" height="30" fill="#fff" stroke="#555" stroke-width="1.2"/>';
    }
    g1 += txt(MX + 70, MY - 24, "Reservation frame", 11, C.muted);
    // 0 → 1 로 바뀌는 minislot
    var res = { 1: 1.0, 3: 1.5, 4: 2.0 };
    for (n = 1; n <= 5; n++) {
      var x0 = slotX(n) + MW / 2;
      if (res[n]) {
        g1 += vis(0, res[n], txt(x0, MY + 20, "0", 14, "#333"));
        g1 += vis(res[n], S1[1], '<rect x="' + (slotX(n) + 1) + '" y="' + (MY + 1) + '" width="' + (MW - 2) + '" height="28" fill="' + C.aM + '"/>' + txt(x0, MY + 20, "1", 14, "#123f70", ' font-weight="700"'));
      } else g1 += txt(x0, MY + 20, "0", 14, "#333");
    }
    // 스테이션 5 개
    var STX = [95, 225, 355, 485, 615];
    STX.forEach(function (x, i) {
      var id = i + 1;
      g1 += box(x, 236, 92, 30, "#fff", "#999") + txt(x + 46, 256, "Station " + id, 12, "#333");
      if (res[id]) {
        g1 += vis(res[id], S1[1], box(x, 236, 92, 30, C.aL, C.a) + txt(x + 46, 256, "Station " + id, 12, C.a, ' font-weight="700"') +
          txt(x + 46, 284, "예약", 11, C.a, ' font-weight="700"'));
      }
    });
    // 예약 순서대로 data frame (reservation frame 바로 뒤 = 왼쪽으로 쌓임)
    [[1, 2.6, 452], [3, 3.2, 348], [4, 3.8, 244]].forEach(function (d) {
      g1 += vis(d[1], S1[1], box(d[2], MY, 96, 30, "#6fc3f0", "#1b6fa8") + txt(d[2] + 48, MY + 20, "Data station " + d[0], 12, "#0d3553", ' font-weight="700"') +
        '<path d="M' + (slotX(d[0]) + MW / 2) + ',' + (MY + 30) + ' V' + (MY + 56 + d[0] * 3) + ' H' + (d[2] + 48) + ' V' + (MY + 34) + '" fill="none" stroke="#444" stroke-width="1.2" marker-end="url(#ca_arrow)"/>');
    });
    s += vis(S1[0], S1[1], g1);

    // =============== 장면 2: Polling ===============
    var g2 = "";
    function lane(x, name, col) {
      return txt(x, 86, name, 13, col, ' font-weight="700"') + '<line x1="' + x + '" y1="94" x2="' + x + '" y2="300" stroke="' + col + '" stroke-width="1.5"/>';
    }
    function msg(num, x1, x2, y, label, fill, stroke, t) {
      var mx = (x1 + x2) / 2;
      return vis(t, S2[1], '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + (y + 10) + '" stroke="#333" stroke-width="1.5" marker-end="url(#ca_arrow)"/>' +
        box(mx - 26, y - 6, 52, 20, fill, stroke) + txt(mx, y + 9, label, 12, "#222", ' font-weight="700"') +
        '<circle cx="' + x1 + '" cy="' + y + '" r="8" fill="#222"/>' + txt(x1, y + 4, String(num), 11, "#fff", ' font-weight="700"'));
    }
    g2 += txt(195, 70, "Select", 14, C.red, ' font-weight="700"');
    g2 += lane(70, "Primary", C.dev) + lane(320, "B", C.b);
    g2 += msg(1, 70, 320, 118, "SEL", C.cL, C.c, 5.3);
    g2 += msg(2, 320, 70, 162, "ACK", C.yel, C.yelS, 5.9);
    g2 += msg(3, 70, 320, 206, "Data", C.aL, C.a, 6.5);
    g2 += msg(4, 320, 70, 250, "ACK", C.yel, C.yelS, 7.1);
    g2 += '<line x1="380" y1="70" x2="380" y2="300" stroke="#ddd" stroke-width="1.5"/>';
    g2 += txt(575, 70, "Poll", 14, C.red, ' font-weight="700"');
    g2 += lane(430, "Primary", C.dev) + lane(600, "A", C.a) + lane(710, "B", C.b);
    g2 += msg(1, 430, 600, 110, "Poll", C.cL, C.c, 7.7);
    g2 += msg(2, 600, 430, 150, "NAK", C.redL, C.red, 8.3);
    g2 += msg(3, 430, 710, 190, "Poll", C.cL, C.c, 8.9);
    g2 += msg(4, 710, 430, 230, "Data", C.aL, C.a, 9.5);
    g2 += msg(5, 430, 710, 270, "ACK", C.yel, C.yelS, 10);
    g2 += vis(8.3, S2[1], txt(655, 145, "보낼 것 없음", 11, C.red, ' font-weight="700"'));
    s += vis(S2[0], S2[1], g2);

    // =============== 장면 3: Token passing ===============
    var g3 = "";
    var P = { 1: [250, 125], 2: [510, 125], 4: [510, 265], 3: [250, 265] };
    var ring = "M250,125 H510 V265 H250 Z";              // 1 → 2 → 4 → 3 → 1 (길이 260+140+260+140 = 800)
    g3 += '<path d="' + ring + '" fill="none" stroke="#555" stroke-width="2"/>';
    [[380, 125, 0], [510, 195, 90], [380, 265, 180], [250, 195, 270]].forEach(function (m) {
      g3 += '<path d="M-6,-6 L6,0 L-6,6 z" fill="#555" transform="translate(' + m[0] + ',' + m[1] + ') rotate(' + m[2] + ')"/>';
    });
    g3 += txt(380, 200, "logical ring", 13, C.muted);
    [1, 2, 3, 4].forEach(function (id) {
      var p = P[id];
      g3 += box(p[0] - 42, p[1] - 17, 84, 34, "#fff", "#777") + txt(p[0], p[1] + 5, "Station " + id, 12, "#333", ' font-weight="700"');
    });
    // Station 2 가 token 을 가진 동안 강조 + Data 전송
    g3 += vis(11.4, 12.8, box(P[2][0] - 42, P[2][1] - 17, 84, 34, C.bL, C.b) + txt(P[2][0], P[2][1] + 5, "Station 2", 12, C.b, ' font-weight="700"') +
      '<text x="' + (P[2][0] + 52) + '" y="' + (P[2][1] + 4) + '" font-size="12" fill="' + C.b + '" font-weight="700">token 보유 → 전송 중</text>');
    g3 += '<g opacity="0">' + box(-22, -10, 44, 20, C.aL, C.a) + txt(0, 5, "Data", 11, C.a, ' font-weight="700"') +
      '<animateMotion path="M510,150 V240" begin="11.5s" dur="1.2s" fill="freeze"/>' + show(11.5, 12.7) + '</g>';
    // token
    g3 += '<g opacity="0"><g transform="translate(0,-30)"><circle r="11" fill="#f2c200" stroke="#8a6d00" stroke-width="2"/>' + txt(0, 4, "T", 12, "#5a4700", ' font-weight="700"') + txt(26, 4, "token", 11, "#8a6d00", ' font-weight="700"') + '</g>' +
      '<animateMotion path="' + ring + '" begin="10.7s" dur="3.8s" fill="freeze" calcMode="linear" keyPoints="0;0.325;0.325;1" keyTimes="0;0.18;0.55;1"/>' +
      show(10.7, D) + '</g>';
    g3 += vis(12.8, D, '<text x="' + (P[3][0] - 52) + '" y="' + (P[3][1] + 4) + '" font-size="11" fill="' + C.muted + '" text-anchor="end">token 없는 스테이션은 대기</text>');
    s += vis(S3[0], S3[1], g3);

    // ---- 요점 ----
    s += txt(380, 350, "Controlled access: 누가 보낼지 미리 정한다(예약 · primary 의 지명 · token) → 권한 없는 스테이션은 보내지 않아 충돌이 없다", 12, "#333");
    s += '</svg>';
    return s;
  }
};
