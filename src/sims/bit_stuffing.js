window.SIMS = window.SIMS || {};
// bit_stuffing — L5 p.20 Bit-oriented framing: bit stuffing / unstuffing
(function (global) {
  "use strict";

  // 슬라이드 p.20 "Data from upper layer" 그대로 (22 bits)
  var DATA = "0001111111001111101000";

  var STUFF = [
    "ones = 0",
    "for each bit b in data:",
    "  output b",
    "  if b == 1: ones = ones + 1",
    "  else:      ones = 0",
    "  if ones == 5:",
    "    output 0          // extra bit (stuffed 0)",
    "    ones = 0",
    "frame = Flag(01111110) | Header | output | Trailer | Flag"
  ];
  var UNSTUFF = [
    "ones = 0",
    "for each bit b in received data:",
    "  output b",
    "  if b == 1: ones = ones + 1",
    "  else:      ones = 0",
    "  if ones == 5:",
    "    skip next bit (0)  // stuffed 0 제거",
    "    ones = 0",
    "data to upper layer"
  ];

  function stuff(bits) {
    var out = "", ones = 0;
    for (var i = 0; i < bits.length; i++) {
      out += bits[i];
      ones = bits[i] === "1" ? ones + 1 : 0;
      if (ones === 5) { out += "0"; ones = 0; }
    }
    return out;
  }

  global.SIMS["bit_stuffing"] = {
    title: "bit stuffing / unstuffing — 1 다섯 개 뒤에 0 하나",
    desc: "L5 p.20. [[flag]] 는 `01111110`(1 이 6개 연속). 데이터 속에서 0 뒤에 1 이 5개 이어지면 송신자는 0 을 하나 끼워 넣어 " +
      "데이터가 절대 Flag 처럼 보이지 않게 한다. 연속 1 카운터로 한 비트씩 따라간다. ([[bit stuffing]])",
    options: [
      { key: "mode", label: "모드", values: [
        { value: "stuffing", label: "송신: stuffing" },
        { value: "unstuffing", label: "수신: unstuffing" }
      ] }
    ],
    build: function (opts) {
      var stuffing = opts.mode !== "unstuffing";
      var input = stuffing ? DATA : stuff(DATA);
      var P = stuffing ? "S" : "U";

      // 입력 쪽에서 stuffed 0 인 위치 (unstuffing 에서 빨간색)
      var extraIn = {};
      if (!stuffing) {
        var o1 = 0;
        for (var q = 0; q < input.length; q++) {
          if (input[q] === "1") o1++; else o1 = 0;
          if (o1 === 5) { extraIn[q + 1] = true; q++; o1 = 0; }
        }
      }

      var out = [];   // [{b, extra}]
      var st = { i: "-", b: "-", ones: 0, count: 0, verdict: "진행 중" };
      var skipIdx = {}; // 입력 중 버려진 비트
      var steps = [];

      function outStr() { return out.map(function (o) { return o.b; }).join("") || "(비어 있음)"; }
      function snap() {
        return { input: input, idx: st.i, bit: st.b, ones: st.ones, output: outStr(), count: st.count, verdict: st.verdict };
      }
      function row(s, x, y, arr, label) {
        s += '<text x="' + x + '" y="' + (y - 8) + '" font-weight="700" fill="#333">' + label + "</text>";
        arr.forEach(function (c, i) {
          var cx = x + i * 22;
          s += '<rect x="' + cx + '" y="' + y + '" width="20" height="26" rx="2" fill="' + (c.fill || "#d6ecf7") + '" stroke="' +
            (c.stroke || "#89a") + '" stroke-width="' + (c.sw || 1) + '"/>';
          s += '<text x="' + (cx + 10) + '" y="' + (y + 18) + '" text-anchor="middle" font-family="monospace" font-size="14"' +
            (c.red ? ' fill="#d00" font-weight="700"' : ' fill="#222"') + (c.strike ? ' text-decoration="line-through"' : "") + ">" + c.b + "</text>";
          if (c.strike) s += '<line x1="' + (cx + 2) + '" y1="' + (y + 24) + '" x2="' + (cx + 18) + '" y2="' + (y + 2) + '" stroke="#d00" stroke-width="2"/>';
        });
        return s;
      }
      function svg(cur) {
        var outSnap = out.slice();
        var skipSnap = Object.assign({}, skipIdx);
        var ones = st.ones;
        return function () {
          var W = Math.max(560, 24 + input.length * 22 + 4), H = 190;
          var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
          s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
          var inArr = input.split("").map(function (b, i) {
            var c = { b: b };
            if (!stuffing && extraIn[i]) c.red = true;
            if (skipSnap[i]) { c.strike = true; c.fill = "#fde2e2"; }
            else if (cur !== null && i < cur) c.fill = "#eef3f6";
            if (i === cur) { c.stroke = "#1a4fd0"; c.sw = 3; c.fill = "#fff7c2"; }
            return c;
          });
          s = row(s, 12, 34, inArr, stuffing ? "Data from upper layer" : "Frame received (data 부분)");
          if (cur !== null) {
            var ax = 12 + cur * 22 + 10;
            s += '<path d="M' + ax + " 64 l-6 10 h12 z\" fill=\"#1a4fd0\"/>";
          }
          // 연속 1 카운터 게이지
          s += '<text x="12" y="98" fill="#333">연속 1 카운터 ones =</text>';
          for (var g = 0; g < 5; g++) {
            s += '<rect x="' + (140 + g * 22) + '" y="86" width="18" height="16" rx="3" fill="' + (g < ones ? "#f08c00" : "#eee") + '" stroke="#b36b00"/>';
          }
          s += '<text x="' + (140 + 5 * 22 + 6) + '" y="98" font-weight="700" fill="#b36b00">' + ones + " / 5</text>";
          var outArr = outSnap.map(function (o) { return { b: o.b, red: o.extra, fill: o.extra ? "#ffe3e3" : "#d6ecf7" }; });
          s = row(s, 12, 140, outArr, stuffing ? "Frame sent (data 부분) — 빨간 0 = stuffed bit" : "Data to upper layer");
          s += "</svg>";
          return s;
        };
      }
      function push(desc, line, cur, note) {
        var pc = {}; pc[P] = line;
        var status = {}; status[P] = st.verdict === "진행 중" ? "running" : "done";
        steps.push({ desc: desc, pc: pc, vars: snap(), status: status, note: note, svg: svg(cur) });
      }

      if (stuffing) {
        push("상위 계층 데이터 `" + DATA + "` (22 bits). 중간에 1 이 '''7개''' 연속(`1111111`)이 있어서 그대로 보내면 " +
          "[[flag]] `01111110` 과 헷갈린다. 연속 1 카운터 `ones = 0` 으로 시작.", 1, null);
      } else {
        push("수신한 data 부분 `" + input + "` (24 bits). 빨간 0 두 개가 송신자가 끼워 넣은 비트다. 수신자도 같은 카운터로 따라가며, " +
          "1 이 5개 나온 직후의 0 을 버린다.", 1, null);
      }

      var i = 0;
      while (i < input.length) {
        var b = input[i];
        st.i = i + 1; st.b = b;
        st.ones = b === "1" ? st.ones + 1 : 0;
        out.push({ b: b });
        push((i + 1) + "번째 비트 `" + b + "` 출력. " + (b === "1" ? "1 이므로 ones → " + st.ones : "0 이므로 ones 를 0 으로 리셋") + ".",
          b === "1" ? 4 : 5, i);
        if (st.ones === 5) {
          if (stuffing) {
            out.push({ b: "0", extra: true }); st.count++; st.ones = 0;
            push("'''1 이 5개 연속!''' → 여섯 번째 1 이 오기 전에 '''0 을 하나 끼워 넣는다'''(빨간 0). ones 리셋. 추가된 비트 = " + st.count + ".", 7, i,
              st.count === 1 ? "다음 원본 비트가 1 이든 0 이든 무조건 넣는다. 여기서는 원본에 1 이 두 개 더 남아 있지만(7개 연속) 이제 5개를 넘을 수 없다." : null);
          } else {
            skipIdx[i + 1] = true; st.count++; st.ones = 0;
            push("1 이 5개 연속 → 바로 다음 비트 `" + input[i + 1] + "` 는 stuffed 0 이므로 '''버린다'''(취소선). ones 리셋. 제거한 비트 = " + st.count + ".", 7, i + 1);
            i++;
          }
        }
        i++;
      }
      st.i = "-"; st.b = "-";
      if (stuffing) {
        st.verdict = "완료: Two extra bits";
        push("전송할 data = `" + outStr() + "` (24 bits). 원본 22 bits 에 '''Two extra bits''' 가 붙었다. 이제 어디에도 1 이 6개 연속으로 나오지 않는다.", 9, null,
          "0 을 넣는 조건은 '''데이터 값과 무관하게''' 1 다섯 개 뒤. 뒤따르는 비트가 원래 0 이었어도 넣는다 — 수신자가 규칙만 보고 되돌릴 수 있어야 하기 때문.");
      } else {
        st.verdict = "완료: 원래 22 bits 복원";
        push("상위 계층에 `" + outStr() + "` (22 bits) 을 넘긴다. 송신 전 데이터와 같고 '''Two extra bits''' 가 정확히 빠졌다.", 9, null);
      }

      return {
        panels: [stuffing
          ? { id: "S", title: "송신자: bit stuffing", lang: "txt", lines: STUFF }
          : { id: "U", title: "수신자: bit unstuffing", lang: "txt", lines: UNSTUFF }],
        vars: [
          { name: "input", label: "입력", group: "비트열" },
          { name: "idx", label: "현재 위치", group: "비트열" },
          { name: "bit", label: "현재 비트", group: "비트열" },
          { name: "ones", label: "연속 1 카운터", group: "비트열" },
          { name: "output", label: "출력", group: "결과" },
          { name: "count", label: stuffing ? "추가된 비트 수" : "제거된 비트 수", group: "결과" },
          { name: "verdict", label: "상태", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
