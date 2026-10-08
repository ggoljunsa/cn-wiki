# 컴네위키 (CN Wiki)

DGIST **CSE403 Computer Network** (Prof. Soobin Um, 교재 Forouzan *Data Communications and Networking with TCP/IP Protocol Suite* 6e) 중간고사 범위 — CH01 Introduction, CH02 Physical Layer (1)(2)(3), CH03 Data-Link Layer (1)(2), CH04 Local Area Networks (1)(2)(3) — 를 나무위키 스타일로 정리한 단일 페이지 위키.
계산 Example 이 나오는 곳마다 **한 단계씩 값이 바뀌는 시뮬레이터**가 붙어 있고, 핵심 메커니즘마다 **저절로 도는 움직이는 그림(SVG 애니메이션)**과 **실제 강의 슬라이드 캡처**가 들어 있으며, 모든 기호·용어는 사전 문서로 하이퍼링크된다.

**라이브**: https://ggoljunsa.github.io/cn-wiki/

## 범위

1. CH01 Introduction — 데이터 통신 4대 특성·5요소, 토폴로지, LAN/WAN, 프로토콜 계층화, TCP/IP 5계층, 캡슐화, 주소 체계
2. CH02 Signals — 사인파 3요소, time/frequency domain, composite signal, bandwidth, bit rate, baseband/broadband
3. CH02 Transmission — attenuation/distortion/noise, dB, SNR, **Nyquist bit rate vs Shannon capacity**, throughput, latency, bandwidth-delay product, jitter
4. CH02 Digital Transmission — line/block coding (4B/5B), **PCM** (sampling → quantization → encoding), PCM bandwidth, delta modulation
5. CH02 Analog Transmission · Multiplexing — ASK/FSK/PSK/QAM, baud vs bps, 변조 대역폭, FDM/TDM
6. CH03 Data-Link Control — node/link, DLC/MAC, framing (byte/bit stuffing), **Hamming distance**, parity, **CRC**, HDLC
7. CH03 Media Access Control — pure/slotted ALOHA (vulnerable time, throughput), CSMA (persistence), **CSMA/CD** (최소 프레임), controlled access
8. CH03 Link-Layer Addressing — MAC 주소, IP vs MAC 순서, unicast/multicast/broadcast, ARP
9. CH04 Ethernet — Ethernet 4세대(Standard/Fast/Gigabit/10G), **frame format**(64/1518), **주소 전송 순서**(LSB first), $T_{fr} \ge 2T_p$ 로 길이 1/10, full-duplex 스위치 (10/1 수업)
10. CH04 WiFi — IEEE 802.11: BSS/ESS, **DCF = CSMA/CA**(RTS/CTS·NAV·IFS, hidden/exposed station), PCF, 프레임 9필드, **주소 4 케이스**, physical layer 표 (10/6 수업 전 선제 작성)
11. CH04 Bluetooth — IEEE 802.15 PAN: piconet(1+7)/scatternet, **TDD-TDMA** 625 μs 슬롯(짝수 primary/홀수 secondary), **duplexing ≠ multiple access**, FHSS 1600 hops/s, GFSK (10/8 수업 전 선제 작성)

## 구조

```
.
├── index.html        # 생성물 (단일 HTML — CSS/JS/문서/시뮬레이터/애니메이션 전부 인라인)
├── images/           # 참조된 강의 슬라이드 캡처
├── build.py          # src/ → index.html (슬라이드 PNG 원본은 _slides/, git 제외)
├── shot.sh           # 애니메이션 검증용 headless Chrome 스크린샷 (./shot.sh <anim> <초>)
└── src/
    ├── CONTRACT.md   # 문법·문서 키·시뮬레이터/애니메이션 API 규약
    ├── head.html     # CSS + 레이아웃
    ├── renderer.js   # 위키 문법 렌더러
    ├── sims/         # _engine.js + 시뮬레이터 (순수 데이터 + build())
    ├── anims/        # _anim_engine.js + 움직이는 그림 (SVG+SMIL, [[anim:이름]])
    └── articles/     # 문서 (.wiki, 파일당 1문서)
```

## 빌드

```sh
python3 build.py        # index.html 재생성, 깨진 링크/누락 이미지 보고
node src/test_sims.js   # 시뮬레이터 자동 검사
node src/test_anims.js  # 움직이는 그림 자동 검사 (태그 균형·SMIL·타이밍)
node src/test_render.js index.html   # 전 문서 렌더 → 원시 마크업 잔존 검사
```

슬라이드 PNG 가 없으면 (새 clone) 강의자료 PDF 에서 다시 만든다: `pdftoppm -r 90 -png "../강의자료/CH01_Introduction.pdf" _slides/L1` (덱 번호 ↔ PDF 대응은 `src/CONTRACT.md` §1).
문서 편집은 `src/articles/*.wiki`, 문법은 `src/CONTRACT.md` 참고.
애니메이션 하나만 특정 시각에 멈춰 보려면 `index.html?anim=csma_cd_abort&animt=4`, 문서 안 전부를 멈추려면 `index.html?animt=4#문서키`.

## 출처

강의 슬라이드 이미지는 DGIST CSE403 (Prof. Soobin Um) 강의 자료의 캡처이며 교육 목적의 학습 정리용이다. 학습 목적 비상업적 사용. 저작권은 원저작자에게 있다.
