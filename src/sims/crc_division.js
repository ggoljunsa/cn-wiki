window.SIMS = window.SIMS || {};
// crc_division — L5 p.46 (CRC encoder) / p.47 (CRC decoder, 두 경우): XOR 긴 나눗셈을 한 행씩
(function (global) {
  "use strict";

  var DIVISOR = "1011";
  var DATAWORD = "1001";
  var MODES = {
    encoder: { dividend: "1001000", title: "Encoder" },
    decoder_ok: { dividend: "1001110", title: "Decoder (오류 없음)" },
    decoder_err: { dividend: "1000110", title: "Decoder (오류 있음)" }
  };

  var ENC = [
    "dataword 1001 뒤에 0 을 3개 붙인다 (divisor 4비트 − 1)",
    "dividend 의 앞 4비트를 현재 창(window)으로",
    "창의 leftmost bit 가 1 → divisor 1011 로 XOR, 몫 1",
    "창의 leftmost bit 가 0 → 0000 으로 XOR, 몫 0",
    "XOR 결과의 맨 앞 0 을 버리고 다음 비트를 내린다",
    "더 내릴 비트가 없으면 남은 3비트 = remainder",
    "codeword = dataword | remainder"
  ];
  var DEC = [
    "수신 codeword 7비트 전체를 그대로 dividend 로",
    "dividend 의 앞 4비트를 현재 창(window)으로",
    "창의 leftmost bit 가 1 → divisor 1011 로 XOR, 몫 1",
    "창의 leftmost bit 가 0 → 0000 으로 XOR, 몫 0",
    "XOR 결과의 맨 앞 0 을 버리고 다음 비트를 내린다",
    "더 내릴 비트가 없으면 남은 3비트 = syndrome",
    "syndrome 000 → dataword accept, 아니면 discard"
  ];

  function xor(a, b) {
    var r = "";
    for (var i = 0; i < a.length; i++) r += a[i] === b[i] ? "0" : "1";
    return r;
  }

  global.SIMS["crc_division"] = {
    title: "CRC 나눗셈 — ÷ 1011 을 한 행씩",
    desc: "L5 p.46–47. [[CRC]] 의 나눗셈은 뺄셈 대신 XOR(자리올림 없음). 창의 leftmost bit 가 1 이면 [[divisor]] 1011, " +
      "0 이면 0000 으로 XOR 하고 다음 비트를 내린다. 남은 3비트가 encoder 에서는 remainder, decoder 에서는 [[syndrome]].",
    options: [
      { key: "mode", label: "모드", values: [
        { value: "encoder", label: "Encoder: 1001000 ÷ 1011" },
        { value: "decoder_ok", label: "Decoder: 1001110 (오류 없음)" },
        { value: "decoder_err", label: "Decoder: 1000110 (오류)" }
      ] }
    ],
    build: function (opts) {
      var mode = MODES[opts.mode] ? opts.mode : "encoder";
      var enc = mode === "encoder";
      var D = MODES[mode].dividend;
      var n = D.length, k = DIVISOR.length, iters = n - k + 1;
      var P = enc ? "E" : "D";

      // 나눗셈 전체를 먼저 계산 (svg 행 배치용)
      var its = [];
      var win = D.slice(0, k);
      for (var t = 0; t < iters; t++) {
        var top = win[0];
        var sub = top === "1" ? DIVISOR : "0000";
        var x = xor(win, sub);
        var rem = x.slice(1);
        var down = t < iters - 1 ? D[t + k] : null;
        its.push({ win: win, top: top, sub: sub, x: x, rem: rem, down: down });
        if (down !== null) win = rem + down;
      }
      var finalRem = its[iters - 1].rem;

      var steps = [];
      var st = { window: "-", sub: "-", x: "-", q: "", left: D.slice(k), result: "?", verdict: "?" };
      var ev = 0;  // 지금까지 그려진 나눗셈 이벤트 수 (A: 빼는 행, B: XOR 결과, C: 비트 내림)

      function snap() {
        return {
          dividend: D, divisor: DIVISOR, window: st.window, sub: st.sub, x: st.x,
          q: st.q || "-", left: st.left || "(없음)", result: st.result, verdict: st.verdict
        };
      }

      function svg(evCount, showCode) {
        return function () {
          var cw = 24, x0 = 170, y0 = 64, rh = 23;
          var H = y0 + (2 * iters + 1) * rh + 60, W = 460;
          var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="16">';
          s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
          function bits(col, y, str, color, bold) {
            var o = "";
            for (var i = 0; i < str.length; i++) {
              o += '<text x="' + (x0 + (col + i) * cw + cw / 2) + '" y="' + y + '" text-anchor="middle" fill="' + color + '"' + (bold ? ' font-weight="700"' : "") + ">" + str[i] + "</text>";
            }
            return o;
          }
          function hl(col, y, len, color) {
            return '<rect x="' + (x0 + col * cw + 1) + '" y="' + (y - 17) + '" width="' + (len * cw - 2) + '" height="22" rx="3" fill="' + color + '"/>';
          }
          // 몫
          var qs = "";
          for (var a = 0; a < iters; a++) if (evCount > a * 3) qs += its[a].top;
          s += '<text x="' + (x0 - 6) + '" y="' + (y0 - 30) + '" text-anchor="end" font-family="sans-serif" font-size="11" fill="#c2255c">Quotient</text>';
          s += bits(0, y0 - 30, qs, "#222");
          // 나눗셈 기호
          s += '<path d="M' + (x0 - 4) + " " + (y0 - 20) + " H" + (x0 + n * cw + 8) + '" stroke="#222" stroke-width="1.5"/>';
          s += '<path d="M' + (x0 - 4) + " " + (y0 - 20) + " q10 12 0 26\" fill=\"none\" stroke=\"#222\" stroke-width=\"1.5\"/>";
          s += '<text x="' + (x0 - 16) + '" y="' + y0 + '" text-anchor="end" fill="#c2255c">' + DIVISOR.split("").join(" ") + "</text>";
          s += '<text x="' + (x0 - 16) + '" y="' + (y0 + 16) + '" text-anchor="end" font-family="sans-serif" font-size="10" fill="#c2255c">Divisor</text>';
          // dividend (첫 창 강조)
          if (evCount === 0) s += hl(0, y0, k, "#fff3bf");
          if (enc) s += hl(DATAWORD.length, y0, n - DATAWORD.length, "#f3d9c4");
          s += bits(0, y0, D, "#222");
          s += '<text x="' + (x0 + n * cw + 12) + '" y="' + y0 + '" font-family="sans-serif" font-size="11" fill="#555">' + (enc ? "← augmented dataword" : "← codeword") + "</text>";

          for (var i = 0; i < iters; i++) {
            var it = its[i];
            var ySub = y0 + (2 * i + 1) * rh;
            var yRes = ySub + rh;
            var eA = i * 3, eB = eA + 1, eC = eA + 2;
            if (evCount > eA) {
              if (evCount === eA + 1) s += hl(i, ySub, k, "#ffdeeb");
              s += bits(i, ySub, it.sub, "#c2255c", evCount === eA + 1);
              s += '<line x1="' + (x0 + i * cw) + '" y1="' + (ySub + 6) + '" x2="' + (x0 + (i + k) * cw) + '" y2="' + (ySub + 6) + '" stroke="#222"/>';
              if (it.top === "0" && evCount === eA + 1) {
                s += '<text x="' + (x0 + (i + k) * cw + 6) + '" y="' + ySub + '" font-family="sans-serif" font-size="11" fill="#5c940d">leftmost 0 → 0000</text>';
              }
            }
            if (evCount > eB) {
              var last = i === iters - 1;
              var shown = it.rem + (evCount > eC && it.down !== null ? it.down : "");
              if (evCount === eB + 1 || evCount === eC + 1) s += hl(i + 1, yRes, shown.length, last ? "#f3d9c4" : "#fff3bf");
              if (last) s += '<rect x="' + (x0 + (i + 1) * cw - 2) + '" y="' + (yRes - 19) + '" width="' + (3 * cw + 4) + '" height="26" rx="3" fill="none" stroke="#8a5a2b" stroke-width="2"/>';
              s += '<text x="' + (x0 + i * cw + cw / 2) + '" y="' + yRes + '" text-anchor="middle" fill="#bbb">' + it.x[0] + "</text>";
              s += bits(i + 1, yRes, shown, "#222", evCount === eB + 1 || evCount === eC + 1);
              if (last) s += '<text x="' + (x0 + (i + 4) * cw + 10) + '" y="' + yRes + '" font-family="sans-serif" font-size="12" fill="#8a5a2b" font-weight="700">' + (enc ? "Remainder" : "Syndrome") + "</text>";
            }
            if (evCount > eC && it.down !== null) {
              var cx = x0 + (i + k) * cw + cw / 2;
              s += '<path d="M' + cx + " " + (y0 + 5) + " V" + (yRes - 18) + '" stroke="#e64980" stroke-width="1.5" marker-end="url(#crc-ah)"/>';
            }
          }
          s += '<defs><marker id="crc-ah" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e64980"/></marker></defs>';
          if (showCode) {
            var yb = H - 18;
            if (enc) {
              s += '<text x="20" y="' + yb + '" font-family="sans-serif" font-size="13" fill="#333">Codeword =</text>';
              s += '<rect x="104" y="' + (yb - 17) + '" width="' + (4 * cw) + '" height="24" fill="#ffec99" stroke="#555"/>';
              s += '<rect x="' + (104 + 4 * cw) + '" y="' + (yb - 17) + '" width="' + (3 * cw) + '" height="24" fill="#f3d9c4" stroke="#555"/>';
              s += bits(-2.75, yb, DATAWORD + finalRem, "#222", true);
            } else {
              var ok = finalRem === "000";
              s += '<text x="20" y="' + yb + '" font-family="sans-serif" font-size="14" font-weight="700" fill="' + (ok ? "#2f9e44" : "#c92a2a") + '">' +
                (ok ? "syndrome 000 → Dataword 1001 accepted" : "syndrome " + finalRem + " → Dataword discarded") + "</text>";
            }
          }
          s += "</svg>";
          return s;
        };
      }
      function push(desc, line, note, showCode) {
        var pc = {}; pc[P] = line;
        var status = {}; status[P] = st.verdict === "?" ? "running" : (st.verdict.indexOf("discard") >= 0 ? "discard" : "done");
        steps.push({ desc: desc, pc: pc, vars: snap(), status: status, note: note, svg: svg(ev, !!showCode) });
      }

      if (enc) {
        push("dataword `1001` (k = 4 비트), divisor `1011` (4비트, 즉 x³ + x + 1). 나머지는 divisor 보다 한 자리 짧은 3비트이므로 " +
          "dataword 뒤에 '''0 을 3개''' 붙여 augmented dataword `1001000` 을 만든다 (갈색 칸).", 1);
      } else {
        push("수신한 codeword `" + D + "` 을 '''그대로''' 1011 로 나눈다 (decoder 는 0 을 덧붙이지 않는다). " +
          (mode === "decoder_err" ? "송신값 1001110 에서 a₃ 자리(왼쪽 4번째) 비트가 1 → 0 으로 뒤집혔다." : "오류 없이 도착한 경우."), 1);
      }
      st.window = its[0].win;
      push("앞 4비트 `" + st.window + "` 가 첫 창. 남은 비트 `" + st.left + "` 는 한 번에 하나씩 내려온다.", 2);

      for (var i = 0; i < iters; i++) {
        var it = its[i];
        st.window = it.win; st.sub = it.sub; st.x = "-";
        st.q += it.top;
        ev = i * 3 + 1;
        push("창 `" + it.win + "` 의 leftmost bit = " + it.top + " → " +
          (it.top === "1" ? "divisor `1011` 로 XOR, 몫 비트 1." : "'''0000''' 으로 XOR, 몫 비트 0. (\"Should all-0s divisor when the leftmost bit is 0\")"),
          it.top === "1" ? 3 : 4);
        st.x = it.x;
        ev = i * 3 + 2;
        push("`" + it.win + "` ⊕ `" + it.sub + "` = `" + it.x + "`. 맨 앞은 항상 0 이 되므로 버리고 `" + it.rem + "` 이 남는다.", 5);
        if (it.down !== null) {
          st.left = st.left.slice(1);
          st.window = it.rem + it.down;
          ev = i * 3 + 3;
          push("dividend 의 다음 비트 `" + it.down + "` 를 내린다(분홍 화살표) → 새 창 `" + st.window + "`.", 5);
        }
      }
      st.result = finalRem;
      st.window = "-"; st.sub = "-";
      var qNote = null;
      if (mode === "decoder_err") {
        qNote = "슬라이드 p.47 오른쪽 그림은 몫을 1010 으로 적었지만 마지막 행에서 1011 로 XOR 했으므로 실제 몫은 1011 이다 (왼쪽 그림 복사 흔적). CRC 에서 몫은 버리므로 syndrome 011 에는 영향 없다.";
      }
      push("더 내릴 비트가 없다. 남은 3비트 `" + finalRem + "` = '''" + (enc ? "remainder" : "syndrome") + "'''. 몫 `" + st.q + "` 은 쓰지 않고 버린다.", 6, qNote);

      if (enc) {
        st.verdict = "codeword " + DATAWORD + finalRem;
        push("remainder `110` 을 augmented 자리(000)에 넣어 '''codeword = `1001` | `110` = `1001110`''' 을 전송한다. " +
          "이 codeword 는 1011 로 나누면 나머지가 0 이 된다 — decoder 모드에서 확인해 보라.", 7, null, true);
      } else if (finalRem === "000") {
        st.verdict = "accept: dataword " + DATAWORD;
        push("syndrome `000` → 오류 없음으로 판단, 앞 4비트 dataword `1001` 을 '''accept'''.", 7, null, true);
      } else {
        st.verdict = "discard";
        push("syndrome `" + finalRem + "` ≠ 000 → 오류 검출, dataword '''discard'''.", 7,
          "syndrome 이 0 이 아니면 반드시 오류가 있다. 반대로 0 이라도 오류 패턴이 divisor 의 배수이면 놓칠 수 있다.", true);
      }

      return {
        panels: [enc
          ? { id: "E", title: "CRC encoder: 나눗셈 절차", lang: "txt", lines: ENC }
          : { id: "D", title: "CRC decoder: 나눗셈 절차", lang: "txt", lines: DEC }],
        vars: [
          { name: "dividend", label: enc ? "dividend (augmented)" : "dividend (codeword)", group: "나눗셈" },
          { name: "divisor", label: "divisor", group: "나눗셈" },
          { name: "window", label: "현재 4비트 창", group: "현재 행" },
          { name: "sub", label: "XOR 할 값", group: "현재 행" },
          { name: "x", label: "XOR 결과", group: "현재 행" },
          { name: "q", label: "몫 (지금까지)", group: "현재 행" },
          { name: "left", label: "남은 비트", group: "현재 행" },
          { name: "result", label: enc ? "remainder" : "syndrome", group: "결과" },
          { name: "verdict", label: enc ? "codeword" : "판정", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
