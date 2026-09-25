// ============================================================
// pure_aloha_collision — L6 p.9 Pure ALOHA: 네 스테이션이 제멋대로 전송
// 시간축(초): 0.7 Station 1 전송(성공) → 2.4/2.9/3.3 Station 3·2·4 전송이 겹침(collision duration 2.9–4.2)
//   → 4.6 ACK 없음 = 충돌 → 각자 다른 backoff → 5.0/6.8/8.6 재전송 성공 → 13
// 가로축 x = 110 + 58·t (그림 속 시간 = 애니메이션 시간)
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["pure_aloha_collision"] = {
  title: "Pure ALOHA — 겹치면 모두 파괴, backoff 후 재전송 13초",
  desc: "[[pure ALOHA]]: 각 스테이션은 데이터가 생기면 언제든 전송한다. 시간상 조금이라도 겹치면 모두 파괴([[collision]]) → ACK 가 없으면 랜덤 [[binary exponential backoff|backoff]] 뒤 재전송 ([[random access]])",
  duration: 13,
  build: function () {
    var D = 13;
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
    // t0 부터 len 초 동안 폭이 0 → w 로 자라는 막대 (전송 중인 프레임)
    function growRect(x, y, w, h, t0, len, attrs) {
      return '<rect x="' + x + '" y="' + y + '" width="0" height="' + h + '" ' + attrs + '>' +
        '<animate attributeName="width" values="0;' + w + '" begin="' + t0 + 's" dur="' + len + 's" fill="freeze"/></rect>';
    }

    var X0 = 110, SC = 58, TFR = 1.3;
    function X(t) { return r4(X0 + t * SC); }
    var ROWY = [80, 130, 180, 230];          // Station 1~4 의 가운데 y
    // [station(0~3), 시작 시각, 충돌 여부]
    var frames = [
      [0, 0.7, false],
      [2, 2.4, true], [1, 2.9, true], [3, 3.3, true],
      [2, 5.0, false], [3, 6.8, false], [1, 8.6, false]
    ];
    var TDET = 4.6;                           // ACK 가 안 와서 충돌을 알게 되는 시각

    var s = '<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pure ALOHA 충돌 애니메이션">';
    s += '<defs><marker id="pac_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C.muted + '"/></marker>' +
      '<marker id="pac_time" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.a + '"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 2.4, "Pure ALOHA: 각 스테이션은 보낼 데이터가 생기면 언제든 바로 전송한다"],
      [2.4, TDET, "Station 3·2·4 의 프레임이 시간상 겹침 → 겹친 구간(collision duration)에서 모두 파괴"],
      [TDET, 6.8, "ACK 가 안 오면 충돌로 판단 → 각자 랜덤 backoff 시간 T<tspan baseline-shift=\"sub\" font-size=\"75%\">B</tspan> 만큼 기다렸다가 재전송"],
      [6.8, D, "backoff 시간이 서로 달라서 이번엔 안 겹침 → 재전송 성공 ✓"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 행 구분선, 라벨, 시간축 ----
    for (var i = 0; i < 4; i++) {
      s += '<text x="20" y="' + (ROWY[i] + 5) + '" font-size="13" fill="#333" font-weight="700">Station ' + (i + 1) + '</text>';
      if (i < 3) s += '<line x1="' + X0 + '" y1="' + (ROWY[i] + 25) + '" x2="720" y2="' + (ROWY[i] + 25) + '" stroke="#ccc" stroke-width="1"/>';
    }
    s += '<line x1="' + X0 + '" y1="258" x2="728" y2="258" stroke="' + C.a + '" stroke-width="2" marker-end="url(#pac_time)"/>';
    s += '<text x="736" y="275" font-size="13" fill="' + C.a + '" font-weight="700" text-anchor="end">Time</text>';

    // ---- collision duration 띠 (겹친 구간의 합집합 2.9 ~ 4.2) ----
    var cs = 2.9, ce = 4.2;
    s += growRect(X(cs), 58, r4((ce - cs) * SC), 190, cs, r4(ce - cs), 'fill="' + C.red + '" fill-opacity="0.16"');
    s += vis(ce, D, txt(X((cs + ce) / 2), 276, "Collision duration", 12, C.red, ' font-weight="700"'));

    // ---- 프레임 ----
    var W = r4(TFR * SC);
    frames.forEach(function (f) {
      var y = ROWY[f[0]] - 10, x = X(f[1]);
      s += growRect(x, y, W, 20, f[1], TFR, 'fill="' + C.aL + '" stroke="' + C.a + '" stroke-width="1.5"');
      if (f[2]) {
        // 충돌 판정 후 빨갛게 + ✗
        s += vis(TDET, D, '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="20" fill="' + C.redL + '" stroke="' + C.red + '" stroke-width="2"/>' +
          txt(x + W / 2, y + 15, "✗", 15, C.red, ' font-weight="700"'));
      } else {
        s += vis(r4(f[1] + TFR), D, txt(x + W + 10, y + 15, "✓", 15, C.b, ' font-weight="700"'));
      }
    });

    // ---- backoff 화살표 (충돌 프레임 끝 → 재전송 시작) ----
    [[2, 2.4, 5.0], [1, 2.9, 8.6], [3, 3.3, 6.8]].forEach(function (b) {
      var y = ROWY[b[0]] - 14, x1 = X(b[1] + TFR) + 4, x2 = X(b[2]) - 2;
      s += vis(TDET, D, '<path d="M' + x1 + ',' + y + ' Q' + r4((x1 + x2) / 2) + ',' + (y - 16) + ' ' + x2 + ',' + y + '" fill="none" stroke="' + C.muted + '" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#pac_arrow)"/>' +
        txt(r4((x1 + x2) / 2), y - 12, "backoff", 11, C.muted));
    });

    // ---- 지금 시각 표시선 ----
    s += '<g><line x1="0" y1="52" x2="0" y2="258" stroke="#333" stroke-width="1" stroke-dasharray="2 3"/>' +
      '<animateTransform attributeName="transform" type="translate" values="' + X0 + ',0;' + X(10.5) + ',0;' + X(10.5) + ',0" keyTimes="0;' + r4(10.5 / D) + ';1" dur="' + D + 's" fill="freeze"/>' +
      '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;' + r4(10.5 / D) + ';' + r4(10.7 / D) + ';1" dur="' + D + 's" fill="freeze"/></g>';

    // ---- 요점 ----
    s += txt(380, 310, "1 비트라도 겹치면 두 프레임 모두 파괴 — 그래서 '겹칠 수 있는 구간'(vulnerable time)이 성능을 좌우한다", 12, "#333");
    s += '</svg>';
    return s;
  }
};
