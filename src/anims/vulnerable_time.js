// ============================================================
// vulnerable_time — L6 p.14–19 (pure ALOHA 2T_fr) / p.27 (slotted ALOHA T_fr)
// 시간축(초): 0 B 가 t 에 전송 → 1.5 A 가 t−T_fr 뒤로 밀려오며 겹침 → 4 C 가 t+T_fr 전으로 당겨지며 겹침
//   → 6.5 2T_fr 브레이스 → 8.5 slotted: 슬롯 경계에서만 시작, C 가 B 와 같은 슬롯 → 충돌 → T_fr → 14
// 가로 좌표: t−T_fr = 250, t = 380, t+T_fr = 510 (T_fr = 130px)
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["vulnerable_time"] = {
  title: "Vulnerable time — pure ALOHA 2T_fr vs slotted ALOHA T_fr (14초)",
  desc: "B 가 t 에 보낸 프레임과 충돌할 수 있는 시작 시각의 범위 = [[vulnerable time]]. [[pure ALOHA]] 는 t−[[T_fr]] ~ t+T_fr 이라 2T_fr, [[slotted ALOHA]] 는 같은 슬롯에서 시작한 것만 겹치니 T_fr",
  duration: 14,
  build: function () {
    var D = 14;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", aM: "#9cc3ea", b: "#2e9e4f", bL: "#dff3e4",
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
    // t0→t1 동안 가로로 dx 만큼 미끄러짐
    function slide(dx, t0, t1) {
      return '<animateTransform attributeName="transform" type="translate" values="0,0;0,0;' + dx + ',0;' + dx + ',0" keyTimes="0;' + r4(t0 / D) + ';' + r4(t1 / D) + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function sb(base, sub) { return base + '<tspan baseline-shift="sub" font-size="75%">' + sub + '</tspan>'; }
    var TFR = sb("T", "fr");
    function frame(x, y, label, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="130" height="18" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5"' + (extra || "") + '/>' +
        txt(x + 65, y + 14, label, 13, "#222", ' font-weight="700"');
    }
    function brace(x1, x2, y, label) {
      return '<path d="M' + x1 + ',' + (y - 6) + ' v6 H' + x2 + ' v-6" fill="none" stroke="' + C.red + '" stroke-width="2"/>' +
        txt((x1 + x2) / 2, y + 16, label, 13, C.red, ' font-weight="700"');
    }
    var XM = 250, XT = 380, XP = 510;

    var s = '<svg viewBox="0 0 760 372" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vulnerable time 애니메이션">';
    s += '<defs><marker id="vt_time" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.a + '"/></marker>' +
      '<marker id="vt_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.muted + '"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "Station B 가 시각 t 에 프레임 전송 시작 (길이 = 평균 전송 시간 " + TFR + ")"],
      [1.5, 4, "A 가 t − " + TFR + " 이후에 시작했다면 → A 의 끝이 B 의 시작과 겹침 → collision"],
      [4, 6.5, "C 가 t + " + TFR + " 이전에 시작하면 → B 의 끝이 C 의 시작과 겹침 → collision"],
      [6.5, 8.5, "Vulnerable time = (t + " + TFR + ") − (t − " + TFR + ") = 2" + TFR],
      [8.5, 11, "Slotted ALOHA: 슬롯 중간에 생긴 프레임도 다음 슬롯 경계에서만 전송 시작"],
      [11, D, "같은 슬롯에서 시작한 B 와 C 만 충돌 → Vulnerable time = " + TFR + " (pure 의 절반)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // =============== 위: Pure ALOHA ===============
    s += '<text x="16" y="72" font-size="13" fill="' + C.dev + '" font-weight="700">Pure</text><text x="16" y="88" font-size="13" fill="' + C.dev + '" font-weight="700">ALOHA</text>';
    [XM, XT, XP].forEach(function (x) { s += '<line x1="' + x + '" y1="50" x2="' + x + '" y2="138" stroke="#999" stroke-dasharray="4 3"/>'; });
    s += '<line x1="90" y1="138" x2="730" y2="138" stroke="' + C.a + '" stroke-width="2" marker-end="url(#vt_time)"/>';
    s += txt(XM, 154, "t − " + TFR, 12, "#333") + txt(XT, 154, "t", 12, "#333") + txt(XP, 154, "t + " + TFR, 12, "#333");
    s += '<text x="728" y="154" font-size="12" fill="' + C.a + '" font-weight="700" text-anchor="end">Time</text>';
    // 충돌 구간 (A 끝 ~ B 시작, B 끝 ~ C 시작)
    s += vis(3.2, D, '<rect x="' + XT + '" y="54" width="40" height="72" fill="' + C.red + '" fill-opacity="0.18"/>');
    s += vis(5.7, D, '<rect x="470" y="54" width="' + (XP - 470) + '" height="72" fill="' + C.red + '" fill-opacity="0.18"/>');
    // B (고정)
    s += frame(XT, 82, "B", C.aM, C.a);
    // A: 안전한 위치(끝 < t) → t−T_fr 이후 시작으로 밀려옴
    s += '<g>' + frame(100, 58, "A", "#fff", "#555") + slide(190, 1.7, 3.2) + '</g>';
    s += vis(3.2, D, '<text x="' + (XT + 46) + '" y="72" font-size="11" fill="' + C.red + '" font-weight="700">← A 끝 ↔ B 시작</text>');
    // C: 안전한 위치(시작 > t+T_fr) → t+T_fr 이전 시작으로 당겨짐
    s += '<g>' + frame(560, 106, "C", "#fff", "#555") + slide(-90, 4.2, 5.7) + '</g>';
    s += vis(5.7, D, '<text x="466" y="120" font-size="11" fill="' + C.red + '" font-weight="700" text-anchor="end">B 끝 ↔ C 시작 →</text>');
    // 2T_fr 브레이스
    s += vis(6.5, D, brace(XM, XP, 166, "Vulnerable time = 2 × " + TFR));

    // =============== 아래: Slotted ALOHA ===============
    var bot = "";
    bot += '<line x1="10" y1="196" x2="750" y2="196" stroke="#ddd" stroke-width="1.5"/>';
    bot += '<text x="16" y="236" font-size="13" fill="' + C.dev + '" font-weight="700">Slotted</text><text x="16" y="252" font-size="13" fill="' + C.dev + '" font-weight="700">ALOHA</text>';
    [120, XM, XT, XP, 640].forEach(function (x) { bot += '<line x1="' + x + '" y1="206" x2="' + x + '" y2="296" stroke="#999" stroke-dasharray="4 3"/>'; });
    bot += '<line x1="90" y1="296" x2="730" y2="296" stroke="' + C.a + '" stroke-width="2" marker-end="url(#vt_time)"/>';
    bot += txt(XM, 312, "t − " + TFR, 12, "#333") + txt(XT, 312, "t", 12, "#333") + txt(XP, 312, "t + " + TFR, 12, "#333");
    bot += txt(185, 312, "slot", 11, C.muted) + txt(575, 312, "slot", 11, C.muted);
    bot += frame(XM, 216, "A", "#fff", "#555");
    bot += '<text x="' + (XM - 6) + '" y="229" font-size="11" fill="' + C.b + '" font-weight="700" text-anchor="end">앞 슬롯: 안 겹침 ✓</text>';
    bot += frame(XT, 240, "B", C.aM, C.a);
    s += vis(8.5, D, bot);
    // C: 슬롯 중간(x=300)에 데이터가 생김 → 다음 경계 t 까지 대기
    s += vis(9, 10.8, '<rect x="300" y="264" width="130" height="18" fill="none" stroke="' + C.muted + '" stroke-dasharray="4 3"/>' +
      '<text x="296" y="277" font-size="11" fill="' + C.muted + '" text-anchor="end">C 데이터 생김</text>');
    s += '<g opacity="0">' + frame(300, 264, "C", "#fff", "#555") + slide(80, 9.8, 10.8) + show(9.8, D) + '</g>';
    s += vis(9.8, 10.8, '<line x1="300" y1="290" x2="376" y2="290" stroke="' + C.muted + '" stroke-width="1.5" marker-end="url(#vt_arrow)"/>');
    s += vis(10.8, D, '<rect x="' + XT + '" y="210" width="130" height="80" fill="' + C.red + '" fill-opacity="0.18"/>' +
      '<text x="' + (XP + 8) + '" y="256" font-size="12" fill="' + C.red + '" font-weight="700">B collides with C</text>' +
      '<text x="' + (XP + 8) + '" y="272" font-size="11" fill="' + C.red + '">(같은 슬롯에서 시작)</text>');
    s += vis(11.5, D, brace(XT, XP, 324, "Vulnerable time = " + TFR));

    // ---- 요점 ----
    s += txt(380, 364, "Pure ALOHA 2" + TFR + " vs Slotted ALOHA " + TFR + " — 시작 시각을 슬롯에 맞추면 겹칠 수 있는 구간이 절반으로 준다", 12, "#333");
    s += '</svg>';
    return s;
  }
};
