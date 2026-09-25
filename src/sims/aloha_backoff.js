window.SIMS = window.SIMS || {};
// aloha_backoff — L6 p.12 Procedure for pure ALOHA (흐름도) + Example 3.8 (T_p = 2 ms)
(function (global) {
  "use strict";

  var TP = 2;       // ms, Example 3.8: 600 km / (3×10⁸ m/s)

  var FLOW = [
    "Station has a frame to send",
    "K = 0",
    "Send the frame",
    "Wait (2 × T_p) — ACK 기다리기",
    "ACK received?",
    "  [true]  → Success",
    "  [false] K = K + 1",
    "K > K_max ?  (K_max = 15)",
    "  [true]  → Abort",
    "  [false] Choose R : 0 ~ 2^K − 1",
    "T_B = R × T_p",
    "Wait T_B → 다시 Send the frame"
  ];

  // 시드 고정 시나리오: 각 충돌 뒤에 뽑을 R
  var SCEN = {
    success: { label: "2회 충돌 후 성공", picks: [1, 3], okAt: 3 },
    abort: { label: "K_max 초과 → abort", picks: [1, 3], okAt: null }
  };

  function rangeStr(K) {
    var m = Math.pow(2, K) - 1;
    if (m <= 3) { var a = []; for (var i = 0; i <= m; i++) a.push(i); return "{" + a.join(", ") + "}"; }
    return "0 ~ " + m;
  }
  function tbSet(K) {
    var m = Math.pow(2, K) - 1;
    if (m > 7) return "0 ~ " + (m * TP) + " ms (2 ms 간격)";
    var a = []; for (var i = 0; i <= m; i++) a.push(i * TP); return "{" + a.join(", ") + "} ms";
  }

  global.SIMS["aloha_backoff"] = {
    title: "pure ALOHA 절차 — binary exponential backoff",
    desc: "L6 p.12 흐름도와 Example 3.8. 충돌할 때마다 K 가 1 늘고, R 을 0 ~ 2^K − 1 에서 뽑아 T_B = R × [[T_p]] 만큼 기다린다. " +
      "K 가 커질수록 기다릴 수 있는 범위가 두 배씩 넓어진다([[binary exponential backoff]]). R 은 재현을 위해 고정값.",
    options: [
      { key: "scenario", label: "시나리오", values: [
        { value: "success", label: SCEN.success.label },
        { value: "abort", label: SCEN.abort.label }
      ] }
    ],
    build: function (opts) {
      var sc = SCEN[opts.scenario] || SCEN.success;
      var isAbort = sc.okAt === null;
      var steps = [];
      var st = { K: "-", range: "-", R: "-", TB: "-", tbset: "-", state: "대기", attempt: 0 };

      function snap() {
        return { Tp: TP + " ms", K: st.K, range: st.range, tbset: st.tbset, R: st.R, TB: st.TB, attempt: st.attempt, state: st.state };
      }
      function svg() {
        var K = st.K, R = st.R, state = st.state, attempt = st.attempt;
        return function () {
          var W = 560, H = 190;
          var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
          s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
          var col = state.indexOf("Success") >= 0 ? "#2f9e44" : (state.indexOf("Abort") >= 0 ? "#c92a2a" : (state.indexOf("충돌") >= 0 ? "#e8590c" : "#1c7ed6"));
          s += '<text x="16" y="26" font-size="14" font-weight="700" fill="#333">K = ' + K + "</text>";
          s += '<text x="120" y="26" font-size="13" font-weight="700" fill="' + col + '">' + state + "</text>";
          if (typeof K === "number" && K >= 1 && R !== "-") {
            var m = Math.pow(2, K) - 1;
            s += '<text x="16" y="56" fill="#333">R 후보 (0 ~ 2^' + K + " − 1 = " + m + ") 와 대응하는 T_B = R × 2 ms</text>";
            var shown = Math.min(m + 1, 16);
            var cw = Math.min(64, Math.floor(520 / shown));
            for (var i = 0; i < shown; i++) {
              var r = (m + 1 > 16 && i === shown - 1) ? m : i;
              var label = (m + 1 > 16 && i === shown - 2) ? "…" : String(r);
              var pick = r === R && label !== "…";
              var x = 16 + i * cw;
              s += '<rect x="' + x + '" y="68" width="' + (cw - 4) + '" height="34" rx="4" fill="' + (pick ? "#ffd43b" : "#e7f5ff") + '" stroke="' + (pick ? "#e67700" : "#74c0fc") + '" stroke-width="' + (pick ? 2.5 : 1) + '"/>';
              s += '<text x="' + (x + (cw - 4) / 2) + '" y="90" text-anchor="middle" font-weight="' + (pick ? 700 : 400) + '"' + (cw < 40 ? ' font-size="10"' : "") + ">" + label + "</text>";
              if (cw >= 40 && label !== "…") s += '<text x="' + (x + (cw - 4) / 2) + '" y="120" text-anchor="middle" font-size="11" fill="#555">' + (r * TP) + " ms</text>";
            }
            if (m + 1 > 16 && R !== "-" && R > 13 && R < m) {
              s += '<text x="16" y="120" font-size="11" fill="#e67700">뽑힌 R = ' + R + " (칸 생략)</text>";
            }
          } else if (K === 0) {
            s += '<text x="16" y="80" fill="#555">첫 시도에는 기다리지 않고 바로 보낸다 (backoff 없음).</text>';
          }
          // 시도 이력 막대
          s += '<text x="16" y="150" fill="#333">시도 횟수:</text>';
          var n = Math.min(attempt, 17);
          for (var j = 0; j < n; j++) {
            s += '<rect x="' + (90 + j * 26) + '" y="138" width="22" height="16" rx="3" fill="' + (j === n - 1 && state.indexOf("Success") >= 0 ? "#51cf66" : "#ffa8a8") + '"/>';
          }
          s += '<text x="16" y="176" font-size="11" fill="#777">빨강 = 충돌(ACK 없음), 초록 = 성공</text>';
          s += "</svg>";
          return s;
        };
      }
      function push(desc, line, note) {
        var status = { F: /Success/.test(st.state) ? "success" : (/Abort/.test(st.state) ? "abort" : "running") };
        steps.push({ desc: desc, pc: { F: line }, vars: snap(), status: status, note: note, svg: svg() });
      }

      push("스테이션에 보낼 프레임이 생겼다. Example 3.8: 스테이션 간 최대 거리 600 km, 전파 속도 3×10⁸ m/s → " +
        "[[T_p]] = 600×10³ / 3×10⁸ = '''2 ms'''.", 1);
      st.K = 0;
      push("K = 0 (지금까지 실패한 횟수). pure ALOHA 는 carrier sense 없이 '''그냥 보낸다'''.", 2);

      var picks = sc.picks.slice();
      function sendAndWait(ok) {
        st.attempt++; st.state = "전송 중 (" + st.attempt + "번째 시도)";
        push(st.attempt + "번째 시도: 프레임을 보낸다.", 3);
        st.state = "ACK 대기";
        push("2 × T_p = " + (2 * TP) + " ms 동안 ACK 를 기다린다 (프레임이 끝까지 가고 ACK 가 돌아오는 최대 왕복 시간).", 4);
        if (ok) {
          st.state = "Success";
          push("ACK 도착 → '''Success'''. 총 " + st.attempt + "번 시도, 충돌 " + (st.attempt - 1) + "번.", 6);
          return true;
        }
        st.state = "충돌 — ACK 없음";
        push("ACK 가 오지 않았다 → 다른 스테이션 프레임과 [[collision]] 이 났다고 판단.", 5);
        return false;
      }
      function backoff(R) {
        st.K = st.K + 1;
        st.range = "-"; st.R = "-"; st.TB = "-"; st.tbset = "-";
        push("K = K + 1 → '''K = " + st.K + "'''.", 7);
        push("K(" + st.K + ") > K_max(15)? → 아니오. 계속 재시도한다.", 8);
        st.range = rangeStr(st.K); st.tbset = tbSet(st.K); st.R = R; st.TB = R * TP + " ms";
        push("R 을 0 ~ 2^" + st.K + " − 1 = " + st.range + " 에서 뽑는다 → R = '''" + R + "'''. " +
          (st.K === 2 ? "Example 3.8 그대로: K = 2 이면 R ∈ {0,1,2,3}, T_B ∈ {0, 2, 4, 6} ms." : ""), 10,
          st.K === 2 ? "Ex 3.8 시험 포인트: K = 2 → T_B 는 0, 2, 4, 6 ms 중 하나." : null);
        push("T_B = R × T_p = " + R + " × 2 ms = '''" + st.TB + "'''.", 11);
        st.state = "backoff 대기 " + st.TB;
        push(st.TB + " 기다린 뒤 다시 보낸다. 충돌한 두 스테이션이 서로 다른 R 을 뽑으면 다음 시도에서 엇갈린다.", 12);
      }

      // 1회차, 2회차 충돌 → 백오프
      for (var a = 0; a < 2; a++) {
        sendAndWait(false);
        backoff(picks[a]);
      }
      if (!isAbort) {
        sendAndWait(true);
      } else {
        // K = 3 … 14 는 건너뛰고 K = 15 로
        sendAndWait(false);
        st.K = 15; st.attempt = 15;
        var R15 = 20000;
        st.range = rangeStr(15); st.tbset = tbSet(15); st.R = R15; st.TB = R15 * TP + " ms";
        st.state = "backoff 대기 " + st.TB;
        push("… (K = 3 ~ 14 반복: 매번 충돌, 매번 범위 두 배) … 16번째 시도 직전, '''K = 15''': R 범위 0 ~ 32767, " +
          "뽑힌 R = 20000 → T_B = 40000 ms (40 초!). 범위가 2^K 로 커지므로 계속 충돌하면 대기 시간이 폭발한다.", 11,
          "건너뛴 step: 4 ~ 15번째 시도의 12번 충돌 (그때마다 K 가 3 → 15 로 증가). 각 회차는 위와 같은 Send → Wait 2T_p → K+1 → R 선택 순서.");
        sendAndWait(false);
        st.K = 16; st.range = "-"; st.R = "-"; st.TB = "-"; st.tbset = "-";
        push("K = K + 1 → '''K = 16'''.", 7);
        st.state = "Abort";
        push("K(16) > K_max(15) → '''Abort'''. 이 프레임은 포기하고 상위 계층에 실패를 알린다.", 9,
          "K_max = 15 는 흐름도의 보통 값. 충돌이 16번 연속이면 채널이 너무 붐빈다고 보고 전송을 포기한다.");
      }

      return {
        panels: [{ id: "F", title: "Procedure for pure ALOHA (L6 p.12)", lang: "txt", lines: FLOW }],
        vars: [
          { name: "Tp", label: "T_p", group: "Example 3.8" },
          { name: "K", label: "K (실패 횟수)", group: "backoff" },
          { name: "range", label: "R 범위", group: "backoff" },
          { name: "tbset", label: "가능한 T_B", group: "backoff" },
          { name: "R", label: "뽑힌 R", group: "backoff" },
          { name: "TB", label: "T_B = R × T_p", group: "backoff" },
          { name: "attempt", label: "시도 횟수", group: "상태" },
          { name: "state", label: "상태", group: "상태" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
