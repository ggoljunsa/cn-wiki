window.SIMS = window.SIMS || {};
// wifi_addressing — L8 p.28–34 IEEE 802.11 addressing: To DS / From DS → Address 1~4 (표 값 그대로)
(function (global) {
  "use strict";

  var TABLE = [
    "ToDS FromDS | Addr1 | Addr2 | Addr3 | Addr4",
    "0 0 | Dest | Src | BSS ID | N/A",
    "0 1 | Dest | Send AP | Src | N/A",
    "1 0 | Recv AP | Src | Dest | N/A",
    "1 1 | Recv AP | Send AP | Dest | Src"
  ];
  var PROC = [
    "케이스(어디서 어디로) 확인",
    "To DS / From DS 비트 정하기",
    "Addr1 = 이 hop 의 수신자",
    "Addr2 = 이 hop 의 송신자",
    "Addr3 = 남은 한 끝",
    "Addr4 = Case 4 만 원래 출발지"
  ];

  var CASES = {
    "1": {
      row: 2, toDS: "0", fromDS: "0", title: "Case 1 — Frame is moving within a single BSS",
      frame: ["B", "A", "BSS-ID", ""],
      addr: ["Destination (B)", "Source (A)", "BSS ID", "N/A"],
      what: "같은 BSS 안에서 A → B 로 직접 (DS 를 거치지 않음)",
      why: [
        "DS 로 가지도 않고(To DS = 0) DS 에서 오지도 않는다(From DS = 0) — 같은 BSS 안의 스테이션끼리.",
        "Address 1 = 이 hop 을 받는 노드 = 최종 목적지 '''B''' → 표의 '''Destination'''.",
        "Address 2 = 이 hop 을 보내는 노드 = 원래 출발지 '''A''' → '''Source'''.",
        "Address 3 = '''BSS ID''' — 수신·송신이 이미 1·2 에 다 들어가므로, 남은 칸에는 어느 BSS 의 프레임인지를 적는다.",
        "Address 4 = '''N/A''' — Address 4 는 To DS·From DS 가 둘 다 1 일 때만 쓴다."
      ]
    },
    "2": {
      row: 3, toDS: "0", fromDS: "1", title: "Case 2 — AP → B (frame comes out of the DS)",
      frame: ["B", "AP", "A", ""],
      addr: ["Destination (B)", "Sending AP (AP)", "Source (A)", "N/A"],
      what: "DS 에서 나온 프레임을 AP 가 자기 BSS 의 B 에게 전달",
      why: [
        "From DS = 1: 프레임이 [[distribution system]] '''에서 나와''' AP 를 통해 B 에게 간다 (그림: AP → B). To DS = 0.",
        "Address 1 = 이 hop 의 수신자 = '''B''' → '''Destination'''. 무선 구간에서 B 가 받으니까.",
        "Address 2 = 이 hop 의 송신자 = '''AP''' → '''Sending AP'''. 실제로 전파를 쏘는 것은 A 가 아니라 AP.",
        "Address 3 = 원래 출발지 '''A''' → '''Source'''. 1·2 가 hop 주소로 쓰였으니, B 가 \"누가 보낸 것인지\" 알려면 원래 출발지가 3 에 있어야 한다.",
        "Address 4 = '''N/A'''."
      ]
    },
    "3": {
      row: 4, toDS: "1", fromDS: "0", title: "Case 3 — A → AP (frame goes into the DS)",
      frame: ["AP", "A", "B", ""],
      addr: ["Receiving AP (AP)", "Source (A)", "Destination (B)", "N/A"],
      what: "A 가 자기 AP 에게 보내고, AP 가 DS 로 넘김 (B 는 다른 BSS)",
      why: [
        "To DS = 1: A 의 프레임이 AP 를 거쳐 [[distribution system]] '''으로 들어간다''' (그림: A → AP, B 는 다른 BSS). From DS = 0.",
        "Address 1 = 이 hop 의 수신자 = '''AP''' → '''Receiving AP'''. 무선으로 이 프레임을 받는 건 B 가 아니라 A 의 AP.",
        "Address 2 = 이 hop 의 송신자 = '''A''' → '''Source'''.",
        "Address 3 = 최종 목적지 '''B''' → '''Destination'''. AP 가 DS 로 어디까지 보낼지 알아야 하므로.",
        "Address 4 = '''N/A'''."
      ]
    },
    "4": {
      row: 5, toDS: "1", fromDS: "1", title: "Case 4 — Frame is traveling between two APs",
      frame: ["AP2", "AP1", "B", "A"],
      addr: ["Receiving AP (AP2)", "Sending AP (AP1)", "Destination (B)", "Source (A)"],
      what: "wireless distribution system 위에서 AP1 → AP2",
      why: [
        "To DS = 1, From DS = 1: 프레임이 DS 안(Wireless distribution system)에서 AP1 → AP2 로 이동. 출발지 A, 목적지 B 는 둘 다 이 hop 의 양 끝이 아니다.",
        "Address 1 = 이 hop 의 수신자 = '''AP2''' → '''Receiving AP'''.",
        "Address 2 = 이 hop 의 송신자 = '''AP1''' → '''Sending AP'''.",
        "Address 3 = 최종 목적지 '''B''' → '''Destination'''.",
        "Address 4 = 원래 출발지 '''A''' → '''Source'''. 네 칸이 모두 쓰이는 유일한 경우."
      ]
    }
  };

  function laptop(x, y, name) {
    return '<rect x="' + (x - 16) + '" y="' + (y - 12) + '" width="32" height="20" rx="2" fill="#bfe3f5" stroke="#555"/>' +
      '<rect x="' + (x - 20) + '" y="' + (y + 8) + '" width="40" height="5" rx="1" fill="#888"/>' +
      '<text x="' + x + '" y="' + (y + 30) + '" text-anchor="middle" font-weight="700">' + name + '</text>';
  }
  function ap(x, y, name) {
    return '<rect x="' + (x - 20) + '" y="' + (y - 11) + '" width="40" height="22" rx="3" fill="#cfe8f7" stroke="#1d65b3"/>' +
      '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-weight="700" fill="#1d65b3">' + name + '</text>';
  }
  function bss(x, y, w, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="#777" stroke-dasharray="6,4"/>' +
      '<text x="' + (x + 6) + '" y="' + (y + 16) + '" fill="#555">BSS</text>';
  }

  function makeSvg(cs, nFilled) {
    return function () {
      var W = 640, H = 260;
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
      s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
      s += '<defs><marker id="wfa-ah" markerWidth="9" markerHeight="9" refX="9" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#333"/></marker></defs>';
      var key = cs.key, fx, fy, ax1, ax2;
      if (key === "1") {
        s += bss(40, 40, 560, 170);
        s += laptop(90, 130, "B") + laptop(550, 130, "A");
        ax1 = 500; ax2 = 140; fy = 125;
      } else {
        s += '<rect x="30" y="20" width="580" height="38" fill="#f7b24a" stroke="#777" stroke-dasharray="6,4"/>';
        s += '<text x="320" y="44" text-anchor="middle" font-size="14">' + (key === "4" ? "Wireless distribution system" : "Distribution system") + '</text>';
        if (key === "2") {
          s += bss(30, 70, 400, 150) + bss(450, 70, 160, 150);
          s += ap(390, 70, "AP") + laptop(90, 160, "B") + laptop(530, 160, "A");
          ax1 = 370; ax2 = 120; fy = 120;
        } else if (key === "3") {
          s += bss(30, 70, 160, 150) + bss(210, 70, 400, 150);
          s += ap(250, 70, "AP") + laptop(90, 160, "B") + laptop(550, 160, "A");
          ax1 = 520; ax2 = 270; fy = 120;
        } else {
          s += bss(30, 70, 150, 150) + bss(460, 70, 150, 150);
          s += ap(160, 70, "AP2") + ap(480, 70, "AP1") + laptop(90, 160, "B") + laptop(550, 160, "A");
          ax1 = 455; ax2 = 185; fy = 95;
        }
      }
      // 화살표 + 프레임 (Address 1~4 칸)
      s += '<line x1="' + ax1 + '" y1="' + fy + '" x2="' + ax2 + '" y2="' + fy + '" stroke="#333" stroke-width="1.5" marker-end="url(#wfa-ah)"/>';
      var cw = 46, fw = cw * 4 + 14, fx0 = (ax1 + ax2) / 2 - fw / 2, y = fy - 12;
      for (var i = 0; i < 4; i++) {
        var x = fx0 + i * cw + (i === 3 ? 14 : 0);
        if (i === 3) s += '<rect x="' + (x - 14) + '" y="' + y + '" width="14" height="24" fill="#ddd" stroke="#555"/>';
        var on = i < nFilled, txt = on ? cs.frame[i] : "";
        var fill = !on ? "#f2f2f2" : (txt ? "#ffef3a" : "#555");
        s += '<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="24" fill="' + fill + '" stroke="#555"' + (i === nFilled - 1 ? ' stroke-width="2.5"' : "") + '/>';
        if (txt) s += '<text x="' + (x + cw / 2) + '" y="' + (y + 16) + '" text-anchor="middle" font-weight="700" font-size="' + (txt.length > 3 ? 10 : 12) + '">' + txt + '</text>';
        s += '<text x="' + (x + cw / 2) + '" y="' + (y + 38) + '" text-anchor="middle" fill="#555" font-size="11">' + (i + 1) + '</text>';
      }
      s += '<text x="' + (W / 2) + '" y="' + (H - 14) + '" text-anchor="middle" font-weight="700" fill="#1d65b3">' + cs.title +
        '  (To DS = ' + cs.toDS + ', From DS = ' + cs.fromDS + ')</text>';
      s += "</svg>";
      return s;
    };
  }

  global.SIMS["wifi_addressing"] = {
    title: "802.11 주소 — To DS / From DS 와 Address 1~4",
    desc: "L8 p.28–34. 802.11 프레임에는 주소 칸이 4 개 있다. FC 의 To DS / From DS 두 비트가 [[802.11 주소 케이스]] 를 정하고, " +
      "'''Address 1 = 이 hop 의 수신자, Address 2 = 이 hop 의 송신자''' 라는 원칙에서 나머지가 따라 나온다. 값은 p.28 표 그대로.",
    options: [
      { key: "case", label: "케이스", values: [
        { value: "1", label: "Case 1 (To DS 0, From DS 0)" },
        { value: "2", label: "Case 2 (To DS 0, From DS 1)" },
        { value: "3", label: "Case 3 (To DS 1, From DS 0)" },
        { value: "4", label: "Case 4 (To DS 1, From DS 1)" }] }
    ],
    build: function (opts) {
      var key = CASES[opts["case"]] ? opts["case"] : "1";
      var cs = CASES[key]; cs.key = key;
      var steps = [];
      var v = { ToDS: "?", FromDS: "?", Addr1: "?", Addr2: "?", Addr3: "?", Addr4: "?", meaning: cs.what };
      function push(desc, pp, filled, note) {
        var snap = {}; Object.keys(v).forEach(function (k) { snap[k] = v[k]; });
        steps.push({ desc: desc, pc: { T: pp.T, P: pp.P }, vars: snap, note: note, svg: makeSvg(cs, filled) });
      }
      var capNote = (key === "2" || key === "3") ?
        "슬라이드 캡션은 뒤바뀐 것으로 보인다 (p.32 Case 2 \"heading into\", p.33 Case 3 \"coming out of\"). 표·그림 기준으로는 Case 2 = DS 에서 나옴, Case 3 = DS 로 들어감." : undefined;
      push("'''" + cs.title + "''' — " + cs.what + ".", { T: null, P: 1 }, 0, capNote);
      v.ToDS = cs.toDS; v.FromDS = cs.fromDS;
      push(cs.why[0], { T: cs.row, P: 2 }, 0);
      var keys = ["Addr1", "Addr2", "Addr3", "Addr4"];
      for (var i = 0; i < 4; i++) {
        v[keys[i]] = cs.addr[i];
        push(cs.why[i + 1], { T: cs.row, P: 3 + i }, i + 1);
      }
      return {
        panels: [
          { id: "T", title: "p.28 표 (To DS / From DS → Address 1–4)", lang: "txt", lines: TABLE },
          { id: "P", title: "채우는 순서", lang: "txt", lines: PROC }
        ],
        vars: [
          { name: "ToDS", label: "To DS", group: "FC 비트" },
          { name: "FromDS", label: "From DS", group: "FC 비트" },
          { name: "Addr1", label: "Address 1", group: "주소" },
          { name: "Addr2", label: "Address 2", group: "주소" },
          { name: "Addr3", label: "Address 3", group: "주소" },
          { name: "Addr4", label: "Address 4", group: "주소" },
          { name: "meaning", label: "의미", group: "상황" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
