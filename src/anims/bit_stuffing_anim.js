// ============================================================
// bit_stuffing_anim — L5 p.20 Bit stuffing (data 0001111111001111101000)
// 시간축(초): 0 준비 → 1.5부터 0.4초마다 출력 한 칸 (24칸, 그중 2칸은 stuffed 0)
//   → 11.1 "Two extra bits" → 11.1~14 수신 측: flag 와 헷갈리지 않음 ✓
// 비트열은 슬라이드 p.20 그림 그대로(22비트). 5번째 연속 1 뒤에 0 삽입 → 24비트.
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["bit_stuffing_anim"] = {
  title: "Bit stuffing — 1 이 다섯 개면 0 을 끼워 넣는 14초",
  desc: "슬라이드 p.20 비트열을 한 비트씩 보내며 연속 1 카운터가 5 가 되면 0 을 하나 삽입한다 ([[bit stuffing]]). 그래서 수신 측은 data 안의 비트를 [[flag]] 01111110 으로 착각하지 않는다 ([[bit-oriented framing]])",
  duration: 14,
  build: function () {
    var D = 14;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", b: "#2e9e4f", bL: "#dff3e4",
      c: "#e09a40", cL: "#fdeec2", dev: "#3b2f4a", devL: "#efe9f6",
      red: "#d6465f", redL: "#fbe3e7", muted: "#777"
    };
    var MONO = ' font-family="ui-monospace, Menlo, Consolas, monospace"';
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function box(x, y, w, h, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.4"' + (extra || "") + '/>';
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
    // 페이드 없이 딱 바뀌는 표시 (카운터 숫자용)
    function snap(from, to, inner) {
      var a = r4(from / D);
      var anim = to >= D
        ? '<animate attributeName="opacity" calcMode="discrete" values="0;1" keyTimes="0;' + a + '" dur="' + D + 's" fill="freeze"/>'
        : '<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;' + a + ';' + r4(to / D) + '" dur="' + D + 's" fill="freeze"/>';
      return '<g opacity="0">' + inner + anim + '</g>';
    }

    // ---- 비트 처리 (순수 계산) ----
    var DATA = "0001111111001111101000";
    var out = [], srcIdx = [], cnt = [], stuffed = [];
    var run = 0;
    for (var i = 0; i < DATA.length; i++) {
      var bit = DATA.charAt(i);
      run = bit === "1" ? run + 1 : 0;
      out.push(bit); srcIdx.push(i); cnt.push(run); stuffed.push(false);
      if (run === 5) {                       // 1 이 다섯 개 연속 → 0 삽입, 카운터 리셋
        out.push("0"); srcIdx.push(i); cnt.push(0); stuffed.push(true);
        run = 0;
      }
    }
    var T0 = 1.5, STEP = 0.4;
    function tk(k) { return r4(T0 + k * STEP); }
    var tEnd = tk(out.length);                // 마지막 칸이 끝나는 시각 (11.1)
    var stuffK = [];
    stuffed.forEach(function (f, k) { if (f) stuffK.push(k); });

    var s = '<svg viewBox="0 0 760 322" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bit stuffing 애니메이션">';
    s += '<defs><marker id="bsa_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C.red + '"/></marker></defs>';

    // ---- 단계 자막 ----
    var t1 = tk(stuffK[0]), t2 = tk(stuffK[1]);
    var caps = [
      [0, T0, "송신 측이 data 를 한 비트씩 내보내며 연속된 1 의 개수를 센다"],
      [T0, t1, "1 이 나오면 카운터 +1, 0 이 나오면 카운터를 0 으로 리셋"],
      [t1, t1 + 0.8, "0 뒤에 1 이 5 개 연속! → 다음 비트와 상관없이 extra 0 을 하나 삽입"],
      [t1 + 0.8, t2, "카운터 리셋 후 계속 — 삽입한 0 뒤의 1 은 다시 1 부터 센다"],
      [t2, t2 + 0.8, "또 1 이 5 개 연속 → extra 0 삽입 (stuffed bit)"],
      [t2 + 0.8, tEnd, "나머지 비트 전송 — data 22 비트가 frame 안에서는 24 비트"],
      [tEnd, D, "수신 측: 11111 뒤의 0 을 제거(unstuffing) → 원래 data 복원, flag 와 헷갈리지 않음 ✓"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 입력: Data from upper layer ----
    var IW = 26, IX = (760 - DATA.length * IW) / 2, IY = 62;
    s += '<text x="' + IX + '" y="54" font-size="12" fill="' + C.muted + '">Data from upper layer (22 bits)</text>';
    for (i = 0; i < DATA.length; i++) {
      s += '<rect x="' + (IX + i * IW) + '" y="' + IY + '" width="' + IW + '" height="26" fill="' + C.aL + '" stroke="' + C.a + '" stroke-width="1"/>';
      s += txt(IX + i * IW + IW / 2, IY + 18, DATA.charAt(i), 14, "#222", MONO);
    }
    // 지금 읽는 비트 표시 (discrete 이동)
    var pv = [], pk = [];
    pv.push(IX + "," + IY); pk.push(0);
    for (var k = 0; k < out.length; k++) { pv.push((IX + srcIdx[k] * IW) + "," + IY); pk.push(r4(tk(k) / D)); }
    pv.push((IX + srcIdx[out.length - 1] * IW) + "," + IY); pk.push(1);
    s += '<g opacity="0"><rect x="0" y="-3" width="' + IW + '" height="32" fill="none" stroke="' + C.c + '" stroke-width="3" rx="3"/>' +
      '<animateTransform attributeName="transform" type="translate" calcMode="discrete" values="' + pv.join(";") + '" keyTimes="' + pk.join(";") + '" dur="' + D + 's" fill="freeze"/>' +
      show(T0, tEnd) + '</g>';

    // ---- 연속 1 카운터 ----
    s += box(230, 102, 300, 38, "#fff", C.dev);
    s += '<text x="248" y="127" font-size="14" fill="' + C.dev + '" font-weight="700">연속 1 카운터 =</text>';
    s += snap(0, T0, '<text x="385" y="128" font-size="18" fill="#222" font-weight="700"' + MONO + '>0</text>');
    for (k = 0; k < out.length; k++) {
      var until = k + 1 < out.length ? tk(k + 1) : D;
      var label, col = "#222";
      if (stuffed[k]) { label = "0 (리셋)"; col = C.red; }
      else if (cnt[k] === 5) { label = "5  !"; col = C.red; }
      else label = String(cnt[k]);
      s += snap(tk(k), until, '<text x="385" y="128" font-size="18" fill="' + col + '" font-weight="700"' + MONO + '>' + label + '</text>');
    }

    // ---- 출력: Frame sent ----
    var OW = 24, OX = 90, OY = 168;
    s += '<text x="' + OX + '" y="160" font-size="12" fill="' + C.muted + '">Frame sent (data 부분)</text>';
    s += box(28, OY, 58, 26, C.redL, C.red) + txt(57, OY + 18, "Flag", 13, C.red, ' font-weight="700"');
    s += box(OX + out.length * OW + 6, OY, 58, 26, C.redL, C.red) + txt(OX + out.length * OW + 35, OY + 18, "Flag", 13, C.red, ' font-weight="700"');
    for (k = 0; k < out.length; k++) {
      s += '<rect x="' + (OX + k * OW) + '" y="' + OY + '" width="' + OW + '" height="26" fill="#f6f6f6" stroke="#ccc" stroke-width="1"/>';
    }
    for (k = 0; k < out.length; k++) {
      var cx = OX + k * OW;
      var cell = stuffed[k]
        ? '<rect x="' + cx + '" y="' + OY + '" width="' + OW + '" height="26" fill="' + C.redL + '" stroke="' + C.red + '" stroke-width="2"/>' + txt(cx + OW / 2, OY + 18, "0", 15, C.red, ' font-weight="700"' + MONO)
        : '<rect x="' + cx + '" y="' + OY + '" width="' + OW + '" height="26" fill="' + C.aL + '" stroke="' + C.a + '" stroke-width="1"/>' + txt(cx + OW / 2, OY + 18, out[k], 14, "#222", MONO);
      s += vis(tk(k), D, cell);
      if (stuffed[k]) {
        s += vis(tk(k), D, '<line x1="' + (cx + OW / 2) + '" y1="' + (OY + 44) + '" x2="' + (cx + OW / 2) + '" y2="' + (OY + 30) + '" stroke="' + C.red + '" stroke-width="2" marker-end="url(#bsa_arrow)"/>' +
          txt(cx + OW / 2, OY + 58, "extra 0", 11, C.red, ' font-weight="700"'));
      }
    }
    s += vis(tEnd, D, txt(380, OY + 58, "← Two extra bits →", 13, C.red, ' font-weight="700"'));

    // ---- 수신 측 확인 ----
    var rc = box(90, 240, 580, 50, C.bL, C.b);
    rc += '<text x="106" y="260" font-size="12" fill="#222"><tspan font-weight="700" fill="' + C.b + '">수신 측 </tspan>Flag = <tspan fill="' + C.red + '" font-weight="700"' + MONO + '>01111110</tspan> (1 이 6 개 연속)</text>';
    rc += '<text x="106" y="280" font-size="12" fill="#222">stuffing 후 data 안의 1 은 최대 5 개 연속 → flag 아님 ✓ · 11111 뒤의 0 은 unstuffing 으로 제거</text>';
    s += vis(tEnd, D, rc);

    // ---- 요점 ----
    s += txt(380, 314, "Bit stuffing: 0 뒤에 1 이 5 개 연속되면 0 을 하나 추가 → 수신기가 data 를 flag(01111110)로 오인하지 않음", 12, "#333");
    s += '</svg>';
    return s;
  }
};
