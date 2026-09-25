window.SIMS = window.SIMS || {};
// byte_stuffing — L5 p.18 Character-oriented framing: byte stuffing / unstuffing
(function (global) {
  "use strict";

  // 슬라이드 p.18 의 "Data from upper layer" 6칸: [데이터, Flag, 데이터, 데이터, ESC, 데이터]
  var DATA = ["A", "Flag", "B", "C", "ESC", "D"];

  var STUFF = [
    "for each byte b in data (upper layer):",
    "  if b == Flag or b == ESC:",
    "    output ESC        // extra byte 추가",
    "  output b",
    "frame = Flag | Header | output | Trailer | Flag"
  ];
  var UNSTUFF = [
    "for each byte b in received data:",
    "  if b == ESC:",
    "    discard b         // 추가됐던 ESC 제거",
    "    output next byte  // 다음 바이트는 무조건 data",
    "  else: output b",
    "data to upper layer"
  ];

  function isSpecial(b) { return b === "Flag" || b === "ESC"; }

  function cells(x, y, list) {
    // list: [{t, fill, stroke, bold}]
    var s = "";
    var w = 52;
    list.forEach(function (c, i) {
      var cx = x + i * w;
      s += '<rect x="' + cx + '" y="' + y + '" width="' + (w - 2) + '" height="30" rx="3" fill="' + (c.fill || "#d6ecf7") +
        '" stroke="' + (c.stroke || "#557") + '" stroke-width="' + (c.sw || 1) + '"/>';
      s += '<text x="' + (cx + (w - 2) / 2) + '" y="' + (y + 20) + '" text-anchor="middle"' +
        (c.bold ? ' font-weight="700"' : "") + ' fill="' + (c.color || "#222") + '">' + c.t + "</text>";
    });
    return s;
  }

  global.SIMS["byte_stuffing"] = {
    title: "byte stuffing / unstuffing — Flag·ESC 앞에 ESC 끼워 넣기",
    desc: "L5 p.18. 데이터 안에 [[flag]] 와 같은 패턴이 있으면 수신자가 프레임 끝으로 착각한다. " +
      "그래서 송신자는 Flag·[[ESC]] 앞에 ESC 를 하나 더 넣고([[byte stuffing]]), 수신자는 ESC 를 만나면 버리고 다음 바이트를 데이터로 읽는다.",
    options: [
      { key: "mode", label: "모드", values: [
        { value: "stuffing", label: "송신: stuffing" },
        { value: "unstuffing", label: "수신: unstuffing" }
      ] }
    ],
    build: function (opts) {
      var stuffing = opts.mode !== "unstuffing";
      var input = [];
      if (stuffing) input = DATA.slice();
      else DATA.forEach(function (b) { if (isSpecial(b)) input.push("ESC"); input.push(b); });
      // 입력에서 '추가된 ESC' 위치 (unstuffing 표시용)
      var extraIn = {};
      if (!stuffing) {
        var k = 0;
        DATA.forEach(function (b) { if (isSpecial(b)) { extraIn[k] = true; k++; } k++; });
      }

      var out = [];        // [{t, extra}]
      var st = { i: "-", b: "-", count: 0, verdict: "진행 중" };
      var steps = [];
      var P = stuffing ? "S" : "U";

      function snap() {
        return {
          idx: st.i,
          byte: st.b,
          input: input.join(" "),
          output: out.map(function (o) { return o.t; }).join(" ") || "(비어 있음)",
          count: st.count,
          verdict: st.verdict
        };
      }
      function svg(cur) {
        var outSnap = out.slice(), count = st.count;
        return function () {
          var W = 560, H = 190;
          var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
          s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
          s += '<text x="12" y="22" font-weight="700" fill="#333">' + (stuffing ? "Data from upper layer" : "Frame received (data 부분)") + "</text>";
          s += cells(12, 32, input.map(function (b, i) {
            var c = { t: b };
            if (b === "Flag") c.color = "#c00";
            if (!stuffing && extraIn[i]) c.fill = "#f5a623";
            if (i === cur) { c.stroke = "#1a4fd0"; c.sw = 3; c.bold = true; }
            else if (cur !== null && i < cur) c.fill = c.fill === "#f5a623" ? "#f9d49a" : "#eef3f6";
            return c;
          }));
          if (cur !== null && cur >= 0) {
            var ax = 12 + cur * 52 + 25;
            s += '<path d="M' + ax + " 76 l-6 10 h12 z\" fill=\"#1a4fd0\"/>";
            s += '<text x="' + ax + '" y="100" text-anchor="middle" font-size="11" fill="#1a4fd0">현재</text>';
          }
          s += '<text x="12" y="126" font-weight="700" fill="#333">' + (stuffing ? "Frame sent (data 부분)" : "Data to upper layer") + "</text>";
          var list = outSnap.map(function (o) {
            var c = { t: o.t };
            if (o.t === "Flag") c.color = "#c00";
            if (o.extra) { c.fill = "#f5a623"; c.bold = true; }
            return c;
          });
          s += cells(12, 136, list);
          s += '<text x="' + (W - 12) + '" y="126" text-anchor="end" fill="' + (stuffing ? "#b36b00" : "#2f7a38") + '">' +
            (stuffing ? "extra bytes = " : "제거한 ESC = ") + count + "</text>";
          s += "</svg>";
          return s;
        };
      }
      function push(desc, line, note, cur) {
        var pc = {}; pc[P] = line;
        var status = {}; status[P] = st.verdict === "진행 중" ? "running" : "done";
        steps.push({ desc: desc, pc: pc, vars: snap(), status: status, note: note, svg: svg(cur === undefined ? null : cur) });
      }

      if (stuffing) {
        push("상위 계층이 넘긴 데이터는 6바이트: `A Flag B C ESC D`. 이 안에 [[flag]] 와 [[ESC]] 가 '''데이터로서''' 하나씩 들어 있다. " +
          "그대로 보내면 수신자는 중간의 Flag 를 '''프레임 끝'''으로 착각한다.", 1, null, null);
        for (var i = 0; i < input.length; i++) {
          var b = input[i];
          st.i = i + 1; st.b = b;
          push((i + 1) + "번째 바이트 `" + b + "` 를 읽는다. Flag 또는 ESC 인가? → " + (isSpecial(b) ? "'''예'''" : "아니오"), 2, null, i);
          if (isSpecial(b)) {
            out.push({ t: "ESC", extra: true }); st.count++;
            push("`" + b + "` 는 특수 패턴이므로 그 앞에 '''ESC 를 하나 추가'''한다 (주황). 추가된 바이트 수 = " + st.count + ".", 3, null, i);
          }
          out.push({ t: b });
          push("`" + b + "` 자체를 출력 버퍼에 쓴다.", 4, null, i);
        }
        st.i = "-"; st.b = "-"; st.verdict = "완료: Two extra bytes";
        push("모든 바이트 처리 완료. 출력 = `" + out.map(function (o) { return o.t; }).join(" ") + "` (8바이트). " +
          "원래 6바이트에 '''Two extra bytes''' 가 붙었다. 이 뒤에 Header/Trailer 를 붙이고 양 끝을 Flag 로 감싸 전송한다.", 5,
          "데이터 속 ESC 앞에도 ESC 를 넣는 이유: 넣지 않으면 수신자가 그 ESC 를 '''다음 바이트를 보호하는 ESC''' 로 오해해 버린다.", null);
      } else {
        push("수신한 프레임에서 Flag·Header·Trailer 를 떼어낸 data 부분: `" + input.join(" ") + "` (8바이트). 주황 칸이 송신자가 끼워 넣은 ESC 다.", 1, null, null);
        var j = 0;
        while (j < input.length) {
          var c = input[j];
          st.i = j + 1; st.b = c;
          push((j + 1) + "번째 바이트 `" + c + "` 를 읽는다. ESC 인가? → " + (c === "ESC" ? "'''예'''" : "아니오"), 2, null, j);
          if (c === "ESC") {
            st.count++;
            push("ESC 는 '''버린다'''(출력하지 않음). 제거한 ESC = " + st.count + ".", 3, null, j);
            var nx = input[j + 1];
            st.i = j + 2; st.b = nx;
            out.push({ t: nx });
            push("바로 다음 바이트 `" + nx + "` 는 그것이 Flag 든 ESC 든 '''무조건 데이터'''로 출력한다. " +
              (nx === "ESC" ? "(그래서 `ESC ESC` 는 데이터 ESC 하나가 된다.)" : "(프레임 끝으로 해석하지 않는다.)"), 4, null, j + 1);
            j += 2;
          } else {
            out.push({ t: c });
            push("일반 바이트이므로 그대로 출력.", 5, null, j);
            j++;
          }
        }
        st.i = "-"; st.b = "-"; st.verdict = "완료: 원래 6바이트 복원";
        push("unstuffing 완료. 상위 계층에 `" + out.map(function (o) { return o.t; }).join(" ") + "` 을 넘긴다 — 송신 전 데이터와 똑같다. " +
          "'''Two extra bytes''' 가 정확히 제거되었다.", 6, null, null);
      }

      return {
        panels: [stuffing
          ? { id: "S", title: "송신자: byte stuffing", lang: "txt", lines: STUFF }
          : { id: "U", title: "수신자: byte unstuffing", lang: "txt", lines: UNSTUFF }],
        vars: [
          { name: "input", label: "입력", group: "바이트열" },
          { name: "idx", label: "현재 위치", group: "바이트열" },
          { name: "byte", label: "현재 바이트", group: "바이트열" },
          { name: "output", label: "출력 버퍼", group: "결과" },
          { name: "count", label: stuffing ? "추가된 바이트 수" : "제거된 ESC 수", group: "결과" },
          { name: "verdict", label: "상태", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
