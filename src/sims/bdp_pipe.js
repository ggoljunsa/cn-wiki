// bdp_pipe — L2 p.66–68 (복습 L3 p.38–40): bandwidth-delay product = 링크를 채우는 비트 수
window.SIMS = window.SIMS || {};
(function (global) {
  "use strict";

  var DELAY = 5; // seconds

  function pipeSvg(bw, t) {
    return function () {
      var W = 620, H = 200, x0 = 90, x1 = 530, L = x1 - x0;
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
      // sender / receiver
      s += '<rect x="10" y="60" width="70" height="60" rx="6" fill="#dbe8f7" stroke="#1d65b3" stroke-width="2"/>';
      s += '<text x="45" y="95" text-anchor="middle" font-weight="700" fill="#1d65b3">송신</text>';
      s += '<rect x="' + (x1 + 10) + '" y="60" width="70" height="60" rx="6" fill="#dff3e4" stroke="#2e9e4f" stroke-width="2"/>';
      s += '<text x="' + (x1 + 45) + '" y="95" text-anchor="middle" font-weight="700" fill="#2e9e4f">수신</text>';
      // pipe
      s += '<rect x="' + x0 + '" y="70" width="' + L + '" height="40" rx="20" fill="#f4f4f4" stroke="#3b2f4a" stroke-width="2"/>';
      // second ticks
      for (var k = 0; k <= DELAY; k++) {
        var xx = x0 + L * k / DELAY;
        s += '<line x1="' + xx + '" y1="112" x2="' + xx + '" y2="120" stroke="#777"/>';
        s += '<text x="' + xx + '" y="134" text-anchor="middle" fill="#777" font-size="10">' + k + " s</text>";
      }
      s += '<text x="' + (x0 + L / 2) + '" y="152" text-anchor="middle" fill="#777" font-size="11">링크 길이 = delay 5 s 만큼의 거리 (비트가 끝까지 가는 데 5초)</text>';
      // bits: emitted at e = j / bw (j = 0,1,...) for e < t ; position (t - e)/DELAY
      var onLink = 0;
      var total = t * bw;
      for (var j = 0; j < total; j++) {
        var e = j / bw;
        var age = t - e;
        if (age > DELAY + 1e-9) continue;          // 이미 도착
        onLink++;
        var cx = x0 + L * age / DELAY;
        var arriving = Math.abs(age - DELAY) < 1e-9;
        s += '<circle cx="' + cx + '" cy="90" r="' + (bw > 1 ? 6 : 9) + '" fill="' + (arriving ? "#2e9e4f" : "#1d65b3") + '"/>';
        if (bw === 1 || j % 5 === 0) s += '<text x="' + cx + '" y="' + (bw > 1 ? 62 : 60) + '" text-anchor="middle" font-size="10" fill="#333">#' + (j + 1) + "</text>";
      }
      s += '<text x="' + (W / 2) + '" y="24" text-anchor="middle" font-size="14" font-weight="700">t = ' + t + " s · 링크 위 비트 " + onLink + " 개 (최대 = " + (bw * DELAY) + ")</text>";
      s += '<text x="' + (W / 2) + '" y="185" text-anchor="middle" fill="#555">bandwidth ' + bw + " bps × delay " + DELAY + " s = " + (bw * DELAY) + " bits</text>";
      s += "</svg>";
      return s;
    };
  }

  global.SIMS["bdp_pipe"] = {
    title: "Bandwidth-Delay Product — 파이프에 비트 채우기",
    desc: "[[bandwidth-delay product]] = bandwidth × delay = '''링크를 가득 채울 수 있는 비트 수'''. 1초 tick 마다 송신자가 bandwidth 만큼 비트를 밀어 넣고, 첫 비트는 delay 5 s 뒤에 도착한다. (L2 p.67–68)",
    options: [
      { key: "bw", label: "bandwidth × delay", values: [
        { value: "1", label: "1 bps × 5 s" },
        { value: "5", label: "5 bps × 5 s" }
      ] }
    ],
    build: function (opts) {
      var bw = opts.bw === "5" ? 5 : 1;
      var bdp = bw * DELAY;
      var steps = [];
      var maxOn = 0;
      var lines = [
        "주어진 것: bandwidth = " + bw + " bps, delay = " + DELAY + " s",
        "매초: 송신자가 " + bw + " bit 를 링크에 밀어 넣는다",
        "비트는 링크를 따라 오른쪽으로 이동 (끝까지 " + DELAY + " s)",
        "t = " + DELAY + " s: 첫 비트가 수신자에 도착 — 링크가 가득 참",
        "이후: 들어오는 만큼 나가므로 링크 위 비트 수 일정",
        "BDP = " + bw + " bps × " + DELAY + " s = " + bdp + " bits"
      ];
      for (var t = 0; t <= DELAY + 1; t++) {
        var sent = t * bw;
        var arrived = Math.max(0, t - DELAY) * bw;
        var on = sent - arrived;
        if (on > maxOn) maxOn = on;
        var pc, desc, note;
        if (t === 0) {
          pc = 1;
          desc = "t = 0 s: 링크는 비어 있다. [[bandwidth]] 는 '''1초에 링크에 밀어 넣을 수 있는 비트 수''', delay([[propagation time]]) 는 '''한 비트가 끝까지 가는 시간''' 이다.";
        } else if (t < DELAY) {
          pc = t === 1 ? 2 : 3;
          desc = "t = " + t + " s: 지금까지 " + sent + " bit 를 보냈고 아직 '''아무것도 도착하지 않았다'''. 링크 위 비트 " + on + " 개가 오른쪽으로 이동 중.";
        } else if (t === DELAY) {
          pc = 4;
          desc = "t = " + DELAY + " s: '''첫 비트가 수신자에 도착'''(초록). 이 순간 링크에는 " + on + " 개의 비트가 빈틈없이 들어차 있다 — 이것이 '''bandwidth-delay product = " + bdp + " bits'''.";
        } else {
          pc = 5;
          desc = "t = " + t + " s: 1초 동안 " + bw + " bit 가 도착하고 " + bw + " bit 가 새로 들어왔다. 링크 위 비트 수는 여전히 " + on + " — 더 늘지 않는다. 링크의 '''최대 용량''' 이 BDP 다.";
        }
        steps.push({
          desc: desc, pc: { P: pc },
          vars: { bw: bw + " bps", delay: DELAY + " s", t: t + " s", sent: sent + " bits", arrived: arrived + " bits", onlink: on + " bits", maxon: maxOn + " bits" },
          status: { P: "running" }, svg: pipeSvg(bw, t), note: note
        });
      }
      steps.push({
        desc: "결론: '''BDP = " + bw + " bps × " + DELAY + " s = " + bdp + " bits''' (The link can be filled with " + bdp + " bits). bandwidth 가 5배가 되면 같은 delay 에서 링크를 채우는 비트도 5배가 된다.",
        pc: { P: 6 },
        vars: { bw: bw + " bps", delay: DELAY + " s", t: (DELAY + 1) + " s", sent: (DELAY + 1) * bw + " bits", arrived: bw + " bits", onlink: bdp + " bits", maxon: maxOn + " bits" },
        status: { P: "done" }, svg: pipeSvg(bw, DELAY + 1),
        note: "BDP 의 의미: 송신자가 응답을 기다리지 않고 '''연속으로 보내야 링크를 놀리지 않는''' 비트 수. 파이프(링크)의 부피 = 단면적(bandwidth) × 길이(delay)."
      });
      return {
        panels: [{ id: "P", title: "BDP = bandwidth × delay", lang: "txt", lines: lines }],
        vars: [
          { name: "bw", label: "bandwidth", group: "링크" },
          { name: "delay", label: "delay", group: "링크" },
          { name: "t", label: "시각 t", group: "진행" },
          { name: "sent", label: "보낸 비트 (누적)", group: "진행" },
          { name: "arrived", label: "도착한 비트 (누적)", group: "진행" },
          { name: "onlink", label: "링크 위 비트", group: "진행" },
          { name: "maxon", label: "링크 위 최대 비트", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
