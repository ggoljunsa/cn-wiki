window.SIMS = window.SIMS || {};
// ethernet_addr_bits — L7 p.20–24 Ethernet addressing: Example 13.1 (전송 비트 순서) + Example 13.2 (unicast/multicast/broadcast 판정)
(function (global) {
  "use strict";

  var LINES = [
    "주소를 6 바이트로 나눈다 (hex 2자리 = 1 byte, ':' 구분)",
    "각 바이트: hex → binary 8 bits (hex 한 자리 = 4 bits)",
    "각 바이트를 뒤집는다 — LSB first (전송 순서)",
    "바이트는 left to right, byte by byte 로 전송",
    "첫 바이트의 LSB 확인 (= 둘째 hex digit 이 짝수/홀수)",
    "LSB 0 → unicast / 1 → multicast / 48 bits 전부 1 → broadcast"
  ];

  var ADDR = {
    "47:20:1B:2E:08:EE": "47:20:1B:2E:08:EE (Ex 13.1)",
    "4A:30:10:21:10:1A": "4A:30:10:21:10:1A (Ex 13.2 a)",
    "FF:FF:FF:FF:FF:FF": "FF:FF:FF:FF:FF:FF (Ex 13.2 c)"
  };

  function bin8(h) { var b = parseInt(h, 16).toString(2); while (b.length < 8) b = "0" + b; return b; }
  function rev(s) { return s.split("").reverse().join(""); }

  global.SIMS["ethernet_addr_bits"] = {
    title: "Ethernet 주소 — 전송 비트 순서와 unicast/multicast 판정",
    desc: "L7 p.20–24, Example 13.1·13.2. [[MAC 주소]] 6 bytes 는 '''바이트 단위로는 왼쪽→오른쪽''', 각 바이트 안에서는 '''LSB first''' 로 나간다. " +
      "그래서 첫 바이트의 LSB — [[unicast]]/[[multicast]] 를 정하는 비트 — 가 수신자에게 '''가장 먼저''' 도착한다.",
    options: [
      { key: "addr", label: "주소", values: Object.keys(ADDR).map(function (k) { return { value: k, label: ADDR[k] }; }) }
    ],
    build: function (opts) {
      var addr = ADDR[opts.addr] ? opts.addr : "47:20:1B:2E:08:EE";
      var hx = addr.split(":");
      var bins = hx.map(bin8), txs = bins.map(rev);
      var lsb = bins[0].charAt(7);
      var allOnes = bins.join("").indexOf("0") === -1;
      var kind = allOnes ? "broadcast" : (lsb === "0" ? "unicast" : "multicast");
      var steps = [];
      // 진행 상태: 바이트별 0=hex만, 1=binary, 2=transmitted
      var stage = [0, 0, 0, 0, 0, 0], cur = -1, showStream = false, mark = false, verdict = false;
      var st = { idx: "-", hex: "-", bin: "-", tx: "-", stream: "", lsb: "?", digit: "?", kind: "?" };

      function snap() {
        return { addr: addr, idx: st.idx, hex: st.hex, bin: st.bin, tx: st.tx, stream: st.stream || "-", digit: st.digit, lsb: st.lsb, kind: st.kind };
      }
      function svg() {
        var sg = stage.slice(), c = cur, ss = showStream, mk = mark, vd = verdict;
        return function () {
          var W = 640, H = 270, bw = 92, gap = 12, x0 = 14, y0 = 46;
          var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
          s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
          s += '<defs><marker id="eab-ah" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#1d65b3"/></marker>' +
            '<marker id="eab-ar" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e09a40"/></marker></defs>';
          // 바이트 순서 화살표 (왼→오)
          s += '<line x1="' + x0 + '" y1="20" x2="' + (x0 + 6 * bw + 5 * gap) + '" y2="20" stroke="#1d65b3" stroke-width="2" marker-end="url(#eab-ah)"/>';
          s += '<text x="' + (W / 2) + '" y="14" text-anchor="middle" fill="#1d65b3" font-weight="700">바이트 순서: left to right, byte by byte</text>';
          for (var i = 0; i < 6; i++) {
            var x = x0 + i * (bw + gap), on = i === c;
            s += '<rect x="' + x + '" y="' + y0 + '" width="' + bw + '" height="128" rx="6" fill="' + (on ? "#fdeec2" : "#f7f7f7") + '" stroke="' + (on ? "#e09a40" : "#bbb") + '" stroke-width="' + (on ? 2.5 : 1) + '"/>';
            s += '<text x="' + (x + bw / 2) + '" y="' + (y0 + 16) + '" text-anchor="middle" fill="#777" font-size="11">byte ' + (i + 1) + '</text>';
            s += '<text x="' + (x + bw / 2) + '" y="' + (y0 + 40) + '" text-anchor="middle" font-size="18" font-weight="700" font-family="monospace">' + hx[i] + '</text>';
            if (sg[i] >= 1) {
              s += '<text x="' + (x + bw / 2) + '" y="' + (y0 + 66) + '" text-anchor="middle" font-family="monospace" font-size="13">' + bins[i] + '</text>';
              s += '<text x="' + (x + bw / 2) + '" y="' + (y0 + 80) + '" text-anchor="middle" fill="#777" font-size="10">binary (MSB…LSB)</text>';
            }
            if (sg[i] >= 2) {
              // 바이트 안의 비트 순서 화살표 (오→왼)
              s += '<line x1="' + (x + bw - 10) + '" y1="' + (y0 + 90) + '" x2="' + (x + 10) + '" y2="' + (y0 + 90) + '" stroke="#e09a40" stroke-width="1.5" marker-end="url(#eab-ar)"/>';
              var tx = txs[i];
              if (i === 0 && mk) {
                s += '<text x="' + (x + bw / 2) + '" y="' + (y0 + 110) + '" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700">' +
                  '<tspan fill="#d6465f">' + tx.charAt(0) + '</tspan><tspan fill="#2e9e4f">' + tx.slice(1) + '</tspan></text>';
              } else {
                s += '<text x="' + (x + bw / 2) + '" y="' + (y0 + 110) + '" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#2e9e4f">' + tx + '</text>';
              }
              s += '<text x="' + (x + bw / 2) + '" y="' + (y0 + 123) + '" text-anchor="middle" fill="#777" font-size="10">전송 (LSB first)</text>';
            }
          }
          if (mk) {
            var lx = x0 + 22;
            s += '<circle cx="' + lx + '" cy="' + (y0 + 106) + '" r="9" fill="none" stroke="#d6465f" stroke-width="2"/>';
            s += '<text x="' + x0 + '" y="' + (y0 + 148) + '" fill="#d6465f" font-weight="700">↑ 가장 먼저 도착하는 비트 = 첫 바이트의 LSB = ' + lsb +
              ' (둘째 hex digit ' + hx[0].charAt(1) + ' 은 ' + (lsb === "1" ? "홀수" : "짝수") + ')</text>';
          }
          if (ss) {
            s += '<text x="' + x0 + '" y="' + (y0 + 174) + '" fill="#333" font-weight="700">회선 위 비트열 (먼저 나가는 것이 왼쪽):</text>';
            s += '<text x="' + x0 + '" y="' + (y0 + 192) + '" font-family="monospace" font-size="12" fill="#2e9e4f">' + txs.join(" ") + '</text>';
          }
          if (vd) {
            var col = kind === "unicast" ? "#1d65b3" : (kind === "multicast" ? "#e09a40" : "#d6465f");
            s += '<rect x="' + (W - 196) + '" y="' + (y0 + 200) + '" width="182" height="22" rx="5" fill="' + col + '"/>';
            s += '<text x="' + (W - 105) + '" y="' + (y0 + 215) + '" text-anchor="middle" fill="#fff" font-weight="700">판정: ' + kind + ' address</text>';
          }
          s += "</svg>";
          return s;
        };
      }
      function push(desc, line, note) { steps.push({ desc: desc, pc: { P: line }, vars: snap(), note: note, svg: svg() }); }

      push("주소 '''" + addr + "''' — 6 bytes (48 bits) 를 hexadecimal notation 으로 쓴 것. ':' 로 나뉜 두 글자가 1 byte 다.", 1);
      for (var i = 0; i < 6; i++) {
        cur = i; stage[i] = 1;
        st.idx = (i + 1) + " / 6"; st.hex = hx[i]; st.bin = bins[i]; st.tx = "?";
        push("byte " + (i + 1) + " = '''" + hx[i] + "''' → hex 한 자리를 4 bits 로: " + hx[i].charAt(0) + " = " + bins[i].slice(0, 4) + ", " +
          hx[i].charAt(1) + " = " + bins[i].slice(4) + " → '''" + bins[i] + "'''.", 2);
        stage[i] = 2; st.tx = txs[i]; st.stream = txs.slice(0, i + 1).join(" ");
        push("이 바이트는 '''LSB first''' 로 나가므로 비트 순서를 뒤집는다: " + bins[i] + " → '''" + txs[i] + "'''.", 3,
          i === 0 ? "뒤집은 결과의 첫 글자 = 원래 바이트의 맨 오른쪽 비트(LSB). 이 비트가 회선에 가장 먼저 실린다." : undefined);
      }
      cur = -1; showStream = true; st.idx = "-"; st.hex = "-"; st.bin = "-"; st.tx = "-";
      push("바이트는 왼쪽부터 차례로 나간다. 회선 위 전체 비트열: '''" + txs.join(" ") + "'''.", 4,
        addr === "47:20:1B:2E:08:EE" ? "Example 13.1 의 답: 11100010 00000100 11011000 01110100 00010000 01110111." : undefined);
      mark = true; st.lsb = lsb; st.digit = hx[0].charAt(1) + " (" + (lsb === "1" ? "홀수" : "짝수") + ")";
      push("수신자가 '''가장 먼저''' 받는 비트 = 첫 바이트 " + hx[0] + " 의 LSB = '''" + lsb + "'''. 손으로는 둘째 hex digit '''" + hx[0].charAt(1) +
        "''' 이 " + (lsb === "1" ? "홀수" : "짝수") + "인지만 보면 된다 (" + hx[0].charAt(1) + " = " + bins[0].slice(4) + ", 맨 끝 비트 " + lsb + ").", 5);
      verdict = true; st.kind = kind;
      var why = allOnes ? "48 bits 가 '''전부 1''' → [[broadcast 주소]] (broadcast 는 multicast 의 특수한 경우: LSB 도 1)." :
        (lsb === "0" ? "LSB = 0 → '''[[unicast]]''' (한 수신자)." : "LSB = 1 → '''[[multicast]]''' (그룹 수신자).");
      var note = addr === "47:20:1B:2E:08:EE" ? "슬라이드 p.22 의 \"47: odd → broadcast\" 는 오타다. 홀수면 multicast, broadcast 는 FF:FF:FF:FF:FF:FF 하나뿐." :
        (allOnes ? "broadcast = 48 ones. 첫 바이트 LSB 도 1 이므로 multicast 조건도 만족하지만, 전부 1 인 특수한 주소를 broadcast 라 부른다." :
          "Example 13.2: 4A → A = 1010 (짝수) → LSB 0 → unicast.");
      push("판정: " + why, 6, note);

      return {
        panels: [{ id: "P", title: "손으로 푸는 순서", lang: "txt", lines: LINES }],
        vars: [
          { name: "addr", label: "주소", group: "주어진 값" },
          { name: "idx", label: "현재 바이트", group: "현재 바이트" },
          { name: "hex", label: "hex", group: "현재 바이트" },
          { name: "bin", label: "binary", group: "현재 바이트" },
          { name: "tx", label: "transmitted (LSB first)", group: "현재 바이트" },
          { name: "stream", label: "지금까지 전송된 비트열", group: "전송" },
          { name: "digit", label: "첫 바이트 둘째 hex digit", group: "판정" },
          { name: "lsb", label: "첫 바이트 LSB", group: "판정" },
          { name: "kind", label: "판정", group: "판정" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
