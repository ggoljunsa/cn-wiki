window.SIMS = window.SIMS || {};
// csma_ca_handshake — L8 p.14–17 DCF (CSMA/CA): DIFS → RTS → SIFS → CTS → SIFS → Data → SIFS → ACK, NAV, 핸드셰이크 충돌
(function (global) {
  "use strict";

  // 시간 단위: 슬롯 (설명용 길이 — 슬라이드에는 수치가 없다)
  // DIFS 2, RTS 2, SIFS 1, CTS 2, Data 6, ACK 2
  var COL = { RTS: "#333", CTS: "#333", Data: "#1aa3e0", ACK: "#333", NAV: "#cfd3d8", X: "#d6465f" };

  function makeSvg(segs, marks, T, t, title) {
    return function () {
      var W = 640, H = 230, x0 = 56, x1 = W - 20, rows = { A: 50, B: 105, C: 160 };
      var sx = function (v) { return x0 + (x1 - x0) * v / T; };
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
      s += '<rect width="' + W + '" height="' + H + '" rx="8" fill="#fff"/>';
      s += '<text x="' + (W / 2) + '" y="18" text-anchor="middle" font-weight="700" fill="#1d65b3">' + title + '</text>';
      var names = { A: "A (Source)", B: "B (Dest.)", C: "C (Other)" };
      Object.keys(rows).forEach(function (r) {
        var y = rows[r];
        s += '<line x1="' + x0 + '" y1="' + (y + 14) + '" x2="' + x1 + '" y2="' + (y + 14) + '" stroke="#bbb" stroke-dasharray="3,3"/>';
        s += '<text x="6" y="' + (y + 18) + '" font-weight="700" font-size="11">' + names[r] + '</text>';
      });
      segs.forEach(function (g) {
        if (g.s >= t) return;
        var e = Math.min(g.e, t), y = rows[g.row];
        var fill = COL[g.kind] || "#333";
        s += '<rect x="' + sx(g.s) + '" y="' + (y + 2) + '" width="' + Math.max(1, sx(e) - sx(g.s)) + '" height="22" rx="2" fill="' + fill + '"' +
          (g.kind === "X" ? ' fill-opacity="0.85"' : "") + '/>';
        var tc = g.kind === "NAV" ? "#333" : "#fff";
        if (e - g.s >= 1) s += '<text x="' + ((sx(g.s) + sx(e)) / 2) + '" y="' + (y + 17) + '" text-anchor="middle" fill="' + tc + '" font-weight="700" font-size="11">' + g.label + '</text>';
      });
      marks.forEach(function (m) {
        if (m.s >= t) return;
        var e = Math.min(m.e, t), y = rows[m.row];
        s += '<path d="M' + sx(m.s) + ',' + (y - 4) + ' v-4 H' + sx(e) + ' v4" fill="none" stroke="#e09a40" stroke-width="1.5"/>';
        s += '<text x="' + ((sx(m.s) + sx(e)) / 2) + '" y="' + (y - 11) + '" text-anchor="middle" fill="#b8741a" font-size="10">' + m.label + '</text>';
      });
      // 시간축
      var ya = 200;
      s += '<line x1="' + x0 + '" y1="' + ya + '" x2="' + x1 + '" y2="' + ya + '" stroke="#555"/>';
      for (var k = 0; k <= T; k++) {
        s += '<line x1="' + sx(k) + '" y1="' + ya + '" x2="' + sx(k) + '" y2="' + (ya + 4) + '" stroke="#555"/>';
        if (k % 2 === 0 || k === T) s += '<text x="' + sx(k) + '" y="' + (ya + 16) + '" text-anchor="middle" font-size="10" fill="#555">' + k + '</text>';
      }
      s += '<text x="' + x1 + '" y="' + (ya - 4) + '" text-anchor="end" font-size="10" fill="#555">Time (slot)</text>';
      s += '<line x1="' + sx(t) + '" y1="30" x2="' + sx(t) + '" y2="' + ya + '" stroke="#d6465f" stroke-width="1.5"/>';
      s += '<text x="' + sx(t) + '" y="28" text-anchor="middle" fill="#d6465f" font-size="10">t=' + t + '</text>';
      s += "</svg>";
      return s;
    };
  }

  function buildNormal() {
    var T = 17;
    var segs = [
      { row: "A", s: 2, e: 4, kind: "RTS", label: "RTS" },
      { row: "B", s: 5, e: 7, kind: "CTS", label: "CTS" },
      { row: "C", s: 5, e: 7, kind: "CTS", label: "CTS" },
      { row: "C", s: 7, e: 17, kind: "NAV", label: "NAV" },
      { row: "A", s: 8, e: 14, kind: "Data", label: "Data" },
      { row: "B", s: 15, e: 17, kind: "ACK", label: "ACK" }
    ];
    var marks = [
      { row: "A", s: 0, e: 2, label: "DIFS" },
      { row: "B", s: 4, e: 5, label: "SIFS" },
      { row: "A", s: 7, e: 8, label: "SIFS" },
      { row: "B", s: 14, e: 15, label: "SIFS" }
    ];
    var panels = [
      { id: "A", title: "A (송신)", lang: "txt", lines: [
        "채널 감지: DIFS 동안 idle 인지 확인",
        "RTS 전송 (duration 필드 포함)",
        "CTS 대기",
        "CTS 수신 → SIFS 후 Data 전송",
        "ACK 대기",
        "ACK 수신 → 전송 성공"] },
      { id: "B", title: "B (수신)", lang: "txt", lines: [
        "대기 (수신 준비)",
        "RTS 수신 → SIFS 기다림",
        "CTS 전송 (duration 필드 포함)",
        "Data 수신 → SIFS 기다림",
        "ACK 전송"] },
      { id: "C", title: "C (제3자)", lang: "txt", lines: [
        "채널 감지 (자기 프레임 보낼 기회 대기)",
        "CTS 수신 → duration 값으로 NAV 설정",
        "NAV 카운트다운 — 채널 idle 확인 안 함",
        "NAV = 0 → DIFS 부터 채널 확인 가능"] }
    ];
    var steps = [];
    function push(t, desc, pc, v, note) {
      steps.push({ desc: desc, pc: pc, vars: v, note: note, svg: makeSvg(segs, marks, T, t, "정상: RTS/CTS 핸드셰이크") });
    }
    function V(t, ch, a, b, nav, ifs, dur) {
      return { t: t, channel: ch, A: a, B: b, C_NAV: nav, IFS: ifs, duration: dur };
    }
    push(0, "A 에게 보낼 프레임이 생겼다. [[CSMA/CA]] 는 바로 보내지 않고 먼저 채널을 감지한다.",
      { A: 1, B: 1, C: 1 }, V(0, "idle", "채널 감지", "대기", "-", "-", "-"));
    push(2, "'''DIFS''' (DCF interframe space) 동안 채널이 계속 idle → A 는 보낼 수 있다. DIFS 는 [[interframe space]] 중 일반 데이터 경쟁용으로 가장 길다(Forouzan 보충).",
      { A: 1, B: 1, C: 1 }, V(2, "idle", "DIFS 완료", "대기", "-", "DIFS", "-"));
    push(4, "A 가 '''RTS'''(request to send) 를 보낸다. RTS 에는 채널을 점유할 '''duration''' (SIFS+CTS+SIFS+Data+SIFS+ACK = 13 slot) 이 들어 있다. C 는 A 의 전파가 닿지 않는 위치(hidden station)라 RTS 를 못 듣는다.",
      { A: 2, B: 2, C: 1 }, V(4, "busy (RTS)", "RTS 전송", "RTS 수신", "-", "-", "RTS: 13"));
    push(5, "B 는 '''SIFS''' (short interframe space) 만큼만 기다린다. SIFS < DIFS 이므로 응답 프레임(CTS·ACK)이 다른 스테이션보다 '''먼저''' 채널을 잡는다.",
      { A: 3, B: 2, C: 1 }, V(5, "idle (SIFS)", "CTS 대기", "SIFS", "-", "SIFS", "RTS: 13"));
    push(7, "B 가 '''CTS'''(clear to send) 를 보낸다. CTS 에도 duration (SIFS+Data+SIFS+ACK = 10 slot) 이 들어 있다. 이 CTS 는 A 뿐 아니라 B 주변의 C 에게도 들린다 — [[RTS와 CTS]].",
      { A: 3, B: 3, C: 2 }, V(7, "busy (CTS)", "CTS 수신", "CTS 전송", "-", "-", "CTS: 10"));
    push(7, "C 는 CTS 의 duration 으로 '''[[NAV]]''' (network allocation vector) 라는 timer 를 10 으로 설정한다. NAV 가 0 이 될 때까지 C 는 채널이 idle 인지 '''확인조차 하지 않는다'''.",
      { A: 4, B: 3, C: 2 }, V(7, "busy (CTS)", "CTS 수신", "CTS 전송", 10, "-", "CTS: 10"));
    push(8, "A 는 CTS 를 받고 '''SIFS''' 후 Data 를 보낼 준비. C 의 NAV 는 9.",
      { A: 4, B: 4, C: 3 }, V(8, "idle (SIFS)", "SIFS", "Data 대기", 9, "SIFS", "CTS: 10"));
    push(14, "A 가 '''Data''' 를 보낸다 (6 slot). 그동안 C 의 NAV 는 계속 줄어 3.",
      { A: 5, B: 4, C: 3 }, V(14, "busy (Data)", "Data 전송 → ACK 대기", "Data 수신", 3, "-", "CTS: 10"));
    push(15, "B 는 Data 를 받고 '''SIFS''' 후 ACK. NAV 2.",
      { A: 5, B: 4, C: 3 }, V(15, "idle (SIFS)", "ACK 대기", "SIFS", 2, "SIFS", "CTS: 10"));
    push(17, "B 가 '''ACK''' 를 보내고 A 가 받는다 → 전송 성공. '''ACK 가 끝나는 순간 C 의 NAV 도 0''' — duration 이 정확히 여기까지를 덮도록 계산되었기 때문.",
      { A: 6, B: 5, C: 3 }, V(17, "busy (ACK) → idle", "전송 성공", "ACK 전송", 0, "-", "-"));
    push(17, "NAV = 0 → C 는 이제 채널을 감지할 수 있고, 자기 프레임이 있으면 다시 DIFS 부터 시작한다.",
      { A: 6, B: 5, C: 4 }, V(17, "idle", "전송 성공", "완료", 0, "-", "-"),
      "슬롯 길이(DIFS 2, SIFS 1, RTS·CTS·ACK 2, Data 6)는 설명용 수치다. 슬라이드에는 순서와 PIFS < DIFS(p.22)만 있다. SIFS 가 가장 짧다는 것은 Forouzan 보충.");
    return { panels: panels, steps: steps };
  }

  function buildCollision() {
    var T = 24;
    var segs = [
      { row: "A", s: 2, e: 4, kind: "RTS", label: "RTS" },
      { row: "C", s: 2, e: 4, kind: "RTS", label: "RTS" },
      { row: "B", s: 2, e: 4, kind: "X", label: "충돌" },
      { row: "A", s: 9, e: 11, kind: "RTS", label: "RTS" },
      { row: "B", s: 12, e: 14, kind: "CTS", label: "CTS" },
      { row: "C", s: 12, e: 14, kind: "CTS", label: "CTS" },
      { row: "C", s: 14, e: 24, kind: "NAV", label: "NAV" },
      { row: "A", s: 15, e: 21, kind: "Data", label: "Data" },
      { row: "B", s: 22, e: 24, kind: "ACK", label: "ACK" }
    ];
    var marks = [
      { row: "A", s: 0, e: 2, label: "DIFS" },
      { row: "C", s: 0, e: 2, label: "DIFS" },
      { row: "A", s: 4, e: 7, label: "CTS 대기" },
      { row: "A", s: 7, e: 9, label: "DIFS" },
      { row: "C", s: 7, e: 9, label: "DIFS" },
      { row: "C", s: 9, e: 10, label: "R=1" },
      { row: "B", s: 11, e: 12, label: "SIFS" },
      { row: "A", s: 14, e: 15, label: "SIFS" },
      { row: "B", s: 21, e: 22, label: "SIFS" }
    ];
    var panels = [
      { id: "A", title: "A (송신)", lang: "txt", lines: [
        "채널 감지: DIFS 동안 idle 인지 확인",
        "RTS 전송 (duration 필드 포함)",
        "CTS 대기",
        "CTS 미수신 → 충돌로 가정, K = K + 1",
        "backoff: R ∈ {0, …, 2^K − 1} 고르고 R slot 대기",
        "DIFS + backoff 후 RTS 재전송",
        "CTS 수신 → SIFS 후 Data 전송",
        "ACK 수신 → 전송 성공"] },
      { id: "B", title: "B (수신)", lang: "txt", lines: [
        "대기 (수신 준비)",
        "RTS 두 개가 겹침 → 해독 불가, CTS 안 보냄",
        "RTS 수신 → SIFS 기다림",
        "CTS 전송 (duration 필드 포함)",
        "Data 수신 → SIFS 기다림",
        "ACK 전송"] },
      { id: "C", title: "C (제3자 · 경쟁자)", lang: "txt", lines: [
        "채널 감지: DIFS 동안 idle 인지 확인",
        "RTS 전송 (A 와 같은 순간)",
        "CTS 미수신 → 충돌로 가정 → backoff",
        "backoff 끝났지만 채널 busy → 대기",
        "CTS 수신 → duration 값으로 NAV 설정",
        "NAV 카운트다운 — 채널 확인 안 함",
        "NAV = 0 → 다시 DIFS 부터 시도"] }
    ];
    var steps = [];
    function push(t, desc, pc, v, note) {
      steps.push({ desc: desc, pc: pc, vars: v, note: note, svg: makeSvg(segs, marks, T, t, "RTS 충돌 → CTS 없음 → backoff 재시도") });
    }
    function V(t, ch, a, b, nav, ifs, dur, K, R) {
      return { t: t, channel: ch, A: a, B: b, C_NAV: nav, IFS: ifs, duration: dur, K: K, R: R };
    }
    push(0, "A 와 C 모두 B 에게 보낼 프레임이 있다. 둘 다 채널을 감지한다.",
      { A: 1, B: 1, C: 1 }, V(0, "idle", "채널 감지", "대기", "-", "-", "-", 0, "-"));
    push(2, "둘 다 '''DIFS''' 동안 idle 을 확인 — 같은 순간에 끝났다.",
      { A: 1, B: 1, C: 1 }, V(2, "idle", "DIFS 완료", "대기", "-", "DIFS", "-", 0, "-"));
    push(4, "A 와 C 가 '''동시에 RTS''' 를 보낸다 → B 에서 두 신호가 겹쳐 둘 다 깨진다. 핸드셰이크 구간의 충돌 (슬라이드 \"Many stations may try to send RTS frames at the same time\").",
      { A: 2, B: 2, C: 2 }, V(4, "collision (RTS+RTS)", "RTS 전송", "해독 불가", "-", "-", "RTS: 13", 0, "-"));
    push(7, "B 는 아무것도 못 알아들었으니 '''CTS 를 보내지 않는다'''. A 와 C 는 SIFS+CTS 시간만큼 기다려도 CTS 가 오지 않는다.",
      { A: 4, B: 2, C: 3 }, V(7, "idle", "CTS 미수신 → 충돌 가정", "대기", "-", "-", "-", 0, "-"),
      "CSMA/CA 에는 충돌을 '''감지'''하는 장치가 없다. 송신자는 \"CTS 를 못 받았다 = 충돌이 있었다\"고 '''가정'''할 뿐이다.");
    push(7, "CTS 미수신 → '''충돌로 가정''' → [[binary exponential backoff]]: K = 1 이므로 R ∈ {0, 1}. 이 시나리오에서는 A 가 R = 0, C 가 R = 1 을 뽑았다.",
      { A: 5, B: 1, C: 3 }, V(7, "idle", "backoff (R=0)", "대기", "-", "-", "-", 1, "A: 0, C: 1"),
      "R 값은 무작위다. 둘이 같은 R 을 뽑으면 또 충돌하고 K = 2 로 늘어난다.");
    push(9, "둘 다 다시 '''DIFS''' 를 기다린다. A 는 R = 0 이므로 DIFS 직후 바로 RTS 재전송 시작.",
      { A: 6, B: 1, C: 3 }, V(9, "idle → busy", "RTS 재전송 시작", "대기", "-", "DIFS", "RTS: 13", 1, "A: 0, C: 1"));
    push(10, "C 는 backoff 1 slot 이 끝났지만 채널이 이미 busy (A 의 RTS) → 보내지 않고 기다린다. 먼저 끝난 쪽이 채널을 잡는다. (이 시나리오의 C 는 A 의 RTS 를 해독하지 못하고 carrier 만 감지한다고 가정; RTS 를 해독했다면 p.15 대로 그 duration 으로 NAV 를 세팅한다)",
      { A: 6, B: 3, C: 4 }, V(10, "busy (RTS)", "RTS 전송 중", "RTS 수신 중", "-", "-", "RTS: 13", 1, "A: 0, C: 1"));
    push(12, "RTS 가 끝나고 B 는 '''SIFS''' 만 기다린다.",
      { A: 3, B: 3, C: 4 }, V(12, "idle (SIFS)", "CTS 대기", "SIFS", "-", "SIFS", "RTS: 13", 1, "A: 0, C: 1"));
    push(14, "이번에는 B 가 '''CTS''' (duration 10) 를 보낸다. A 는 CTS 수신 = 핸드셰이크 성공. C 는 CTS 를 듣고 [[NAV]] = 10 을 설정한다.",
      { A: 7, B: 4, C: 5 }, V(14, "busy (CTS)", "CTS 수신", "CTS 전송", 10, "-", "CTS: 10", 1, "A: 0, C: 1"));
    push(21, "A 가 SIFS 후 '''Data''' 를 보낸다. C 의 NAV 는 3 까지 줄었다.",
      { A: 7, B: 5, C: 6 }, V(21, "busy (Data)", "Data 전송", "Data 수신", 3, "SIFS", "CTS: 10", 1, "A: 0, C: 1"));
    push(24, "B 가 SIFS 후 '''ACK''' → A 의 '''재시도 성공'''. ACK 가 끝나는 순간 NAV = 0.",
      { A: 8, B: 6, C: 6 }, V(24, "busy (ACK) → idle", "전송 성공", "ACK 전송", 0, "-", "-", 1, "A: 0, C: 1"));
    push(24, "C 는 이제 다시 DIFS 부터 채널을 감지하고 자기 RTS 를 보낼 수 있다.",
      { A: 8, B: 6, C: 7 }, V(24, "idle", "전송 성공", "완료", 0, "-", "-", 1, "A: 0, C: 1"),
      "슬롯 길이와 R 값은 설명용으로 고정한 것이다. 슬라이드의 답: \"The sender assumes there has been a collision if it has not received a CTS frame\" → backoff 후 재시도.");
    return { panels: panels, steps: steps };
  }

  global.SIMS["csma_ca_handshake"] = {
    title: "CSMA/CA — DIFS · RTS · CTS · Data · ACK 와 NAV",
    desc: "L8 p.14–17, DCF. [[CSMA/CA]] 는 충돌을 감지하는 대신 '''피한다''': DIFS 동안 idle 확인 → [[RTS와 CTS]] 핸드셰이크 → 각 응답은 SIFS 뒤 → 제3 스테이션은 duration 으로 [[NAV]] 를 세팅하고 그동안 채널을 안 본다.",
    options: [
      { key: "scenario", label: "시나리오", values: [
        { value: "normal", label: "정상 (RTS/CTS 성공)" },
        { value: "collision", label: "RTS 충돌 → backoff 재시도" }] }
    ],
    build: function (opts) {
      var r = opts.scenario === "collision" ? buildCollision() : buildNormal();
      var vars = [
        { name: "t", label: "시각 (slot)", group: "채널" },
        { name: "channel", label: "채널 상태", group: "채널" },
        { name: "IFS", label: "현재 IFS", group: "채널" },
        { name: "duration", label: "duration 필드", group: "채널" },
        { name: "A", label: "A 단계", group: "스테이션" },
        { name: "B", label: "B 단계", group: "스테이션" },
        { name: "C_NAV", label: "C 의 NAV 남은 값", group: "스테이션" }
      ];
      if (opts.scenario === "collision") {
        vars.push({ name: "K", label: "K (충돌 횟수)", group: "backoff" });
        vars.push({ name: "R", label: "R (뽑은 값)", group: "backoff" });
      }
      return { panels: r.panels, vars: vars, steps: r.steps };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
