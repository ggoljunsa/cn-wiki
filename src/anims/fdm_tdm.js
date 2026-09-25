// ============================================================
// fdm_tdm — 왼쪽 FDM(주파수를 나눠 씀) / 오른쪽 TDM(시간을 나눠 씀)
// CONTRACT §7. 슬라이드 L4 p.47–52.
// 시간축(초): 0 두 방식 제목 → 1 FDM: 신호 3개가 f₁ f₂ f₃ 로 올라가 주파수축에 나란히 → 4 guard band
//   → 5.5 필터로 분리 → 7 TDM: 입력 1~4 가 슬롯을 1 2 3 4 순서로 돌아가며 채움 → 11 DEMUX 분배 → 14 끝
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["fdm_tdm"] = {
  title: "FDM vs TDM — 링크 하나를 주파수로 나눌까, 시간으로 나눌까",
  desc: "[[multiplexing]]: [[FDM]]은 신호마다 다른 반송파 f₁ f₂ f₃ 로 대역을 나눠 갖고([[guard band]]), [[TDM]]은 입력들이 시간 슬롯을 돌아가며 차지한다 ([[MUX와 DEMUX]])",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { a: "#1d65b3", b: "#2e9e4f", c: "#e09a40", d: "#8a5cc4", dev: "#3b2f4a", devL: "#efe9f6", hot: "#d6465f", muted: "#777", link: "#fbf3b0", linkS: "#b9a520" };
    function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + esc(s) + '</text>';
    }
    function show(a, b) {
      var k = [0], v = [a <= 0 ? 1 : 0];
      if (a > 0) { k.push(a / D, Math.min(1, (a + 0.1) / D)); v.push(0, 1); }
      if (b < D) { k.push(b / D, Math.min(1, (b + 0.1) / D)); v.push(1, 0); }
      if (k[k.length - 1] < 1) { k.push(1); v.push(v[v.length - 1]); }
      return '<animate attributeName="opacity" values="' + v.join(";") + '" keyTimes="' + k.map(function (x) { return +x.toFixed(4); }).join(";") + '" dur="' + D + 's" fill="freeze"/>';
    }
    function during(a, b, inner) { return '<g opacity="' + (a <= 0 ? 1 : 0) + '">' + inner + show(a, b) + '</g>'; }
    function kt(arr) { return arr.map(function (t) { return +(t / D).toFixed(4); }).join(";"); }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="FDM과 TDM 애니메이션">';
    s += '<defs><marker id="ft_arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';

    // 현재 쪽 강조 배경
    s += during(1, 7, '<rect x="6" y="44" width="370" height="286" rx="8" fill="#f3f5fa"/>');
    s += during(7, D, '<rect x="384" y="44" width="370" height="286" rx="8" fill="#f3f5fa"/>');
    s += txt(190, 62, "FDM — 주파수를 나눔 (아날로그)", 13, C.dev, ' font-weight="700"');
    s += txt(570, 62, "TDM — 시간을 나눔 (디지털)", 13, C.dev, ' font-weight="700"');
    s += '<line x1="380" y1="48" x2="380" y2="326" stroke="#e3e3e3"/>';

    // ================= FDM =================
    var FC = [C.a, C.b, C.c], ROWY = [108, 158, 208], SLOT = [205, 265, 325], AXY = 196, OUTY = 306;
    // 링크(주파수 대역) 배경 + 축
    s += '<rect x="172" y="122" width="196" height="' + (AXY - 122) + '" fill="' + C.link + '" stroke="' + C.linkS + '"/>';
    s += txt(270, 136, "1 link, 3 channels", 11, "#7a6a10", ' font-weight="700"');
    s += '<line x1="172" y1="' + AXY + '" x2="372" y2="' + AXY + '" stroke="#555" stroke-width="1.5" marker-end="url(#ft_arr)"/>';
    s += txt(372, AXY + 28, "frequency", 11, C.muted, ' text-anchor="end"');
    SLOT.forEach(function (x, i) { s += txt(x, AXY + 14, "f" + "₁₂₃".charAt(i), 12, FC[i], ' font-weight="700"'); });
    // 변조기
    ROWY.forEach(function (y, i) {
      s += txt(26, y - 4, String(i + 1), 12, FC[i], ' font-weight="700"');
      s += '<rect x="86" y="' + (y - 34) + '" width="44" height="22" rx="4" fill="' + C.devL + '" stroke="' + C.dev + '"/>' + txt(108, y - 18, "× f" + "₁₂₃".charAt(i), 11, C.dev, ' font-weight="700"');
    });
    s += txt(108, 212, "Modulator", 11, C.muted);
    // 신호 스펙트럼 혹: 입력 → 자기 슬롯 → (필터 통과) → 출력
    var hump = "M-24 0 C-20 -30 -10 -34 0 -34 C10 -34 20 -30 24 0 Z";
    ROWY.forEach(function (y, i) {
      var tUp0 = 1.3 + i * 0.5, tUp1 = tUp0 + 1.2, tDn0 = 5.8 + i * 0.2, tDn1 = tDn0 + 0.8;
      s += '<g transform="translate(50 ' + y + ')"><path d="' + hump + '" fill="' + FC[i] + '" fill-opacity="0.55" stroke="' + FC[i] + '" stroke-width="2"/>' +
        '<animateTransform attributeName="transform" type="translate" values="50 ' + y + ';50 ' + y + ';' + SLOT[i] + ' ' + AXY + ';' + SLOT[i] + ' ' + AXY + ';' + SLOT[i] + ' ' + OUTY + ';' + SLOT[i] + ' ' + OUTY +
        '" keyTimes="' + kt([0, tUp0, tUp1, tDn0, tDn1, D]) + '" dur="' + D + 's" fill="freeze"/></g>';
    });
    // guard band
    s += during(4, D, '<rect x="229" y="154" width="12" height="' + (AXY - 154) + '" fill="' + C.hot + '" fill-opacity="0.25"/><rect x="289" y="154" width="12" height="' + (AXY - 154) + '" fill="' + C.hot + '" fill-opacity="0.25"/>' +
      txt(265, 150, "guard band", 11, C.hot, ' font-weight="700"'));
    // 필터 (수신 측 DEMUX)
    s += during(5.5, D, SLOT.map(function (x, i) {
      return '<rect x="' + (x - 27) + '" y="228" width="54" height="22" rx="4" fill="#fff" stroke="' + FC[i] + '" stroke-width="2"/>' + txt(x, 243, "Filter", 11, FC[i], ' font-weight="700"');
    }).join("") + txt(146, 244, "DEMUX →", 11, C.muted));
    s += during(6.8, D, SLOT.map(function (x, i) { return txt(x, OUTY + 16, "신호 " + (i + 1), 11, FC[i], ' font-weight="700"'); }).join(""));

    // ================= TDM =================
    var TC = [C.a, C.b, C.c, C.d], TY = [96, 136, 176, 216], LY = 156;
    var MX = 440, DX = 700;          // MUX 오른쪽 끝, DEMUX 왼쪽 끝
    s += '<polygon points="' + (MX - 26) + ',86 ' + MX + ',106 ' + MX + ',206 ' + (MX - 26) + ',226" fill="' + C.dev + '"/>' + "MUX".split("").map(function (ch, j) { return txt(MX - 12, 144 + j * 16, ch, 12, "#fff", ' font-weight="700"'); }).join("");
    s += '<polygon points="' + DX + ',106 ' + (DX + 26) + ',86 ' + (DX + 26) + ',226 ' + DX + ',206" fill="' + C.dev + '"/>' + "DEMUX".split("").map(function (ch, j) { return txt(DX + 12, 128 + j * 16, ch, 12, "#fff", ' font-weight="700"'); }).join("");
    TY.forEach(function (y, i) {
      s += '<line x1="398" y1="' + y + '" x2="' + (MX - 26) + '" y2="' + y + '" stroke="#555" stroke-width="1.5"/>' + txt(392, y + 4, String(i + 1), 12, TC[i], ' font-weight="700" text-anchor="end"');
      s += '<line x1="' + (DX + 26) + '" y1="' + y + '" x2="748" y2="' + y + '" stroke="#555" stroke-width="1.5"/>' + txt(750, y - 4, String(i + 1), 12, TC[i], ' font-weight="700" text-anchor="end"');
    });
    s += '<rect x="' + MX + '" y="' + (LY - 16) + '" width="' + (DX - MX) + '" height="32" fill="' + C.link + '" stroke="' + C.linkS + '"/>';
    s += txt((MX + DX) / 2, LY - 24, "Data flow →", 11, C.hot, ' font-weight="700"');
    // 슬롯 12개 (3 frame × 4) — 1 → 2 → 3 → 4 순서로 출발, 링크 위에서는 오른쪽이 먼저 나간 것
    var T0 = 7.2, GAP = 0.36, TRAVEL = 2.2, SW = 32;
    for (var k = 0; k < 12; k++) {
      var src = k % 4, tk = T0 + k * GAP;
      // 입력 쪽에서 차례가 된 줄 강조
      s += during(tk, tk + GAP, '<circle cx="' + (MX - 34) + '" cy="' + TY[src] + '" r="6" fill="' + TC[src] + '"/>');
      // 링크 위 슬롯
      s += '<g opacity="0"><rect x="' + (-SW / 2) + '" y="-13" width="' + SW + '" height="26" fill="' + TC[src] + '" fill-opacity="0.85" stroke="#fff" stroke-width="1.5"/>' +
        txt(0, 5, String(src + 1), 13, "#fff", ' font-weight="700"') +
        '<animateMotion begin="' + tk.toFixed(2) + 's" dur="' + TRAVEL + 's" fill="freeze" path="M' + (MX + SW / 2) + ',' + LY + ' L' + (DX - SW / 2) + ',' + LY + '"/>' +
        show(tk, tk + TRAVEL) + '</g>';
      // DEMUX → 출력 줄 i
      var ta = tk + TRAVEL;
      s += '<g opacity="0"><rect x="-8" y="-6" width="16" height="12" rx="2" fill="' + TC[src] + '"/>' +
        '<animateMotion begin="' + ta.toFixed(2) + 's" dur="0.4s" fill="freeze" path="M' + (DX + 26) + ',' + TY[src] + ' L742,' + TY[src] + '"/>' +
        show(ta, ta + 0.4) + '</g>';
    }
    // frame 표시
    s += during(9.8, D, '<line x1="' + (DX - 4 * SW - 34) + '" y1="' + (LY + 24) + '" x2="' + (DX - 34) + '" y2="' + (LY + 24) + '" stroke="' + C.dev + '" stroke-width="2" marker-start="url(#ft_arr)" marker-end="url(#ft_arr)"/>' +
      txt(DX - 2 * SW - 34, LY + 40, "1 frame = 슬롯 4개 (입력마다 1개)", 11, C.dev, ' font-weight="700"'));
    s += during(7.2, D, txt(570, 262, "슬롯 순서: 1 → 2 → 3 → 4 → 1 → …", 12, C.dev, ' font-weight="700"'));
    s += during(11, D, txt(570, 284, "DEMUX 는 슬롯 순서대로 출력 1~4 에 나눠 준다", 11, C.muted));

    // ---- 단계 자막 ----
    var caps = [
      [0, 1, "multiplexing: 링크 하나(1 link)를 여러 신호가 n 개 channel 로 나눠 쓰는 방법 2가지"],
      [1, 4, "FDM: 각 신호를 서로 다른 반송파 f₁ f₂ f₃ 로 변조해 주파수축에 나란히 놓는다"],
      [4, 5.5, "FDM: 채널 사이에는 쓰지 않는 guard band 를 두어 간섭을 막는다"],
      [5.5, 7, "FDM 수신: 필터(filter)로 대역별로 걸러 → 복조 → 원래 신호 1·2·3"],
      [7, 11, "TDM: 입력 1~4 가 시간 슬롯을 돌아가며 차지 — 대역폭 대신 시간(time)을 나눠 씀"],
      [11, D, "TDM 수신: DEMUX 가 슬롯 순서대로 각 출력 회선에 분배"]
    ];
    caps.forEach(function (c) { s += during(c[0], c[1], txt(380, 28, c[2], 14, "#222", ' font-weight="700"')); });

    s += txt(380, 350, "FDM = 대역폭의 일부를 나눠 가짐 (아날로그, guard band) · TDM = 시간을 나눠 가짐 (디지털, 슬롯) — 둘 다 1 link, n channels", 11, C.muted);
    s += '</svg>';
    return s;
  }
};
