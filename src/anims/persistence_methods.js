// ============================================================
// persistence_methods — L6 p.35–40 CSMA persistence methods (1-persistent / nonpersistent / p-persistent)
// 가로 x = 160 + 40·t. 채널은 t = 4.3 까지 busy, 그 뒤 idle.
// 시간축(초): 0~4.3 busy 동안 기다리는 방식 → 4.3 1-persistent 즉시 전송 → 5.6 nonpersistent 재감지 후 전송
//   → 4.3/5.6/6.9 p-persistent 슬롯마다 R 뽑기 → 6.9 전송 → 9.5 비교 요약 → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["persistence_methods"] = {
  title: "Persistence methods — busy 채널 앞에서 기다리는 세 가지 방법 14초",
  desc: "같은 채널 상황(busy → idle)에서 [[1-persistent]](계속 듣다 즉시), [[nonpersistent]](랜덤 대기 후 다시 감지), [[p-persistent]](idle 슬롯마다 확률 p 로 전송)가 언제 보내는지 비교 ([[persistence method]], [[CSMA]])",
  duration: 14,
  build: function () {
    var D = 14;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", b: "#2e9e4f", bL: "#dff3e4",
      c: "#e09a40", cL: "#fdeec2", dev: "#3b2f4a", devL: "#efe9f6",
      red: "#d6465f", redL: "#fbe3e7", muted: "#777"
    };
    function r4(v) { return Math.round(v * 10000) / 10000; }
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
    function growRect(x, y, w, h, t0, len, attrs) {
      return '<rect x="' + x + '" y="' + y + '" width="0" height="' + h + '" ' + attrs + '>' +
        '<animate attributeName="width" values="0;' + w + '" begin="' + t0 + 's" dur="' + len + 's" fill="freeze"/></rect>';
    }

    var X0 = 160, SC = 40, TIDLE = 4.3, TFR = 2.4;
    function X(t) { return r4(X0 + t * SC); }
    var RY = [125, 200, 275];   // 각 행의 기준선 y

    var s = '<svg viewBox="0 0 760 366" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Persistence methods 애니메이션">';
    s += '<defs><marker id="pm_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.muted + '"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.2, "채널이 busy 일 때 스테이션이 어떻게 기다리느냐 = persistence method"],
      [1.2, TIDLE, "busy 동안: 1-persistent·p-persistent 는 계속 듣고, nonpersistent 는 랜덤 시간 뒤에 다시 와서 본다"],
      [TIDLE, 5.6, "채널 idle! 1-persistent 는 즉시 전송 (확률 1) — 여럿이 기다렸다면 바로 충돌"],
      [5.6, 6.9, "nonpersistent: 랜덤 대기 후 다시 봤더니 idle → 전송 (충돌 ↓, 대신 idle 시간 낭비)"],
      [6.9, 9.5, "p-persistent: idle 슬롯마다 R 을 뽑아 R ≤ p 면 전송, 아니면 한 슬롯 대기 후 다시"],
      [9.5, D, "1-persistent(효율) 와 nonpersistent(충돌 회피) 의 절충이 p-persistent"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 채널 상태 띠 ----
    s += '<text x="20" y="66" font-size="13" fill="#333" font-weight="700">채널 상태</text>';
    s += '<rect x="' + X0 + '" y="50" width="' + (X(TIDLE) - X0) + '" height="22" fill="' + C.redL + '" stroke="' + C.red + '" stroke-width="1.2"/>';
    s += txt((X0 + X(TIDLE)) / 2, 65, "busy (다른 스테이션 전송 중)", 12, C.red, ' font-weight="700"');
    s += '<rect x="' + X(TIDLE) + '" y="50" width="' + (720 - X(TIDLE)) + '" height="22" fill="' + C.bL + '" stroke="' + C.b + '" stroke-width="1.2"/>';
    s += txt((X(TIDLE) + 720) / 2, 65, "idle", 12, C.b, ' font-weight="700"');
    s += '<line x1="' + X(TIDLE) + '" y1="72" x2="' + X(TIDLE) + '" y2="316" stroke="' + C.b + '" stroke-width="1" stroke-dasharray="4 3"/>';

    // ---- 행 라벨과 기준선 ----
    var labels = [["1-persistent", ""], ["nonpersistent", ""], ["p-persistent", "(p = 0.3)"]];
    labels.forEach(function (l, i) {
      s += '<text x="20" y="' + (RY[i] - 4) + '" font-size="13" fill="' + C.dev + '" font-weight="700">' + l[0] + '</text>';
      if (l[1]) s += '<text x="20" y="' + (RY[i] + 12) + '" font-size="11" fill="' + C.muted + '">' + l[1] + '</text>';
      s += '<line x1="' + X0 + '" y1="' + RY[i] + '" x2="720" y2="' + RY[i] + '" stroke="#ccc" stroke-width="1"/>';
    });

    function sense(t, y, ok) {
      var x = X(t);
      return vis(t, D, '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#fff" stroke="' + (ok ? C.b : C.red) + '" stroke-width="2"/>' +
        txt(x, y + 4, ok ? "✓" : "✗", 12, ok ? C.b : C.red, ' font-weight="700"') +
        txt(x, y - 14, ok ? "idle" : "busy", 11, ok ? C.b : C.red, ' font-weight="700"'));
    }
    function frame(t, y, col, colL) {
      return growRect(X(t), y - 10, r4(TFR * SC), 20, t, TFR, 'fill="' + colL + '" stroke="' + col + '" stroke-width="1.5"') +
        vis(t + 0.3, D, txt(X(t + TFR / 2), y + 5, "전송", 12, col, ' font-weight="700"'));
    }

    // ---- 1-persistent: 계속 듣다가 idle 순간 즉시 ----
    var y = RY[0];
    s += growRect(X0, y - 3, r4(X(TIDLE) - X0), 6, 0.1, TIDLE - 0.1, 'fill="' + C.c + '" fill-opacity="0.7"');
    s += vis(0.6, D, txt((X0 + X(TIDLE)) / 2, y - 10, "계속 듣는 중 (sense, sense, sense…)", 11, "#8a5a14"));
    s += frame(TIDLE, y, C.a, C.aL);
    s += vis(TIDLE, D, '<text x="' + (X(TIDLE + TFR) + 8) + '" y="' + (y + 4) + '" font-size="11" fill="' + C.a + '" font-weight="700">idle 즉시 (확률 1)</text>');

    // ---- nonpersistent: 랜덤 대기 후 다시 감지 ----
    y = RY[1];
    var ns = [[0.8, false], [2.6, false], [5.6, true]];
    s += frame(5.6, y, C.b, C.bL);
    ns.forEach(function (p, i) {
      s += sense(p[0], y, p[1]);
      if (i < ns.length - 1) {
        var x1 = X(p[0]) + 10, x2 = X(ns[i + 1][0]) - 11;
        s += vis(p[0] + 0.2, D, '<path d="M' + x1 + ',' + (y + 4) + ' Q' + r4((x1 + x2) / 2) + ',' + (y + 22) + ' ' + x2 + ',' + (y + 4) + '" fill="none" stroke="' + C.muted + '" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#pm_arrow)"/>' +
          txt(r4((x1 + x2) / 2), y + 28, "랜덤 대기", 11, C.muted));
      }
    });
    s += vis(5.6, D, '<path d="M' + X(TIDLE) + ',' + (y - 22) + ' v-5 H' + X(5.6) + ' v5" fill="none" stroke="' + C.red + '" stroke-width="1.5"/>' +
      txt((X(TIDLE) + X(5.6)) / 2, y - 31, "idle 낭비", 11, C.red, ' font-weight="700"'));

    // ---- p-persistent: 계속 듣다가 idle 이면 슬롯마다 R ----
    y = RY[2];
    s += growRect(X0, y - 3, r4(X(TIDLE) - X0), 6, 0.1, TIDLE - 0.1, 'fill="' + C.c + '" fill-opacity="0.7"');
    s += vis(0.6, D, txt((X0 + X(TIDLE)) / 2, y - 10, "계속 듣는 중", 11, "#8a5a14"));
    var slots = [[TIDLE, "0.7", false], [5.6, "0.5", false], [6.9, "0.2", true]];
    slots.forEach(function (p, i) {
      var x = X(p[0]), ly = i === 1 ? y + 32 : y + 18;
      s += vis(p[0], D, '<line x1="' + x + '" y1="' + (y - 16) + '" x2="' + x + '" y2="' + (ly + 2) + '" stroke="' + C.dev + '" stroke-width="1" stroke-dasharray="2 2"/>' +
        txt(x + 3, ly, "R=" + p[1] + (p[2] ? " ≤ p ✓" : " &gt; p"), 11, p[2] ? C.b : C.red, ' font-weight="700" text-anchor="start"'));
      if (!p[2]) s += vis(p[0] + 0.15, D, txt(x + 24, y - 6, "슬롯 대기", 11, C.muted));
    });
    s += frame(6.9, y, C.c, C.cL);

    // ---- 비교 요약 (오른쪽) ----
    var sum = [
      ["충돌 확률 ↑", "(모두가 idle 순간 동시에)"],
      ["충돌 ↓, 효율 ↓", "(idle 인데 놀 수 있음)"],
      ["둘의 절충", "(확률 p 로만 전송)"]
    ];
    sum.forEach(function (m, i) {
      s += vis(9.5, D, '<text x="588" y="' + (RY[i] - 4) + '" font-size="12" fill="#333" font-weight="700">' + m[0] + '</text>' +
        '<text x="588" y="' + (RY[i] + 12) + '" font-size="11" fill="' + C.muted + '">' + m[1] + '</text>');
    });

    // ---- 지금 시각 선 ----
    s += '<g><line x1="0" y1="46" x2="0" y2="300" stroke="#333" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<animateTransform attributeName="transform" type="translate" values="' + X0 + ',0;' + X(9.5) + ',0;' + X(9.5) + ',0" keyTimes="0;' + r4(9.5 / D) + ';1" dur="' + D + 's" fill="freeze"/>' +
      '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;' + r4(9.3 / D) + ';' + r4(9.5 / D) + ';1" dur="' + D + 's" fill="freeze"/></g>';
    s += '<line x1="' + X0 + '" y1="322" x2="728" y2="322" stroke="#555" stroke-width="1.5" marker-end="url(#pm_arrow)"/>';
    s += '<text x="758" y="340" font-size="12" fill="#555" text-anchor="end">Time</text>';

    // ---- 요점 ----
    s += txt(380, 356, "busy 일 때: 계속 듣기(1-, p-) vs 랜덤 대기 후 재감지(non-) · idle 일 때: 즉시(1-) vs 확률 p 로(p-)", 12, "#333");
    s += '</svg>';
    return s;
  }
};
