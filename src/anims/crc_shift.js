// ============================================================
// crc_shift — L5 p.46–47 CRC encoder/decoder 나눗셈 (dataword 1001, divisor 1011)
// 시간축(초): 0 augmented dataword 1001000 → 1.5/3.2/4.9/6.6 네 번의 XOR 단계 (1011, 0000, 1011, 0000)
//   → 8.2 remainder 110 → codeword 1001110 → 9.8 수신 측 나눗셈 → 12.5 syndrome 000 accept → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["crc_shift"] = {
  title: "CRC 나눗셈 — 1011 이 한 칸씩 내려오며 XOR 하는 14초",
  desc: "augmented dataword 1001000 을 [[divisor]] 1011 로 [[XOR]] 나눗셈 → remainder 110 을 붙여 codeword 1001110. 수신 측이 같은 divisor 로 나누면 [[syndrome]] 000 → accept ([[CRC]])",
  duration: 14,
  build: function () {
    var D = 14;
    var C = {
      a: "#1d65b3", aL: "#dbe8f7", b: "#2e9e4f", bL: "#dff3e4",
      c: "#e09a40", cL: "#fdeec2", dev: "#3b2f4a", devL: "#efe9f6",
      red: "#d6465f", div: "#c2185b", muted: "#777"
    };
    var MONO = ' font-family="ui-monospace, Menlo, Consolas, monospace"';
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

    function xor(a, b) { var r = ""; for (var i = 0; i < a.length; i++) r += a.charAt(i) === b.charAt(i) ? "0" : "1"; return r; }
    // 세로 나눗셈 한 줄씩 계산 (순수)
    function divide(dividend, divisor) {
      var n = divisor.length, steps = [], cur = dividend.substr(0, n);
      for (var i = 0; i + n <= dividend.length; i++) {
        var dv = cur.charAt(0) === "1" ? divisor : "0000";
        var x = xor(cur, dv);
        var next = i + n < dividend.length ? x.substr(1) + dividend.charAt(i + n) : x.substr(1);
        steps.push({ i: i, cur: cur, dv: dv, q: cur.charAt(0), res: next, last: i + n >= dividend.length });
        cur = next;
      }
      return steps;
    }

    var CW = 22, RH = 24, Y0 = 100;
    // 나눗셈 한 판 그리기: x0 = dividend 첫 칸 왼쪽, times = 각 단계 시작 시각, lag = 결과 줄 지연
    function board(x0, dividend, times, lag, remColor) {
      var g = "", st = divide(dividend, "1011");
      function col(j) { return x0 + j * CW + CW / 2; }
      // divisor 와 괄호
      g += '<text x="' + (x0 - 16) + '" y="' + Y0 + '" font-size="15" fill="' + C.div + '" text-anchor="end"' + MONO + '>1 0 1 1</text>';
      g += '<path d="M' + (x0 - 10) + ',' + (Y0 - 18) + ' q8,11 0,24" fill="none" stroke="#333" stroke-width="1.5"/>';
      g += '<line x1="' + (x0 - 10) + '" y1="' + (Y0 - 18) + '" x2="' + (x0 + dividend.length * CW + 4) + '" y2="' + (Y0 - 18) + '" stroke="#333" stroke-width="1.5"/>';
      for (var j = 0; j < dividend.length; j++) g += txt(col(j), Y0, dividend.charAt(j), 15, "#222", MONO);
      st.forEach(function (p, k) {
        var t = times[k], yd = Y0 + (2 * k + 1) * RH, yr = Y0 + (2 * k + 2) * RH;
        // 몫 한 자리
        g += vis(t, D, txt(col(k), Y0 - 24, p.q, 14, C.muted, MONO));
        // divisor 줄: 위에서 한 줄 내려오며 등장
        var dvRow = "";
        for (var m = 0; m < 4; m++) dvRow += txt(col(p.i + m), yd, p.dv.charAt(m), 15, C.div, MONO);
        g += '<g opacity="0">' + dvRow +
          '<animateTransform attributeName="transform" type="translate" values="0,-' + RH + ';0,-' + RH + ';0,0;0,0" keyTimes="0;' + r4(t / D) + ';' + r4((t + 0.4) / D) + ';1" dur="' + D + 's" fill="freeze"/>' +
          show(t, D) + '</g>';
        // 지금 XOR 하는 4칸 강조
        g += vis(t, t + lag + 0.3, '<rect x="' + (col(p.i) - 11) + '" y="' + (yd - RH - 16) + '" width="' + (4 * CW) + '" height="' + (2 * RH - 2) + '" fill="none" stroke="' + C.c + '" stroke-width="2" rx="4"/>');
        g += vis(t + 0.3, D, '<line x1="' + (col(p.i) - 10) + '" y1="' + (yd + 6) + '" x2="' + (col(p.i + 3) + 10) + '" y2="' + (yd + 6) + '" stroke="#333" stroke-width="1"/>');
        // 결과 줄
        var rs = "";
        if (p.last) {
          rs += box(col(p.i + 1) - 11, yr - 16, 3 * CW, 22, remColor[1], remColor[0]);
          for (m = 0; m < 3; m++) rs += txt(col(p.i + 1 + m), yr, p.res.charAt(m), 15, remColor[0], ' font-weight="700"' + MONO);
        } else {
          for (m = 0; m < 4; m++) rs += txt(col(p.i + 1 + m), yr, p.res.charAt(m), 15, m === 3 ? C.c : "#222", (m === 3 ? ' font-weight="700"' : "") + MONO);
        }
        g += vis(t + lag, D, rs);
      });
      return { svg: g, steps: st, col: col };
    }

    var s = '<svg viewBox="0 0 760 376" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CRC 나눗셈 애니메이션">';
    s += '<defs><marker id="crc_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "dataword 1001 뒤에 0 을 3 개 붙인다 (divisor 가 4 비트) → augmented dataword 1001000"],
      [1.5, 3.2, "최상위 비트가 1 → divisor 1011 로 XOR, 다음 비트를 하나 내려 받는다"],
      [3.2, 4.9, "최상위 비트가 0 → Leftmost bit 0: use 0000 divisor"],
      [4.9, 6.6, "다시 최상위 비트가 1 → 1011 로 XOR"],
      [6.6, 8.2, "최상위 비트 0 → 0000 으로 XOR → 남은 3 비트가 remainder 110"],
      [8.2, 9.8, "codeword = dataword 1001 + remainder 110 = 1001110 을 전송"],
      [9.8, 12.5, "수신 측: 받은 codeword 1001110 을 같은 divisor 1011 로 나눈다"],
      [12.5, D, "나머지(syndrome) = 000 → 오류 없음 → accept ✓"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 왼쪽: encoder ----
    s += txt(60, 52, "송신 측 (encoder)", 13, C.a, ' font-weight="700" text-anchor="start"');
    s += '<text x="30" y="' + (Y0 + 18) + '" font-size="11" fill="' + C.div + '">Divisor</text>';
    var EX = 150;
    var enc = board(EX, "1001000", [1.5, 3.2, 4.9, 6.6], 0.8, [C.c, C.cL]);
    s += enc.svg;
    // augmented 000 표시
    s += box(enc.col(4) - 11, Y0 - 16, 3 * CW, 22, "none", C.c, ' stroke-dasharray="3 2"');
    s += txt(enc.col(8) + 4, Y0 - 2, "← 000 추가", 11, C.c, ' font-weight="700" text-anchor="start"');
    s += txt(EX - 50, Y0 - 24, "Quotient", 11, C.muted);
    // codeword: 1001 + remainder 110
    var CYW = 330;
    s += '<text x="30" y="' + (CYW + 5) + '" font-size="12" fill="#333" font-weight="700">Codeword</text>';
    s += vis(8.2, D, box(EX - 11 + 0 * CW, CYW - 12, 4 * CW, 24, "#fff59d", "#b59b00") +
      txt(enc.col(0), CYW + 5, "1", 15, "#222", MONO) + txt(enc.col(1), CYW + 5, "0", 15, "#222", MONO) +
      txt(enc.col(2), CYW + 5, "0", 15, "#222", MONO) + txt(enc.col(3), CYW + 5, "1", 15, "#222", MONO));
    // remainder 가 아래로 내려와 붙음
    var remY = Y0 + 8 * RH;
    s += '<g opacity="0">' + box(enc.col(4) - 11, remY - 16, 3 * CW, 22, C.cL, C.c) +
      txt(enc.col(4), remY, "1", 15, C.c, ' font-weight="700"' + MONO) + txt(enc.col(5), remY, "1", 15, C.c, ' font-weight="700"' + MONO) + txt(enc.col(6), remY, "0", 15, C.c, ' font-weight="700"' + MONO) +
      '<animateTransform attributeName="transform" type="translate" values="0,0;0,0;0,' + (CYW + 5 - remY) + ';0,' + (CYW + 5 - remY) + '" keyTimes="0;' + r4(8.4 / D) + ';' + r4(9.2 / D) + ';1" dur="' + D + 's" fill="freeze"/>' +
      show(8.2, D) + '</g>';
    s += '<text x="' + (enc.col(6) + 20) + '" y="' + remY + '" font-size="12" fill="' + C.c + '" font-weight="700">Remainder</text>';
    s += vis(9.2, D, '<text x="' + (enc.col(6) + 20) + '" y="' + (CYW + 5) + '" font-size="12" fill="#333">Dataword + Remainder</text>');

    // ---- 가운데 구분선 + 전송 화살표 ----
    s += '<line x1="440" y1="48" x2="440" y2="300" stroke="#ddd" stroke-width="1.5"/>';
    s += vis(9.4, D, '<path d="M455,' + CYW + ' L548,' + CYW + '" fill="none" stroke="#555" stroke-width="2" marker-end="url(#crc_arrow)"/>' +
      txt(500, CYW - 7, "전송", 12, "#555"));

    // ---- 오른쪽: decoder ----
    s += txt(470, 52, "수신 측 (decoder)", 13, C.b, ' font-weight="700" text-anchor="start"');
    var RX = 560;
    var dec = board(RX, "1001110", [9.9, 10.55, 11.2, 11.85], 0.35, [C.b, C.bL]);
    s += vis(9.8, D, dec.svg);
    s += vis(12.5, D, box(556, CYW - 13, 190, 26, C.bL, C.b) + txt(651, CYW + 5, "syndrome 000 → accept ✓", 13, C.b, ' font-weight="700"'));

    // ---- 요점 ----
    s += txt(380, 368, "CRC: 덧셈·뺄셈 모두 XOR · 최상위 비트가 0 이면 0000 으로 나눔 · 송신은 remainder 를 붙이고, 수신은 syndrome 이 0 인지 본다", 12, "#333");
    s += '</svg>';
    return s;
  }
};
