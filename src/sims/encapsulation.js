// encapsulation — L1 p.38 Encapsulation and Decapsulation: 호스트 → 라우터/스위치 → 호스트
window.SIMS = window.SIMS || {};
(function (global) {
  "use strict";

  var LAYERS = [
    { n: 5, name: "Application", fill: "#8a7f7a", pdu: "message" },
    { n: 4, name: "Transport", fill: "#1ba1e2", pdu: "segment / user datagram" },
    { n: 3, name: "Network", fill: "#f0a030", pdu: "datagram" },
    { n: 2, name: "Data link", fill: "#6cb33f", pdu: "frame" },
    { n: 1, name: "Physical", fill: "#f2e422", pdu: "bits" }
  ];

  var HOST_LINES = [
    "5 Application — message",
    "4 Transport — segment (header 4)",
    "3 Network — datagram (header 3)",
    "2 Data link — frame (header 2)",
    "1 Physical — bits"
  ];

  function svgFor(mid, node, layer, stack) {
    // node: "A" | "M" | "B", layer: 1..5
    return function () {
      var W = 640, H = 290;
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
      var cols = [
        { id: "A", x: 30, title: "Source host", top: 5 },
        { id: "M", x: 250, title: mid === "router" ? "Router (L1–L3)" : "Link-layer switch (L1–L2)", top: mid === "router" ? 3 : 2 },
        { id: "B", x: 470, title: "Destination host", top: 5 }
      ];
      var bw = 140, bh = 30;
      function yOf(n) { return 40 + (5 - n) * (bh + 6); }
      // wire at bottom
      s += '<path d="M ' + (cols[0].x + bw / 2) + " " + (yOf(1) + bh) + " V 250 H " + (cols[1].x + bw / 2) + " V " + (yOf(1) + bh) +
        " M " + (cols[1].x + bw / 2) + " 250 H " + (cols[2].x + bw / 2) + " V " + (yOf(1) + bh) + '" fill="none" stroke="#d6465f" stroke-width="2" opacity="0.5"/>';
      cols.forEach(function (c) {
        var active = c.id === node;
        s += '<text x="' + (c.x + bw / 2) + '" y="24" text-anchor="middle" font-weight="700" fill="' + (active ? "#1d65b3" : "#555") + '">' + c.title + "</text>";
        LAYERS.forEach(function (L) {
          if (L.n > c.top) return;
          var cur = active && L.n === layer;
          var y = yOf(L.n);
          s += '<rect x="' + c.x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="4" fill="' + L.fill + '" opacity="' + (cur ? 1 : 0.45) + '" stroke="' + (cur ? "#d6465f" : "none") + '" stroke-width="3"/>';
          s += '<text x="' + (c.x + bw / 2) + '" y="' + (y + 20) + '" text-anchor="middle" font-weight="' + (cur ? 700 : 400) + '" fill="#222">' + L.n + " " + L.name + "</text>";
        });
      });
      s += '<text x="' + (W / 2) + '" y="275" text-anchor="middle" font-size="14" font-weight="700" font-family="monospace" fill="#3b2f4a">' + stack + "</text>";
      s += "</svg>";
      return s;
    };
  }

  global.SIMS["encapsulation"] = {
    title: "캡슐화 · 역캡슐화 — header 4·3·2 가 붙고 벗겨지는 과정 (L1 p.38)",
    desc: "[[캡슐화]]: 송신 호스트에서 한 계층 내려갈 때마다 header 가 앞에 붙고, 수신 쪽에서 거꾸로 벗겨진다. 중간 장비는 '''자기가 가진 계층까지만''' 연다 — [[라우터]] 는 3계층, [[스위치]] 는 2계층.",
    options: [
      { key: "path", label: "경로", values: [
        { value: "router", label: "host → router → host (슬라이드)" },
        { value: "switch", label: "host → switch → host" }
      ] }
    ],
    build: function (opts) {
      var mid = opts.path === "switch" ? "switch" : "router";
      var midLines = mid === "router"
        ? ["3 Network — datagram: header 3 를 보고 다음 hop 결정", "2 Data link — frame: header 2 벗기기 / 새로 붙이기", "1 Physical — bits 수신 / 송신"]
        : ["2 Data link — frame: header 2 를 읽고 포워딩 (안 바꿈)", "1 Physical — bits 수신 / 송신"];
      var steps = [];
      function push(node, layer, stack, pdu, action, desc, note) {
        var pc = { A: null, M: null, B: null };
        if (node === "M") pc.M = (mid === "router" ? 4 : 3) - layer;
        else pc[node] = 6 - layer;
        var nodeName = node === "A" ? "Source host" : node === "B" ? "Destination host" : (mid === "router" ? "Router" : "Switch");
        var layerName = LAYERS[5 - layer].name;
        steps.push({
          desc: desc, pc: pc,
          vars: { node: nodeName, layer: layer + " " + layerName, action: action, stack: stack, pdu: pdu },
          status: { A: node === "A" ? "running" : null, M: node === "M" ? "running" : null, B: node === "B" ? "running" : null },
          svg: svgFor(mid, node, layer, stack), note: note
        });
      }

      // --- source host: encapsulate ---
      push("A", 5, "Message", "message", "생성",
        "송신 호스트의 [[application layer]] 가 '''Message''' 를 만든다. 아직 header 가 하나도 없다. 이 계층의 [[PDU]] 이름은 '''message'''.");
      push("A", 4, "[4] Message", "segment (UDP: user datagram)", "encapsulate ↓",
        "[[transport layer]] 가 '''header 4''' 를 앞에 붙인다 → [4]Message = '''segment''' ([[TCP]]) 또는 user datagram ([[UDP]]). header 4 에는 [[포트 번호]] 가 들어 있다.");
      push("A", 3, "[3][4] Message", "datagram (packet)", "encapsulate ↓",
        "[[network layer]] 가 '''header 3''' 을 붙인다 → [3][4]Message = '''datagram'''. header 3 에는 출발지·목적지 [[IP]] 주소 — 끝까지 바뀌지 않는다.");
      push("A", 2, "[2][3][4] Message", "frame", "encapsulate ↓",
        "[[data-link layer]] 가 '''header 2''' 를 붙인다 → [2][3][4]Message = '''frame'''. header 2 에는 '''이번 링크''' 의 주소([[MAC 주소]])만 들어 있다.");
      push("A", 1, "0101…(bits)", "bits", "전송 →",
        "[[physical layer]] 는 header 를 붙이지 않는다. frame 전체를 '''bits''' (신호) 로 바꿔 링크에 싣는다.");

      if (mid === "router") {
        push("M", 1, "0101…(bits)", "bits", "수신 ↑",
          "[[라우터]] 의 physical layer 가 bits 를 받는다.");
        push("M", 2, "[2][3][4] Message → [3][4] Message", "frame → datagram", "decapsulate ↑",
          "라우터의 data-link layer 가 frame 을 받아 '''header 2 를 벗긴다''' (decapsulate). header 2 는 '''지난 링크''' 에서만 의미가 있었다.");
        push("M", 3, "[3][4] Message", "datagram", "routing",
          "라우터의 [[network layer]] 가 '''header 3 (목적지 IP 주소)''' 을 보고 다음 hop 을 정한다. header 4 와 Message 는 '''열어보지 않는다''' — 라우터에는 transport·application layer 가 없다.",
          "여기서 틀렸다(0920 오답): 라우터는 '''3계층(physical·data-link·network)''' 까지만 갖는다. 스위치는 2계층. 호스트만 5계층 전부.");
        push("M", 2, "[2'][3][4] Message", "frame", "encapsulate ↓",
          "다음 링크로 보내기 위해 '''새 header 2 (2')''' 를 붙인다. 다음 링크의 주소가 들어가므로 앞의 header 2 와 '''다르다'''. header 3·4 는 그대로.");
        push("M", 1, "0101…(bits)", "bits", "전송 →",
          "라우터의 physical layer 가 새 frame 을 bits 로 바꿔 다음 링크로 보낸다.");
      } else {
        push("M", 1, "0101…(bits)", "bits", "수신 ↑",
          "[[스위치]] 의 physical layer 가 bits 를 받는다.");
        push("M", 2, "[2][3][4] Message", "frame", "forwarding",
          "스위치의 data-link layer 가 '''header 2''' 의 목적지 주소를 읽고 어느 포트로 내보낼지 정한다. 스위치에는 network layer 가 없으므로 '''header 3 을 보지 않고''', frame 을 '''바꾸지 않은 채''' 그대로 보낸다.",
          "라우터와의 차이: 라우터는 header 2 를 벗기고 새로 붙이지만(2 → 2'), link-layer 스위치는 frame 을 그대로 통과시킨다. 스위치는 '''2계층''', 라우터는 '''3계층''' 장비.");
        push("M", 1, "0101…(bits)", "bits", "전송 →",
          "스위치의 physical layer 가 같은 frame 을 bits 로 내보낸다.");
      }

      var h2 = mid === "router" ? "[2']" : "[2]";
      push("B", 1, "0101…(bits)", "bits", "수신 ↑",
        "수신 호스트의 physical layer 가 bits 를 받아 frame 으로 복원한다. 이제부터는 '''역캡슐화(decapsulation)''' — 올라가며 header 를 하나씩 벗긴다.");
      push("B", 2, h2 + "[3][4] Message → [3][4] Message", "frame → datagram", "decapsulate ↑",
        "data-link layer 가 header 2 를 확인하고 벗긴다 → datagram.");
      push("B", 3, "[3][4] Message → [4] Message", "datagram → segment", "decapsulate ↑",
        "network layer 가 header 3 을 확인(목적지 IP 가 나인가?)하고 벗긴다 → segment.");
      push("B", 4, "[4] Message → Message", "segment → message", "decapsulate ↑",
        "transport layer 가 header 4 의 [[포트 번호]] 로 어느 프로세스에 줄지 정하고 벗긴다.");
      push("B", 5, "Message", "message", "전달 완료",
        "application layer 가 원래의 '''Message''' 를 받는다. header 4·3 은 '''end-to-end''' (호스트끼리만 해석), header 2 는 '''hop-to-hop''' (링크마다 새로) — [[end-to-end와 hop-to-hop]].",
        "PDU 이름 암기: application = message, transport = segment/user datagram, network = datagram, data-link = frame, physical = bits.");

      return {
        panels: [
          { id: "A", title: "Source host", lang: "txt", lines: HOST_LINES },
          { id: "M", title: mid === "router" ? "Router" : "Link-layer switch", lang: "txt", lines: midLines },
          { id: "B", title: "Destination host", lang: "txt", lines: HOST_LINES }
        ],
        vars: [
          { name: "node", label: "현재 노드", group: "위치" },
          { name: "layer", label: "현재 계층", group: "위치" },
          { name: "action", label: "동작", group: "위치" },
          { name: "stack", label: "헤더 스택", group: "데이터" },
          { name: "pdu", label: "PDU 이름", group: "데이터" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
