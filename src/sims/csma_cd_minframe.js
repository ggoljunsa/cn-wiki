window.SIMS = window.SIMS || {};
// csma_cd_minframe — L6 p.46 Example 3.12: CSMA/CD 최소 프레임 크기 = bandwidth × 2T_p
(function (global) {
  "use strict";

  var TP = 25.6;  // μs

  var LINES = [
    "주어진 값: bandwidth, T_p = 25.6 μs (최대 propagation time)",
    "t = 0: A 가 첫 비트를 보내기 시작",
    "t = T_p: 첫 비트가 링크 반대쪽 끝(C)에 도착",
    "worst case: C 가 그 직전에 채널이 비었다고 보고 전송 → 충돌",
    "충돌 신호가 A 까지 되돌아오는 데 또 T_p",
    "t = 2T_p: A 가 충돌 감지 — 이때까지 A 는 아직 보내고 있어야 함",
    "T_fr(min) = 2 × T_p",
    "최소 프레임 = bandwidth × T_fr(min)",
    "bits → bytes (÷ 8)"
  ];

  var BW = {
    "10": { mbps: 10, label: "10 Mbps (Ex 3.12, Standard Ethernet)" },
    "100": { mbps: 100, label: "100 Mbps (같은 T_p 가정)" }
  };

  global.SIMS["csma_cd_minframe"] = {
    title: "CSMA/CD 최소 프레임 크기 — Example 3.12",
    desc: "L6 p.46. [[CSMA/CD]] 에서 송신자는 '''보내는 도중에만''' 충돌을 감지할 수 있다. 가장 나쁜 경우 충돌 소식이 되돌아오기까지 2 × [[T_p]] 가 걸리므로, " +
      "프레임은 적어도 그 시간 동안 전송이 이어질 만큼 길어야 한다 → [[최소 프레임 크기]] = bandwidth × 2T_p.",
    options: [
      { key: "bandwidth", label: "bandwidth", values: [
        { value: "10", label: BW["10"].label },
        { value: "100", label: BW["100"].label }
      ] }
    ],
    build: function (opts) {
      var bw = BW[opts.bandwidth] || BW["10"];
      var B = bw.mbps;
      var steps = [];
      var st = { bw: B + " Mbps", Tp: TP + " μs", t: "-", sent: "-", Tfr: "?", bits: "?", bytes: "?" };
      var phase = 0;

      function sentAt(t) { return Math.round(B * t * 10) / 10; }  // Mbps × μs = bits
      function snap() {
        return { bw: st.bw, Tp: st.Tp, t: st.t, sent: st.sent, Tfr: st.Tfr, bits: st.bits, bytes: st.bytes };
      }
      function svg() {
        var ph = phase;
        return function () {
          var W = 600, H = 300, xA = 190, xC = 500, y0 = 50, sc = 200 / (2 * TP);
          function Y(t) { return y0 + t * sc; }
          var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
          s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
          s += '<defs><marker id="cd-ah" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#555"/></marker></defs>';
          // 스테이션 & 링크
          s += '<line x1="' + xA + '" y1="30" x2="' + xC + '" y2="30" stroke="#333" stroke-width="3"/>';
          s += '<rect x="' + (xA - 22) + '" y="14" width="44" height="30" rx="4" fill="#d0ebff" stroke="#1c7ed6"/><text x="' + xA + '" y="34" text-anchor="middle" font-weight="700">A</text>';
          s += '<rect x="' + (xC - 22) + '" y="14" width="44" height="30" rx="4" fill="#ffe8cc" stroke="#e8590c"/><text x="' + xC + '" y="34" text-anchor="middle" font-weight="700">C</text>';
          // 시간축
          s += '<line x1="' + xA + '" y1="' + y0 + '" x2="' + xA + '" y2="' + (Y(2 * TP) + 30) + '" stroke="#aaa" stroke-dasharray="3 3"/>';
          s += '<line x1="' + xC + '" y1="' + y0 + '" x2="' + xC + '" y2="' + (Y(2 * TP) + 30) + '" stroke="#aaa" stroke-dasharray="3 3"/>';
          s += '<text x="' + (xA + 90) + '" y="' + (Y(2 * TP) + 44) + '" fill="#777">↓ 시간</text>';
          [[0, "t = 0"], [TP, "T_p = 25.6 μs"], [2 * TP, "2T_p = 51.2 μs"]].forEach(function (m, i) {
            if (ph >= [1, 2, 4][i]) {
              s += '<text x="' + (xA - 28) + '" y="' + (Y(m[0]) + 4) + '" text-anchor="end" fill="#333">' + m[1] + "</text>";
            }
          });
          // A 전송 막대 (A 가 보내고 있는 구간)
          var tA = ph <= 0 ? 0 : (ph === 1 ? 0.12 * TP : (ph === 2 ? TP : (ph === 3 ? 1.5 * TP : 2 * TP)));
          if (ph >= 1) {
            s += '<rect x="' + (xA - 7) + '" y="' + y0 + '" width="14" height="' + Math.max(3, tA * sc) + '" fill="#1c7ed6" opacity="0.75"/>';
            s += '<text x="' + (xA + 12) + '" y="' + (y0 + 60) + '" fill="#1c7ed6" font-size="11">A 전송 중</text>';
          }
          // A 첫 비트 전파 (A → C)
          if (ph >= 1) {
            var tEnd = Math.min(tA, TP);
            var xE = xA + (xC - xA) * (tEnd / TP);
            s += '<line x1="' + xA + '" y1="' + y0 + '" x2="' + xE + '" y2="' + Y(tEnd) + '" stroke="#1c7ed6" stroke-width="2" marker-end="url(#cd-ah)"/>';
            if (ph >= 2) s += '<text x="' + ((xA + xC) / 2 + 8) + '" y="' + (Y(TP / 2) - 6) + '" fill="#1c7ed6">A 의 첫 비트</text>';
          }
          // 충돌 & 되돌아오는 신호
          if (ph >= 2) {
            s += '<rect x="' + (xC - 7) + '" y="' + (Y(TP) - 4) + '" width="14" height="10" fill="#e8590c" opacity="0.8"/>';
            s += '<text x="' + (xC - 16) + '" y="' + (Y(TP) + 22) + '" text-anchor="end" fill="#e8590c" font-size="11">C 가 직전에 전송 시작</text>';
            s += '<text x="' + (xC - 4) + '" y="' + (Y(TP) + 22) + '" font-size="16" text-anchor="middle">💥</text>';
          }
          if (ph >= 3) {
            var tB = ph === 3 ? 1.5 * TP : 2 * TP;
            var xB = xC - (xC - xA) * ((tB - TP) / TP);
            s += '<line x1="' + xC + '" y1="' + Y(TP) + '" x2="' + xB + '" y2="' + Y(tB) + '" stroke="#c92a2a" stroke-width="2" stroke-dasharray="6 3" marker-end="url(#cd-ah)"/>';
            s += '<text x="' + ((xA + xC) / 2 + 8) + '" y="' + (Y(1.5 * TP) + 18) + '" fill="#c92a2a">충돌 신호 (또 T_p)</text>';
          }
          if (ph >= 4) {
            s += '<circle cx="' + xA + '" cy="' + Y(2 * TP) + '" r="8" fill="none" stroke="#c92a2a" stroke-width="2.5"/>';
            s += '<text x="' + (xA + 14) + '" y="' + (Y(2 * TP) + 20) + '" fill="#c92a2a" font-weight="700">A 가 충돌 감지 — 아직 전송 중이어야!</text>';
          }
          if (ph >= 5) {
            s += '<path d="M68 ' + y0 + " h-8 V" + Y(2 * TP) + ' h8" fill="none" stroke="#2f9e44" stroke-width="2"/>';
            s += '<text x="8" y="' + (Y(TP) + 30) + '" font-size="11" fill="#2f9e44" font-weight="700">T_fr</text>';
            s += '<text x="8" y="' + (Y(TP) + 46) + '" font-size="11" fill="#2f9e44" font-weight="700">≥ 2T_p</text>';
          }
          s += "</svg>";
          return s;
        };
      }
      function push(desc, line, note) {
        steps.push({ desc: desc, pc: { P: line }, vars: snap(), note: note, svg: svg() });
      }

      push("Example 3.12: CSMA/CD 네트워크, bandwidth '''" + B + " Mbps''', 최대 propagation time [[T_p]] = '''25.6 μs''' " +
        "(장치 지연 포함, jamming signal 시간은 무시). 최소 프레임 크기는?", 1);
      phase = 1; st.t = "0 μs"; st.sent = "0 bits";
      push("t = 0: A 가 첫 비트를 보낸다. A 는 carrier sense 로 채널이 비었음을 확인했다.", 2);
      phase = 2; st.t = TP + " μs"; st.sent = sentAt(TP) + " bits";
      push("t = T_p = 25.6 μs: A 의 첫 비트가 가장 먼 스테이션 C 에 막 도착한다. 그동안 A 는 " + B + " Mbps × 25.6 μs = " + sentAt(TP) + " bits 를 내보냈다.", 3);
      push("'''worst case''': C 는 A 의 비트가 도착하기 '''직전'''에 채널을 감지 → 비어 있다고 판단하고 전송을 시작한다. 곧바로 C 앞에서 [[collision]] 발생.", 4,
        "C 는 충돌을 즉시 알지만, A 는 모른다. 충돌의 흔적이 A 까지 오려면 링크를 다시 건너야 한다.");
      phase = 3; st.t = "약 " + (1.5 * TP).toFixed(1) + " μs"; st.sent = sentAt(1.5 * TP) + " bits";
      push("충돌로 뒤섞인 신호가 C → A 방향으로 되돌아온다. 이 여행에 다시 T_p = 25.6 μs 가 걸린다.", 5);
      phase = 4; st.t = (2 * TP) + " μs"; st.sent = sentAt(2 * TP) + " bits";
      push("t = 2T_p = 51.2 μs: 충돌 신호가 A 에 도착. A 가 '''이 순간에도 아직 보내고 있어야''' 충돌을 감지하고 재전송할 수 있다. " +
        "이미 다 보냈다면 A 는 성공으로 착각한다.", 6);
      phase = 5; st.Tfr = "2 × 25.6 = 51.2 μs";
      push("따라서 '''T_fr(min) = 2 × T_p = 51.2 μs'''. \"in the worst case, a station needs to transmit for a period of 51.2 μs to detect the collision.\"", 7);
      var bits = Math.round(B * 2 * TP);   // Mbps × μs = bits
      st.bits = bits + " bits";
      push("최소 프레임 = " + B + " Mbps × 51.2 μs = " + B + "×10⁶ × 51.2×10⁻⁶ = '''" + bits + " bits'''.", 8);
      st.bytes = (bits / 8) + " bytes";
      push(bits + " bits ÷ 8 = '''" + (bits / 8) + " bytes'''." + (B === 10 ? " 이것이 실제로 '''Standard Ethernet 의 최소 프레임 크기 64 bytes''' 다." : ""), 9,
        B === 100 ? "같은 T_p 를 가정하면 bandwidth 가 10배일 때 최소 프레임도 10배(640 bytes). 실제 Fast Ethernet 은 거리(T_p)를 줄여서 64 bytes 를 유지한다." :
          "기억법: 최소 프레임 = bandwidth × 2T_p. bandwidth 가 커지면 같은 시간에 더 많은 비트가 나가므로 최소 프레임도 커진다.");

      return {
        panels: [{ id: "P", title: "손으로 푸는 순서", lang: "txt", lines: LINES }],
        vars: [
          { name: "bw", label: "bandwidth", group: "주어진 값" },
          { name: "Tp", label: "T_p", group: "주어진 값" },
          { name: "t", label: "현재 시각 t", group: "시간–공간" },
          { name: "sent", label: "A 가 보낸 비트", group: "시간–공간" },
          { name: "Tfr", label: "T_fr(min)", group: "결과" },
          { name: "bits", label: "최소 프레임 (bits)", group: "결과" },
          { name: "bytes", label: "최소 프레임 (bytes)", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
