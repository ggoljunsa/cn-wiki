// ============================================================
// topologies — mesh · star · bus · ring 이 차례로 그려지고, star 허브 / ring 링크 고장
// CONTRACT §7. 슬라이드 L1 p.10–13.
// 시간축(초): 0 제목 → 1 mesh 링크 10개가 하나씩 → 3.5 star → 5.5 bus → 7.5 ring(신호 회전)
//   → 10 star 허브 고장 → 12 ring 한 링크 끊김 → 14 끝
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["topologies"] = {
  title: "물리 토폴로지 4가지 — mesh · star · bus · ring",
  desc: "[[mesh 토폴로지|mesh]] 는 링크 n(n−1)/2 개, [[star 토폴로지|star]] 는 허브 하나에 의존, [[bus 토폴로지|bus]] 는 backbone + drop line/tap, [[ring 토폴로지|ring]] 은 repeater 를 거쳐 한 방향 — 허브가 죽거나 링이 끊기면 전체가 멈춘다",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { a: "#1d65b3", aL: "#dbe8f7", dev: "#3b2f4a", devL: "#efe9f6", hot: "#d6465f", muted: "#777", line: "#555" };
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
    function line(x1, y1, x2, y2, col, w, extra) {
      return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + col + '" stroke-width="' + (w || 2) + '"' + (extra || "") + '/>';
    }
    function pc(x, y) {   // 작은 컴퓨터 아이콘
      return '<rect x="' + (x - 12).toFixed(1) + '" y="' + (y - 9).toFixed(1) + '" width="24" height="18" rx="3" fill="' + C.aL + '" stroke="' + C.a + '" stroke-width="2"/>';
    }

    var s = '<svg viewBox="0 0 760 350" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="네트워크 토폴로지 애니메이션">';
    var CY = 168;
    var PX = [95, 285, 475, 665];
    ["Mesh", "Star", "Bus", "Ring"].forEach(function (n, i) {
      s += during([0.3, 3.5, 5.5, 7.5][i], D, txt(PX[i], 68, n, 15, C.dev, ' font-weight="700"'));
    });
    s += '<line x1="190" y1="60" x2="190" y2="275" stroke="#e3e3e3"/><line x1="380" y1="60" x2="380" y2="275" stroke="#e3e3e3"/><line x1="570" y1="60" x2="570" y2="275" stroke="#e3e3e3"/>';

    // ---- Mesh: 5 노드, 링크 10개가 0.25초 간격 ----
    var mp = [];
    for (var i = 0; i < 5; i++) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / 5;
      mp.push([PX[0] + 62 * Math.cos(ang), CY + 62 * Math.sin(ang)]);
    }
    var k = 0;
    for (var p = 0; p < 5; p++) {
      for (var q = p + 1; q < 5; q++) {
        var t0 = 1 + k * 0.25;
        s += during(t0, D, line(mp[p][0], mp[p][1], mp[q][0], mp[q][1], C.line, 1.8));
        s += during(t0, k === 9 ? D : t0 + 0.25, txt(PX[0], 258, "링크 " + (k + 1) + " 개", 12, C.dev, ' font-weight="700"'));
        k++;
      }
    }
    mp.forEach(function (pt) { s += during(0.3, D, pc(pt[0], pt[1])); });
    s += during(3.5, D, txt(PX[0], 276, "n(n−1)/2 = 5·4/2", 12, C.muted));
    // mesh: 링크 하나 끊겨도 우회 (고장 장면에서 비교용)
    s += during(10, D, line(mp[0][0], mp[0][1], mp[1][0], mp[1][1], C.hot, 3, ' stroke-dasharray="4 3"') +
      txt((mp[0][0] + mp[1][0]) / 2 + 8, (mp[0][1] + mp[1][1]) / 2 - 4, "✗", 14, C.hot, ' font-weight="700"') +
      txt(PX[0], 296, "링크 하나 끊겨도 우회 ✓", 11, "#2e9e4f", ' font-weight="700"'));

    // ---- Star: 허브 + 5 장치 ----
    var sp = [];
    for (i = 0; i < 5; i++) {
      var a2 = -Math.PI / 2 + i * 2 * Math.PI / 5;
      sp.push([PX[1] + 68 * Math.cos(a2), CY + 68 * Math.sin(a2)]);
    }
    var starG = "";
    sp.forEach(function (pt) { starG += line(PX[1], CY, pt[0], pt[1], C.line, 2); });
    sp.forEach(function (pt) { starG += pc(pt[0], pt[1]); });
    starG += '<rect x="' + (PX[1] - 20) + '" y="' + (CY - 12) + '" width="40" height="24" rx="5" fill="' + C.devL + '" stroke="' + C.dev + '" stroke-width="2"/>' + txt(PX[1], CY + 5, "Hub", 12, C.dev, ' font-weight="700"');
    s += during(3.5, D, starG);
    s += during(4, 10, txt(PX[1], 258, "장치 ↔ 허브만 연결", 12, C.dev, ' font-weight="700"'));
    // 허브 고장
    var dead = "";
    sp.forEach(function (pt) { dead += line(PX[1], CY, pt[0], pt[1], C.hot, 2.5, ' stroke-dasharray="4 3"'); });
    sp.forEach(function (pt) { dead += pc(pt[0], pt[1]); });
    dead += '<rect x="' + (PX[1] - 20) + '" y="' + (CY - 12) + '" width="40" height="24" rx="5" fill="#ffd9d9" stroke="' + C.hot + '" stroke-width="2.5"/>' + txt(PX[1], CY + 6, "✗", 16, C.hot, ' font-weight="700"');
    s += during(10, D, dead + txt(PX[1], 258, "허브 고장 → 전체 마비 ✗", 12, C.hot, ' font-weight="700"'));

    // ---- Bus: backbone + drop line + tap ----
    var bx1 = PX[2] - 82, bx2 = PX[2] + 82, busG = "";
    busG += line(bx1, CY, bx2, CY, C.dev, 4);
    busG += '<rect x="' + (bx1 - 5) + '" y="' + (CY - 7) + '" width="5" height="14" fill="' + C.dev + '"/><rect x="' + bx2 + '" y="' + (CY - 7) + '" width="5" height="14" fill="' + C.dev + '"/>';
    [0, 1, 2, 3].forEach(function (j) {
      var x = PX[2] + [-55, -18, 18, 55][j], up = j % 2 === 0 ? -1 : 1, y = CY + up * 52;
      busG += line(x, CY, x, y - up * 9, C.line, 2);
      busG += '<rect x="' + (x - 4) + '" y="' + (CY - 5) + '" width="8" height="10" fill="#e09a40" stroke="' + C.dev + '"/>';
      busG += pc(x, y);
    });
    s += during(5.5, D, busG);
    s += during(6, D, txt(PX[2] + 23, CY - 30, "drop line", 11, C.muted, ' text-anchor="start"') + txt(PX[2] + 40, CY + 22, "tap", 11, "#b56b12", ' font-weight="700"') + txt(PX[2], CY + 90, "backbone (cable end ▮)", 11, C.muted));
    s += during(6, D, txt(PX[2], 276, "multipoint: 케이블 하나를 공유", 12, C.dev, ' font-weight="700"'));

    // ---- Ring: repeater 4개가 원 위에, 장치는 바깥 ----
    var R = 50, ringG = "";
    ringG += '<circle cx="' + PX[3] + '" cy="' + CY + '" r="' + R + '" fill="none" stroke="' + C.line + '" stroke-width="2.5"/>';
    for (i = 0; i < 4; i++) {
      var a3 = -Math.PI / 2 + i * Math.PI / 2;
      var rx = PX[3] + R * Math.cos(a3), ry = CY + R * Math.sin(a3);
      var ox = PX[3] + 76 * Math.cos(a3), oy = CY + 76 * Math.sin(a3);
      ringG += line(rx, ry, ox - 9 * Math.cos(a3), oy - 9 * Math.sin(a3), C.line, 2);
      ringG += '<rect x="' + (rx - 7).toFixed(1) + '" y="' + (ry - 7).toFixed(1) + '" width="14" height="14" fill="' + C.devL + '" stroke="' + C.dev + '" stroke-width="1.5"/>';
      ringG += txt(rx, ry + 4, "R", 10, C.dev, ' font-weight="700"');
      ringG += pc(ox, oy);
    }
    s += during(7.5, D, ringG);
    s += during(8, 12, txt(PX[3], 276, "R = repeater, 신호는 한 방향", 12, C.dev, ' font-weight="700"'));
    // 신호가 시계 방향으로 한 바퀴씩
    var circ = 'M' + PX[3] + ',' + (CY - R) + ' A' + R + ',' + R + ' 0 0,1 ' + PX[3] + ',' + (CY + R) + ' A' + R + ',' + R + ' 0 0,1 ' + PX[3] + ',' + (CY - R);
    s += '<g opacity="0"><circle r="6" fill="' + C.a + '"/><animateMotion begin="8s" dur="1.3s" repeatCount="3" path="' + circ + '"/>' + show(8, 11.9) + '</g>';
    // 한 링크 끊김 (위 ↔ 오른쪽 사이, 45°)
    var bxp = PX[3] + R * Math.cos(-Math.PI / 4), byp = CY + R * Math.sin(-Math.PI / 4);
    s += during(12, D, '<circle cx="' + bxp.toFixed(1) + '" cy="' + byp.toFixed(1) + '" r="9" fill="#fff" stroke="' + C.hot + '" stroke-width="2"/>' +
      txt(bxp, byp + 5, "✗", 14, C.hot, ' font-weight="700"') + txt(PX[3], 276, "한 곳 끊김 → 전체 마비 ✗", 12, C.hot, ' font-weight="700"'));

    // ---- 단계 자막 ----
    var caps = [
      [0, 1, "물리 토폴로지(physical topology) 4가지: mesh · star · bus · ring"],
      [1, 3.5, "mesh: 모든 장치가 다른 모든 장치와 전용 point-to-point 링크 → n(n−1)/2 = 10개"],
      [3.5, 5.5, "star: 각 장치는 중앙 제어기(hub)와만 전용 point-to-point 링크"],
      [5.5, 7.5, "bus: 긴 케이블 하나가 backbone — 장치는 drop line 과 tap 으로 접속"],
      [7.5, 10, "ring: 양옆 두 장치와만 연결, 신호는 한 방향으로 돌며 repeater 가 재생"],
      [10, 12, "star 의 허브가 죽으면 → 전체가 허브에 의존하므로 모두 마비 (mesh 는 우회)"],
      [12, D, "ring 이 한 곳이라도 끊기면 → 신호가 한 바퀴를 못 돌아 전체 마비"]
    ];
    caps.forEach(function (c) { s += during(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    s += txt(380, 326, "mesh = 견고하지만 비쌈 · star = 허브가 단일 고장점 · bus = 설치 쉽지만 결함 격리 어려움 · ring = 한 곳만 끊겨도 전체 마비", 11, C.muted);
    s += '</svg>';
    return s;
  }
};
