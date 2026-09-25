// ============================================================
// layer_stack — 5계층 스택: 캡슐화 → 스위치(L1–L2) → 라우터(L1–L3) → 역캡슐화
// CONTRACT §7. 슬라이드 L1 p.31·32·38.
// 시간축(초): 0 A 의 message → 1.5 segment → 2.5 datagram → 3.5 frame → 4.5 bits
//   → 5.3 링크 → 6.2 스위치(L2 까지 보고 통과) → 7.6 링크 → 8.4 라우터(L3 까지 벗기고 다시 [2])
//   → 10.2 링크 → 11 B 에서 올라감 → 13 message 도착 → 14 끝
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["layer_stack"] = {
  title: "5계층 스택 — message 가 bits 가 되어 건너가고 다시 message 가 되는 14초",
  desc: "호스트 A 에서 내려가며 헤더 4·3·2 가 붙고([[캡슐화]]), [[스위치]]는 L2 까지만, [[라우터]]는 L3 까지 벗겼다가 새 [2] 를 붙여 보내고, 호스트 B 에서 올라가며 벗겨진다 ([[PDU]]: message → segment → datagram → frame → bits)",
  duration: 14,
  build: function () {
    var D = 14;
    var C = {
      a: "#1d65b3", b: "#2e9e4f", dev: "#3b2f4a", devL: "#efe9f6",
      hot: "#d6465f", muted: "#777", line: "#b9c4d8"
    };
    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '" text-anchor="middle"' + (extra || "") + '>' + esc(s) + '</text>';
    }
    function rect(x, y, w, h, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5"' + (extra || "") + '/>';
    }
    // a초~b초에만 보이기 (a=0 이면 처음부터, b=D 면 끝까지)
    function show(a, b) {
      var k = [0], v = [a <= 0 ? 1 : 0];
      if (a > 0) { k.push(a / D, Math.min(1, (a + 0.08) / D)); v.push(0, 1); }
      if (b < D) { k.push(b / D, Math.min(1, (b + 0.08) / D)); v.push(1, 0); }
      if (k[k.length - 1] < 1) { k.push(1); v.push(v[v.length - 1]); }
      return '<animate attributeName="opacity" values="' + v.join(";") + '" keyTimes="' + k.map(function (x) { return +x.toFixed(4); }).join(";") + '" dur="' + D + 's" fill="freeze"/>';
    }
    function during(a, b, inner) { return '<g opacity="' + (a <= 0 ? 1 : 0) + '">' + inner + show(a, b) + '</g>'; }

    // 계층 색 (슬라이드 p.38 의 색을 연하게)
    var LAY = [
      { n: "Application", f: "#e8e0dc", s: "#8a7a72" },
      { n: "Transport", f: "#d6ecf8", s: "#2b8fc9" },
      { n: "Network", f: "#fde3c2", s: "#e0902f" },
      { n: "Data link", f: "#dcefcf", s: "#5a9e35" },
      { n: "Physical", f: "#fbf3b0", s: "#b9a520" }
    ];
    var ROW0 = 74, RH = 34, SW = 90;
    function rowY(i) { return ROW0 + i * RH; }
    // 노드: 왼쪽 x, 가진 계층(첫 인덱스), 이름, 색, 패킷 레인 x
    var N = [
      { x: 20, from: 0, name: "호스트 A", c: C.a, lane: 116 },
      { x: 225, from: 3, name: "스위치 (L1–L2)", c: C.dev, lane: 321 },
      { x: 425, from: 2, name: "라우터 (L1–L3)", c: C.dev, lane: 521 },
      { x: 630, from: 0, name: "호스트 B", c: C.b, lane: 526 }
    ];

    var s = '<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="5계층 캡슐화 애니메이션">';

    // ---- 스택 4개 ----
    N.forEach(function (nd) {
      s += txt(nd.x + SW / 2, 62, nd.name, 13, nd.c, ' font-weight="700"');
      for (var i = 0; i < 5; i++) {
        if (i < nd.from) {
          s += rect(nd.x, rowY(i), SW, 28, "none", "#ccc", ' stroke-dasharray="3 3"');
          s += txt(nd.x + SW / 2, rowY(i) + 18, "없음", 11, "#bbb");
        } else {
          s += rect(nd.x, rowY(i), SW, 28, LAY[i].f, LAY[i].s);
          s += txt(nd.x + SW / 2, rowY(i) + 18, LAY[i].n, 12, "#333");
        }
      }
    });
    // 계층 번호 (왼쪽 끝은 좁으니 A 스택 안쪽 대신 가장자리에 작게)
    for (var li = 0; li < 5; li++) s += txt(12, rowY(li) + 18, "L" + (5 - li), 11, C.muted);

    // ---- 물리 링크 (아래) ----
    var LY = 262;
    N.forEach(function (nd) {
      s += '<line x1="' + (nd.x + SW / 2) + '" y1="' + (rowY(4) + 28) + '" x2="' + (nd.x + SW / 2) + '" y2="' + LY + '" stroke="#555" stroke-width="2"/>';
    });
    s += '<line x1="' + (N[0].x + SW / 2) + '" y1="' + LY + '" x2="' + (N[3].x + SW / 2) + '" y2="' + LY + '" stroke="#555" stroke-width="2"/>';
    s += txt(168, LY + 16, "link 1", 11, C.muted) + txt(372, LY + 16, "link 2", 11, C.muted) + txt(572, LY + 16, "link 3", 11, C.muted);

    // ---- 패킷 그리기 ----
    var HC = { "4": "#2b8fc9", "3": "#e0902f", "2": "#5a9e35" };
    function pkt(x, y, hdr, fresh) {
      var o = "", cx = x;
      hdr.forEach(function (h) {
        var hot = fresh && h === "2";
        o += '<rect x="' + cx + '" y="' + y + '" width="16" height="22" fill="' + HC[h] + '" stroke="' + (hot ? C.hot : "#fff") + '" stroke-width="' + (hot ? 2.5 : 1) + '"/>';
        o += '<text x="' + (cx + 8) + '" y="' + (y + 15) + '" font-size="12" fill="#fff" font-weight="700" text-anchor="middle">' + h + '</text>';
        cx += 16;
      });
      o += '<rect x="' + cx + '" y="' + y + '" width="48" height="22" fill="#8a7a72" stroke="#fff"/>';
      o += '<text x="' + (cx + 24) + '" y="' + (y + 15) + '" font-size="11" fill="#fff" text-anchor="middle">message</text>';
      return o;
    }
    function bits(x, y) {
      return '<rect x="' + x + '" y="' + y + '" width="64" height="22" rx="4" fill="#fbf3b0" stroke="#b9a520" stroke-width="1.5"/>' +
        '<text x="' + (x + 32) + '" y="' + (y + 15) + '" font-size="12" fill="#333" font-family="monospace" text-anchor="middle">0110…</text>';
    }
    var PDU = ["message", "segment", "datagram", "frame", "bits"];
    var HDRS = [[], ["4"], ["3", "4"], ["2", "3", "4"], null];

    // 상태: [시작, 끝, 노드, 계층 i, 새 [2] 인가]
    var ST = [
      [0, 1.5, 0, 0], [1.5, 2.5, 0, 1], [2.5, 3.5, 0, 2], [3.5, 4.5, 0, 3], [4.5, 5.3, 0, 4],
      [6.1, 6.7, 1, 4], [6.7, 7.3, 1, 3], [7.3, 7.6, 1, 4],
      [8.4, 8.8, 2, 4], [8.8, 9.2, 2, 3], [9.2, 9.6, 2, 2], [9.6, 10.0, 2, 3, 1], [10.0, 10.2, 2, 4],
      [11.0, 11.5, 3, 4], [11.5, 12.0, 3, 3, 1], [12.0, 12.5, 3, 2], [12.5, 13.0, 3, 1], [13.0, 14, 3, 0]
    ];
    ST.forEach(function (st) {
      var nd = N[st[2]], i = st[3], y = rowY(i) + 3, g = "";
      // 현재 계층 강조
      g += '<rect x="' + (nd.x - 2) + '" y="' + (rowY(i) - 2) + '" width="' + (SW + 4) + '" height="32" rx="5" fill="none" stroke="' + C.hot + '" stroke-width="2.5"/>';
      g += (i === 4 ? bits(nd.lane, y) : pkt(nd.lane, y, HDRS[i], st[4]));
      g += txt(nd.lane + 48, y + 36, PDU[i], 11, C.hot, ' font-weight="700"');
      s += during(st[0], st[1], g);
    });

    // ---- 링크 위를 건너가는 bits ----
    [[5.3, 6.1, 0, 1], [7.6, 8.4, 1, 2], [10.2, 11.0, 2, 3]].forEach(function (m) {
      var x1 = N[m[2]].x + SW / 2 - 32, x2 = N[m[3]].x + SW / 2 - 32;
      s += '<g opacity="0">' + bits(0, 0) +
        '<animateMotion begin="' + m[0] + 's" dur="' + (m[1] - m[0]).toFixed(1) + 's" fill="freeze" path="M' + x1 + ',' + (LY - 11) + ' L' + x2 + ',' + (LY - 11) + '"/>' +
        show(m[0], m[1]) + '</g>';
    });

    // ---- 스위치/라우터 말풍선 ----
    s += during(6.2, 7.6, txt(270, 294, "L2 헤더만 보고 통과", 12, C.dev, ' font-weight="700"'));
    s += during(8.8, 10.2, txt(470, 294, "[2] 벗김 → L3 경로 선택 → 새 [2]", 12, C.dev, ' font-weight="700"'));

    // ---- 단계 자막 (위) ----
    var caps = [
      [0, 1.5, "호스트 A 의 application layer: message 를 만든다"],
      [1.5, 2.5, "transport layer: 헤더 [4] 를 붙인다 → segment"],
      [2.5, 3.5, "network layer: 헤더 [3] 를 붙인다 → datagram"],
      [3.5, 4.5, "data-link layer: 헤더 [2] 를 붙인다 → frame (캡슐화)"],
      [4.5, 6.1, "physical layer: frame 을 bits 로 바꿔 link 1 위로 보낸다"],
      [6.1, 7.6, "스위치(L1–L2): frame 까지만 올려 보고 bits 로 그대로 내보낸다"],
      [7.6, 8.8, "bits 가 link 2 를 건너 라우터로"],
      [8.8, 10.2, "라우터(L1–L3): [2] 를 벗겨 datagram 을 보고, 새 [2] 를 붙여 다시 frame 으로"],
      [10.2, 11.0, "bits 가 link 3 을 건너 호스트 B 로"],
      [11.0, 13.0, "호스트 B: 올라가며 [2] → [3] → [4] 순서로 헤더를 벗긴다 (역캡슐화)"],
      [13.0, 14, "B 의 application layer 에 A 가 보낸 것과 똑같은 message 도착"]
    ];
    caps.forEach(function (c) { s += during(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 범례 + 요점 (아래) ----
    s += '<rect x="40" y="310" width="16" height="22" fill="#2b8fc9"/><text x="48" y="325" font-size="12" fill="#fff" font-weight="700" text-anchor="middle">4</text>';
    s += '<text x="62" y="325" font-size="11" fill="#555">transport 헤더</text>';
    s += '<rect x="160" y="310" width="16" height="22" fill="#e0902f"/><text x="168" y="325" font-size="12" fill="#fff" font-weight="700" text-anchor="middle">3</text>';
    s += '<text x="182" y="325" font-size="11" fill="#555">network 헤더</text>';
    s += '<rect x="274" y="310" width="16" height="22" fill="#5a9e35"/><text x="282" y="325" font-size="12" fill="#fff" font-weight="700" text-anchor="middle">2</text>';
    s += '<text x="296" y="325" font-size="11" fill="#555">data-link 헤더 (빨간 테두리 = 라우터가 새로 붙인 것)</text>';
    s += txt(380, 364, "호스트는 5계층 전부, 라우터는 L1–L3, 스위치는 L1–L2 — 중간 노드는 필요한 계층까지만 벗겼다 다시 싼다", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
