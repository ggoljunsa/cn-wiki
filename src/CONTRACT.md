# 컴네위키 제작 계약 (모든 에이전트 필독)

목표: DGIST CSE403 Computer Network(Prof. Soobin Um, 교재 Forouzan *Data Communications and Networking with TCP/IP Protocol Suite* 6e) 중간고사 범위(CH01 Introduction, CH02 Physical Layer (1)(2)(3), CH03 Data-Link Layer (1)(2))를 **나무위키 스타일 단일 HTML 위키**로 만든다.
독자는 수강생 본인(3학년). 해설본이 "그림이 없고 변수를 까먹어서" 이해가 안 됐다는 피드백이 출발점 →
**① 그림/캡처/시뮬레이터 많이, ② 비유 많이, ③ 모든 변수·용어·공식 기호는 [[링크]]로 사전 문서에 연결.**

교수는 영어로 강의한다. 문서는 '''한국어 산문 + 영어 기술 용어 그대로'''("throughput", "SNR", "Nyquist bit rate", "vulnerable time", "byte stuffing"). 교수가 영어로 쓴 용어를 번역하지 말 것. 교수의 입버릇: "'''the name itself is very important'''" — 용어의 이름(정의)에서 개념을 끌어내는 설명을 사전 문서마다 넣는다.

## 1. 파일 배치
```
위키/
├── build.py                 # src/* → index.html (단일 파일), 참조 이미지 복사, 깨진 링크 검사
├── index.html               # 생성물 (직접 편집 금지)
├── images/                  # build.py 가 _slides/ 에서 참조된 것만 복사
├── _slides/                 # 슬라이드 PNG 원본 (git 제외) — L{덱}-{페이지}.png
├── _text/                   # 슬라이드 텍스트 (pdftotext -layout, git 제외)
└── src/
    ├── head.html            # <head> + CSS + 레이아웃
    ├── renderer.js          # 위키 문법 → HTML, 네비/검색/목차
    ├── sims/_engine.js      # SimEngine (공용 스텝 실행기)
    ├── sims/*.js            # 시뮬레이터 각 1파일, SIMS["이름"] = {...}
    ├── anims/_anim_engine.js # AnimEngine (움직이는 그림 공용 재생기)
    ├── anims/*.js           # 움직이는 그림 각 1파일, ANIMS["이름"] = {...} (§7)
    └── articles/*.wiki      # 문서 각 1파일
```

### 슬라이드 원본 (덱 번호 ↔ PDF)
`_slides/L{덱}-{페이지}.png` (L1~L6 는 2자리 0 패딩 `L1-03.png`, `L2-50.png`; 한 자리 페이지는 패딩 없는 복사본 `L1-3.png` 도 있어 둘 다 동작. L0 은 패딩 없음). 페이지 번호 = PDF 페이지 = 슬라이드 인쇄 번호 = 해설본 `p.N`.
텍스트는 `_text/{PDF 이름}.txt` (페이지 구분 `\f`).

| 덱 | PDF | 페이지 | 새 내용 | 해설본 |
|---|---|---|---|---|
| L0 | CH00_Course Introduction | 9 | 교수·교재·성적(출석 10 / 과제 10 / 중간 40 / 기말 40) | — |
| L1 | CH01_Introduction | 40 | 전부 | `../정리본/CH01_정리.md` |
| L2 | CH02_Physical Layer (1) | 69 | p.13– (p.2–12 는 CH01 복습) | `../정리본/CH02_정리.md` |
| L3 | CH02_Physical Layer (2) | 65 | p.42– (p.2–41 은 L2 복습) | `../정리본/CH02(2)_정리.md` |
| L4 | CH02_Physical Layer (3) | 52 | p.34– (p.2–33 은 복습) | `../정리본/CH02(3)_정리.md` |
| L5 | CH03_Data Link Layer (1) | 56 | p.7– (p.2–6 복습) | `../정리본/CH03_정리.md` |
| L6 | CH03_Data Link Layer (2) | 63 | 전부 (recap 없음) | `../정리본/CH03(2)_정리.md` |

복습 슬라이드는 내용이 같으면 **원 덱의 페이지를 캡처**한다(예: attenuation 그림은 L2-41). 다만 복습 덱에서 그림이 더 좋으면 그쪽을 써도 된다.

녹음본: `../녹음본/0901_03_컴네.txt`(L2 수업), `../녹음본/0910_05_컴네.txt`(L3 후반~L4 수업). 영어 ASR이라 기술 용어가 심하게 깨져 있다("the dog has the base of 1" = "the log has the base of 10" — dB 의 log). **슬라이드가 용어의 권위, 녹음본은 강조·공지의 권위.** 교수가 "remember", "very important", "exam" 이라고 한 대목은 `{exam}` 박스로.

기타 자료: `../../노트북lm_문제푼거/0920_오답.md`(NotebookLM 객관식 오답 8문항 — 사용자 약점), `../내가만드는문제/0920_재시험.md`(그 주관식 재시험), `../내가만드는문제/0920.md`. 족보·실제 시험지는 **아직 없다**.

## 2. 문서 파일 형식 (`src/articles/{정렬번호}_{key}.wiki`)
```
key: Hamming distance
title: Hamming Distance (해밍 거리)
category: 6강 DLC, 용어
---
(본문. 아래 문법)
```
- `key` = 다른 문서가 `[[key]]` 로 참조하는 문자열. **반드시 §5 의 정식 키 목록을 쓸 것** (새 키가 필요하면 목록 형식대로 §5 에 추가하고 파일도 만들 것).
- `category` 는 쉼표 구분. 첫 항목은 강의(`N강 ...`) 또는 `안내`/`시험`/`용어`. 첫 항목이 사이드바 그룹이 된다 — **아래 §5 의 그룹명을 글자 그대로** 쓸 것.
- 파일명 정렬번호: `00` 안내, `10` 1강, `20` 2강, `30` 3강, `40` 4강, `50` 5강, `60` 6강, `70` 7강, `80` 8강, `E0` 시험, `Z0` 기타 용어. 정렬번호 뒤 두 번째 자리는 `0-9, A-Z` 로 이어간다(`10_`, `11_`, … `1A_`, `1B_`). 파일명에 `/` 는 `_` 로(키는 헤더에 원래대로).

## 3. 위키 문법 (renderer.js 가 지원)
| 문법 | 결과 |
|---|---|
| `== 제목 ==`, `=== 소제목 ===`, `==== 소소제목 ====` | h2/h3/h4 (자동 목차) |
| `'''굵게'''`, `''기울임''`, `` `code` `` | 인라인 |
| `* 항목` / `# 번호항목` | ul / ol (한 줄 = 한 항목, 중첩 없음) |
| `[[키]]`, `[[키|표시문구]]` | 위키 링크 (없는 키는 회색 stub 표시 → 반드시 있는 키만) |
| `[[img:L2-50.png|캡션|small/medium/large]]` | 슬라이드 캡처 (한 줄에 단독으로) |
| `[[sim:crc_division]]` | 시뮬레이터 삽입 (한 줄에 단독으로) |
| `[[anim:csma_cd_abort|캡션]]` | 움직이는 그림 삽입 (한 줄에 단독으로, 캡션 선택). §7 |
| `{info}…{/info}` `{warn}…{/warn}` `{tip}…{/tip}` `{joke}…{/joke}` | 참고/주의/팁/여담 박스 |
| `{analogy}…{/analogy}` | 🎭 비유 박스 (문서마다 1개 이상) |
| `{def}…{/def}` | 📖 정의 박스 (정의→용어 문제 대비, 슬라이드 원문 영어 정의 + 한국어) |
| `{quiz}…{/quiz}` | ❓ 예상문제 박스 |
| `{answer}…{/answer}` | 접힌 정답 (클릭해서 펼침) — quiz 바로 뒤에 |
| `{exam}…{/exam}` | 🎯 출제 포인트 박스 (교수가 녹음본에서 강조 / NotebookLM 퀴즈에서 틀린 것 / 해설본 ⭐⭐⭐) |
| 박스는 여러 줄 가능 (`{info}` 로 시작해 `{/info}` 로 끝나는 줄까지) | |
| `<pre class="txt">` … `</pre>` | 코드/계산 블록 (class: c / asm / ascii / sh / txt). ascii 는 밝은 배경 (ASCII 그림용) |
| ↑ 중 `txt` / `ascii` 블록 안에서만 | `'''굵게'''` 와 `[[키]]` / `[[키\|표시]]` 가 추가로 처리된다. `c` / `asm` / `sh` / 클래스 없는 `<pre>` 는 완전히 raw |
| `{|` / `! 헤더 || 헤더` / `|-` / `| 셀 || 셀` / `|}` | 표 |
| `$…$` | KaTeX 인라인 수식 — **이 과목은 수식이 많다. 공식은 반드시 `$…$` 로** (`$S = Ge^{-2G}$`, `$d_{min} = 2t+1$`) |
| `----` | 수평선 |

주의: 코드 블록 안에서는 문법 처리 안 함. 표 셀 안에서는 인라인 문법만. 표 셀 안에서 `|` 가 필요하면 `\|`. KaTeX 안에서 `|` 도 표 셀 밖에서만 쓸 것.
계산 과정은 `<pre class="txt">` 블록에 한 줄에 한 단계씩 쓴다(손으로 푸는 순서 그대로).

## 4. 문서 작성 규칙
1. **한국어 산문 + 영어 기술용어 그대로.** 교수가 영어로 쓴 용어(throughput, attenuation, vulnerable time, byte stuffing, dataword, codeword …)를 번역하지 말 것. 한국어 병기는 첫 등장 시 괄호로만.
2. 나무위키 톤: 개요 → 본문(슬라이드 순서) → 관련 문서. 잡담/여담(`{joke}`) 허용, 그러나 사실은 슬라이드·Forouzan 기준으로 정확히. **슬라이드 수치(Example 번호, 값)를 그대로** 쓴다.
3. **슬라이드에 계산 Example 이 있으면 풀이를 단계별로 재현**하고, 단계가 여럿이면 `[[sim:]]` 을 바로 아래에 둔다. 공식은 `$…$`, 각 기호는 첫 등장 시 [[링크]] (`[[bandwidth|B]]`, `[[signal level|L]]`, `[[T_fr]]`, `[[offered load G|G]]`).
4. **모든 용어/기호/프로토콜/장비는 첫 등장 시 [[링크]]**: `[[SNR]]`, `[[Nyquist bit rate]]`, `[[codeword]]`, `[[syndrome]]`, `[[라우터]]`.
5. 문서마다 최소 `{analogy}` 1개, 시각자료([[img:]] 또는 [[sim:]] 또는 [[anim:]] 또는 ascii 그림 또는 표) 1개 이상. **메인 문서는 실제 슬라이드 캡처 3장 이상 + 움직이는 그림 1개 이상 + 시뮬레이터**. 용어 문서도 관련 슬라이드에 그림·표·수식이 있으면 캡처 1장을 넣는다.
6. 캡처 고르는 기준: 그림/표/파형/수식이 있는 슬라이드. **`_slides/L*.png` 를 Read 로 직접 보고 고른다.** 글자만 있는 슬라이드(섹션 표지, 정의 한 줄)는 캡처 대신 본문으로.
7. 각 메인 문서 끝에 `== 시험 대비 핵심 요약 ==` 번호 목록, `== 관련 문서 ==` 링크 목록. 수식이 많은 메인 문서는 `== 공식 모음 ==` 표도 추가.
8. 용어 사전 문서는 짧아도 됨 (정의 박스 + "이름에서 개념 끌어내기" + 어디서 쓰이는지 + 관련 링크 2~3개). 그러나 stub 이 아니라 실제 내용. 사전 문서의 `{def}` 는 **슬라이드 영어 원문 정의**를 먼저, 그 아래 한국어.
9. 해설본(`../정리본/*.md`)의 ⭐ 표시와 "시험 대비 핵심 요약"을 재활용할 것. ⭐⭐⭐ 항목은 `{exam}` 박스로.
10. `../../노트북lm_문제푼거/0920_오답.md` 에서 사용자가 틀린 8문항(4대 특성에서 Jitter 누락·Encryption 오답 / Star vs Bus / drop line·tap / 중간 노드의 계층 / PDU 이름 / IP 는 network layer / TCP 가 connection-oriented / 배터리는 0 Hz / 정현파 3요소에 bandwidth 없음)은 해당 문서에 `{warn}` 박스로 "여기서 틀렸다"를 명시한다.
11. 사전 문서끼리 서로 링크: 예 `[[Nyquist bit rate]]` ↔ `[[Shannon capacity]]` ↔ `[[signal level]]`, `[[pure ALOHA]]` ↔ `[[slotted ALOHA]]` ↔ `[[vulnerable time]]`.
12. **문서 하나를 완성할 때마다 즉시 Write.** 여러 개를 모아 두지 말 것.

## 5. 정식 문서 키 목록 (링크는 이 키로만)
그룹명(= category 첫 항목)을 괄호 안에 적었다. 정렬번호 접두는 `[ ]`.

### 안내 (`안내`) [00_–06_]
main(대문) · 읽는 순서 · 시험 정보 · 자주 틀리는 함정 모음 · 0920 오답 복기 · 계산 문제 모음 · 공식 모음

### 1강 CH01 Introduction (`1강 Introduction`) [10_–]
**메인**: CH01 Introduction
**사전**: 데이터 통신 · 데이터 통신 4대 특성 · 데이터 통신 5요소 · 프로토콜 · simplex · half-duplex · full-duplex · point-to-point · multipoint · mesh 토폴로지 · star 토폴로지 · bus 토폴로지 · ring 토폴로지 · LAN · WAN · 인터넷 구조 · 프로토콜 계층화 · 논리적 연결 · TCP/IP 프로토콜 스위트 · OSI 7계층 · physical layer · data-link layer · network layer · transport layer · application layer · 캡슐화 · PDU · 주소 체계 · 스위치 · 라우터 · 허브 · IP · TCP · UDP · 포트 번호 · end-to-end와 hop-to-hop

### 2강 CH02 Signals (`2강 Signals`) [20_–] — L2 p.13–38
**메인**: CH02 Signals
**사전**: data와 signal · 아날로그와 디지털 · 주기 신호와 비주기 신호 · 사인파 · peak amplitude · 주파수 · 주기 · phase · time domain과 frequency domain · composite signal · Fourier analysis · bandwidth · 디지털 신호 · signal level · bit rate · bit length · baseband 전송 · broadband 전송 · low-pass 채널 · bandpass 채널

### 3강 CH02 Transmission (`3강 Transmission`) [30_–] — L2 p.39–69
**메인**: CH02 Transmission
**사전**: signal impairment · attenuation · 데시벨 · amplifier · distortion · noise · SNR · data rate limits · Nyquist bit rate · Shannon capacity · AWGN · throughput · latency · propagation time · transmission time · bandwidth-delay product · jitter · Claude Shannon · Harry Nyquist

### 4강 CH02 Digital Transmission (`4강 Digital Transmission`) [40_–] — L3 p.42–65
**메인**: CH02 Digital Transmission
**사전**: digital-to-digital conversion · line coding · block coding · 4B/5B · NRZ-I · analog-to-digital conversion · PCM · sampling · sampling rate · Nyquist sampling theorem · PAM · oversampling과 undersampling · quantization · quantization error · encoding · PCM decoder · PCM bandwidth · delta modulation · SNR_dB와 n_b

### 5강 CH02 Analog Transmission & Multiplexing (`5강 Analog Transmission`) [50_–] — L4 p.34–52
**메인**: CH02 Analog Transmission · CH02 Multiplexing
**사전**: digital-to-analog conversion · carrier · modulation · ASK · FSK · PSK · QAM · baud · signal rate와 bit rate · roll-off factor · unipolar NRZ와 polar NRZ · VCO · 변조 대역폭 · multiplexing · FDM · TDM · guard band · MUX와 DEMUX

### 6강 CH03 Data-Link Control (`6강 DLC`) [60_–] — L5
**메인**: CH03 Data-Link Control
**사전**: node와 link · data-link layer 서비스 · point-to-point 링크와 broadcast 링크 · DLC · MAC sublayer · framing · fixed-size framing · variable-size framing · character-oriented framing · byte stuffing · bit-oriented framing · bit stuffing · flag · ESC · single-bit error · burst error · redundancy · block code · dataword · codeword · Hamming distance · minimum Hamming distance · linear block code · parity check code · syndrome · cyclic code · CRC · divisor · polynomial representation · CRC 표준 다항식 · checksum · HDLC · NRM · ABM · HDLC 프레임 · PPP · piggybacking · FCS

### 7강 CH03 Media Access Control (`7강 MAC`) [70_–] — L6 p.2–54
**메인**: CH03 Media Access Control
**사전**: multiple access protocols · random access · collision · pure ALOHA · slotted ALOHA · ALOHA 절차 · binary exponential backoff · T_p · T_fr · vulnerable time · offered load G · ALOHA throughput · CSMA · space-time model · persistence method · 1-persistent · nonpersistent · p-persistent · CSMA/CD · 최소 프레임 크기 · jamming signal · energy level · controlled access · reservation · polling · token passing · channelization

### 8강 CH03 Link-Layer Addressing (`8강 Addressing`) [80_–] — L6 p.55–63
**메인**: CH03 Link-Layer Addressing
**사전**: MAC 주소 · IP 주소와 MAC 주소 · unicast · multicast · broadcast 주소 · ARP

### 기타 용어 (`용어`) [Z0_]
Forouzan · 교수 소개 · bps와 Hz · log₂ 계산법 · XOR · modular arithmetic

(총 약 200 문서. 사전 문서가 메인의 10배 이상인 것이 정상이다.)

## 6. 시뮬레이터 (src/sims/*.js)
### 이름 (문서에서 `[[sim:이름]]`)
| 이름 | 내용 (옵션) | 기대 최종값 | 문서 |
|---|---|---|---|
| nyquist_shannon | Ex 2.6 / 2.8 / 2.9 계산을 손으로 푸는 순서대로 (옵션: example = 2.6 / 2.8 / 2.9). 패널은 공식 줄, vars 는 B, L, SNR, log₂ 항, 결과 | 2.6: L≈98.7 (6~7 bits/symbol) · 2.8: 34,860 bps · 2.9: C=6 Mbps → 4 Mbps 선택 → L=4 | Nyquist bit rate, Shannon capacity, CH02 Transmission, 계산 문제 모음 |
| db_calc | dB = 10 log₁₀(P₂/P₁) 계산 (옵션: 경우 = Ex 2.5 절반 / 3점 경로 −3 → +7 → −3 dB 합산 / SNR 3162 → dB) | Ex 2.5: −3 dB · 경로 합: +1 dB · SNR: 35 dB | 데시벨, attenuation, SNR |
| bdp_pipe | bandwidth-delay product: 1초 tick 마다 링크 위 비트 수 (옵션: 1 bps×5 s / 5 bps×5 s) svg 파이프 그림 | 5 bits / 25 bits | bandwidth-delay product, CH02 Transmission |
| pcm_encoder | L3 p.55 표 그대로: 샘플별 PAM 값 → 양자화 값 → 오차 → 코드 → 비트 (옵션: L = 8 / 4) | p.55 의 −1.22→−1.50→−0.28→2→010, 3.24→3.50→+0.26→7→111 등 | PCM, quantization, encoding, CH02 Digital Transmission |
| encapsulation | L1 p.38: message 가 호스트에서 내려가며 헤더 4·3·2 가 붙고, 라우터에서 2 만 벗겨 다시 붙이고, 수신 호스트에서 벗겨지는 과정 (옵션: 경로 = host→router→host / host→switch→host) | 각 계층의 PDU 이름과 헤더 스택 | 캡슐화, PDU, CH01 Introduction |
| block_4b5b | 4B/5B 인코딩: 4비트 그룹씩 표에서 찾아 5비트로 (옵션: 입력 = 0000 0001 / 0000 0000 0000) — NRZ-I 의 "0 연속" 문제가 사라짐을 표시 | p.47 표 값 그대로 (0000→11110, 0001→01001) | 4B/5B, block coding |
| fsk_bandwidth | L4 Example 5: B=100 kHz(200–300), d=1 → 중심 250 kHz, 2Δf=50 kHz → S, N (옵션: 2Δf = 50 / 20 kHz) | S = 25 kbaud, N = 25 kbps | FSK, 변조 대역폭, CH02 Analog Transmission |
| delta_modulation | L3 p.65 그림의 계단 추적: 매 T 마다 곡선과 비교 → 위면 1(+d), 아래면 0(−d) | 비트열 0 1 1 1 1 1 1 0 0 0 0 0 0 1 1 | delta modulation |
| byte_stuffing | L5 p.18: 데이터 문자열을 한 바이트씩 읽어 Flag/ESC 앞에 ESC 삽입 (옵션: 송신 stuffing / 수신 unstuffing) | "Two extra bytes" | byte stuffing, character-oriented framing |
| bit_stuffing | L5 p.20: 0001111111001111101000 (22 bits) 을 한 비트씩, 연속 1 카운터, 5 개 뒤 0 삽입 (옵션: stuffing / unstuffing) | "Two extra bits" | bit stuffing, bit-oriented framing |
| hamming_distance | Ex 3.2 XOR 로 d 계산 → Ex 3.3 코드표에서 모든 쌍의 d → d_min (옵션: 코드표 = Ex 3.1 C(3,2) / parity C(5,4) 일부) | d(000,011)=2, d(10101,11110)=3, d_min=2 | Hamming distance, minimum Hamming distance |
| parity_check | Ex 3.7 다섯 경우 (옵션: case 1~5): 송신 1011→10111, 수신 비트, syndrome 계산, accept/discard | case 4 (0011 0) syndrome 0 → 잘못 accept | parity check code, syndrome |
| crc_division | L5 p.46–47: augmented dataword 1001000 ÷ 1011 XOR 나눗셈 한 행씩 (옵션: encoder / decoder 오류 없음 1001110 / decoder 오류 1000110). 최상위 비트 0 이면 0000 사용 | remainder 110 / syndrome 000 accept / syndrome 011 discard | CRC, divisor, syndrome, CH03 Data-Link Control |
| aloha_backoff | L6 p.12 흐름도 + Ex 3.8: K, R 범위 0~2^K−1, T_B = R×T_p (옵션: 시드 고정 시나리오 = 2회 충돌 후 성공 / K_max 초과 abort) | Ex 3.8: T_p=2 ms, K=2 → T_B∈{0,2,4,6} ms | ALOHA 절차, binary exponential backoff, pure ALOHA |
| aloha_throughput | Ex 3.11: frames/s → G → S=Ge^{-G} → 생존 프레임 (옵션: a 1000 / b 500 / c 250, 그리고 pure vs slotted) | 368 / 151 / 49 | ALOHA throughput, slotted ALOHA, 계산 문제 모음 |
| csma_cd_minframe | Ex 3.12: T_p=25.6 μs → 2T_p=51.2 μs → ×10 Mbps → 512 bits = 64 bytes (옵션: 10 Mbps / 100 Mbps) svg 로 왕복 | 512 bits = 64 bytes | 최소 프레임 크기, CSMA/CD, 계산 문제 모음 |

### 엔진 API (`src/sims/_engine.js`, 모든 sim 파일이 따를 것 — 참조 구현 `src/sims/_reference_ticket_lock.js.txt`)
```js
window.SIMS = window.SIMS || {};
SIMS["crc_division"] = {
  title: "CRC 나눗셈 — 1001000 ÷ 1011",
  desc: "한 줄 설명 (무엇을 보여주는지)",
  options: [ { key:"mode", label:"모드", values:[{value:"enc",label:"Encoder"},{value:"dec_ok",label:"Decoder (오류 없음)"}] } ],
  build(opts) {           // opts = {mode:"enc"} (기본값 = 각 option 의 첫 value)
    return {
      panels: [ { id:"P", title:"절차", lang:"txt", lines:["1. dataword 뒤에 000 붙이기","2. 최상위 비트가 1이면 1011 로 XOR","3. …"] }, ... ],
      vars:   [ { name:"dividend", group:"나눗셈" }, { name:"remainder", group:"나눗셈" }, ... ],   // 표시 순서
      steps:  [
        { desc:"설명 (인라인 위키문법 가능: '''굵게''', [[링크]])",
          pc: { P: 1 },                    // 패널별 현재 줄 (1-based, null=대기)
          vars: { dividend:"1001000", remainder:"?", ... },   // 전체 스냅샷 (엔진이 이전 step 과 diff 해서 바뀐 값 강조)
          status: { P:"running" },         // 선택. 패널 헤더에 배지
          note: "warn 텍스트 (선택, 빨간 박스)",
          svg: "<svg …>" 또는 function(step, i) → string (선택. 커스텀 그림)
        }, ...
      ]
    };
  }
};
```
엔진 동작 (`SimEngine.mount(containerEl, simName)`):
- 헤더(제목·설명) → 옵션 select 들(바꾸면 build 재실행, step 0) → 컨트롤(⏮ ◀ ▶ ⏭, ▶ 자동재생(속도), 슬라이더, "n / N") → 코드 패널 가로 나열(현재 줄 하이라이트, status 배지) → 변수표(그룹별, 바뀐 값 노란 배경 + 이전값 표시) → 설명 박스 → svg 영역.
- 이 과목은 코드가 아니라 **계산·절차**가 패널이다: 패널 lines 에 "손으로 푸는 순서"나 "흐름도 단계"를 한 줄씩 적고, pc 로 현재 단계를 가리킨다. 비트열 처리(stuffing, CRC)는 panel lines 에 비트열을 놓고 svg 로 현재 위치를 강조.
- 모바일에서 세로 배치. 키보드 ← → 지원. 각 sim 은 순수 데이터 + build 만 갖는다 (DOM 접근 금지).
- 자동 테스트: `src/test_sims.js` (node) 가 모든 sims 를 로드해 각 옵션 조합으로 build() 를 실행, steps.length>0 이고 pc 가 존재하는 패널 줄 범위 안인지 검사.

## 7. 움직이는 그림 (src/anims/*.js, `[[anim:이름|캡션]]`)

시뮬레이터(§6)가 "값을 한 단계씩 보는 디버거"라면, 움직이는 그림은 '''보고만 있어도 흐름이 들어오는 10초짜리 만화'''다.
문서에서는 보통 `{def}`/`{analogy}` 다음, `[[sim:]]` 앞에 둔다 — 먼저 그림으로 감을 잡고, 그다음 시뮬레이터로 값을 확인하는 순서.

### 파일 형식 (참조 구현: `src/anims/_reference_ctx_switch.js.txt` — 운체위키의 컨텍스트 스위치. 반드시 읽고 같은 구조로)
```js
window.ANIMS = window.ANIMS || {};
ANIMS["csma_cd_abort"] = {              // 이름 == 파일명(csma_cd_abort.js). 영문 소문자+밑줄
  title: "CSMA/CD — 충돌을 감지하고 중단하는 10초",
  desc: "한 줄 설명. 인라인 위키 문법([[링크]], '''굵게''') 허용",
  duration: 10,                         // 초. 엔진이 0→duration 을 반복 재생
  build: function () { return '<svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg">…</svg>'; }
};
```
- `build()` 는 '''순수 문자열'''만 돌려준다. DOM 접근 금지 (`node src/test_anims.js` 가 document 없이 실행한다).
- 시간축은 '''SMIL''' (`<animate>`, `<animateTransform>`, `<animateMotion>`, `<set>`) 로만 만든다. CSS animation·JS 타이머 금지 — 엔진이 `svg.setCurrentTime(t)` 로 시간을 직접 움직이므로 SMIL 만 스크러버/배속/정지에 반응한다.
- 모든 애니메이션 요소는 `begin + dur ≤ duration`. `repeatCount="indefinite"` 를 쓰려면 `dur` 을 반드시 지정. `fill="freeze"` 로 마지막 상태를 유지.
- "t초~t'초에만 보이기"는 `opacity` 를 `values="0;0;1;1;0;0" keyTimes="0;a;a+0.02;b;b+0.02;1" dur="D s"` 로 (참조 구현의 `show()` 헬퍼). keyTimes 는 0 에서 시작해 1 로 끝나고 단조증가.
- `viewBox="0 0 760 H"` (H 는 260~380). `<svg>` 에 고정 `width`/`height` 쓰지 말 것 — CSS 가 100% 폭으로 맞춘다.
- 텍스트 안의 `<`, `>`, `&` 는 `&lt;` `&gt;` `&amp;` 로. (`T_fr >= 2T_p` → `T_fr &gt;= 2T_p`)
- `<marker id>` 등 id 는 anim 이름을 접두어로 (`cc_arrow`) — 한 문서에 그림이 여럿 실린다.
- 크기 60KB 이하. 글자 크기 11~15px, 한국어 산문 + 영어 용어 (§4-1 그대로).
- 색: 스테이션/호스트 A `#1d65b3`(연한 `#dbe8f7`), B `#2e9e4f`(`#dff3e4`), C `#e09a40`(`#fdeec2`), 라우터/스위치/장비 `#3b2f4a`(`#efe9f6`), 충돌/오류/경고 `#d6465f`, 보조 글씨 `#777`. 신호 파형은 `#1d65b3`, 잡음·손상 `#d6465f`, 반송파 `#777`.
- 구성 규칙: 맨 위 한 줄 '''단계 자막'''(지금 무슨 일이 일어나는지, 시간대별로 바뀜) → 가운데 그림 → 맨 아래 한 줄 '''요점'''. 자막 문장은 문서 본문의 표현과 일치시킬 것 (시험 답안에 그대로 쓸 수 있게).
- 시간 설계: 첫 1~2초는 초기 상태를 보여주고, 각 단계 1.5초 내외, 마지막 1.5초는 결과 상태 유지. 8~14초.
- 파형(사인파)은 `<path d="M …">` 로 점을 20~40개 찍어 그린다. 계산은 build() 안에서 JS 로 해도 된다(순수 함수).

### 검증 (작성자가 반드시)
```sh
node src/test_anims.js                  # 계약 검사 (태그 균형, viewBox, SMIL 유무, begin+dur ≤ duration, 이스케이프)
python3 build.py                        # index.html 재생성 + 문서에서 안 쓰는 anim 경고
./shot.sh <이름> <초> [출력.png]         # headless Chrome 으로 t초에 멈춘 화면 캡처 → Read 로 열어 눈으로 확인
```
캡처는 최소 3개 시각(초반·중반·끝)에서 찍어 '''글자 겹침·잘림·화살표 방향·색 대비'''를 확인하고 고친 뒤에 끝낸다.
문서에 넣을 때는 `[[anim:이름|캡션]]` 한 줄, 캡션에는 "무엇을 보고 나서 무엇을 하라"를 쓴다.

### 목록 (이름 → 문서)
| 이름 | 내용 | 문서 |
|---|---|---|
| layer_stack | 5계층 스택: 호스트 A 에서 message → segment(4) → datagram(3) → frame(2) → bits 로 내려가고, 스위치(L1–L2)·라우터(L1–L3)를 지나 호스트 B 에서 올라감. 각 노드가 어느 계층까지 갖는지 강조 | main(대문), CH01 Introduction, 캡슐화, 스위치, 라우터 |
| data_flow_modes | simplex(한쪽만) / half-duplex(교대, 무전기) / full-duplex(동시) 세 줄 나란히, 화살표가 오가는 모습 | simplex, half-duplex, full-duplex |
| topologies | mesh(n(n−1)/2 링크) · star(허브) · bus(drop line + tap) · ring(리피터) 4 개 그림이 차례로 그려지고, 마지막에 star 의 허브·ring 의 한 링크가 죽으면 무슨 일이 나는지 | mesh 토폴로지, star 토폴로지, bus 토폴로지, ring 토폴로지 |
| sine_wave_params | 사인파 하나에서 peak amplitude ↑, frequency ↑, phase 0°→90°→180° 가 차례로 바뀌며 파형이 변함 | 사인파, peak amplitude, 주파수, phase, CH02 Signals |
| composite_fourier | 주파수 f, 3f, 5f 사인파 3개가 위에 그려지고 합쳐져 사각파에 가까워짐; 오른쪽에 frequency domain 막대가 하나씩 생김; bandwidth = 최고−최저 표시 | composite signal, Fourier analysis, bandwidth, time domain과 frequency domain |
| impairments | 같은 파형이 세 줄: attenuation(작아짐→amplifier 로 회복) / distortion(성분 위상 어긋나 모양 변함) / noise(지글거림 더해짐, SNR) | signal impairment, attenuation, distortion, noise, CH02 Transmission |
| sampling_nyquist | 사인파에 f_s = 4f(oversampling) / 2f(Nyquist rate) / f(undersampling) 로 샘플 점이 찍히고, 점을 이은 결과가 원 파형인지 엉뚱한 저주파인지 | sampling, Nyquist sampling theorem, oversampling과 undersampling, CH02 Digital Transmission |
| pcm_pipeline | 아날로그 곡선 → sampling(PAM 막대) → quantization(L=8 레벨 격자에 스냅, 오차 표시) → encoding(3비트 코드가 줄줄이 나옴) | PCM, quantization, encoding |
| ask_fsk_psk | 비트열 1 0 1 1 0 하나에 대해 ASK(진폭 켜짐/꺼짐) · FSK(빽빽/성김) · PSK(위상 반전) 세 파형이 순서대로 그려지고, 마지막에 "바꾸는 것: 진폭/주파수/위상" 요약 | ASK, FSK, PSK, modulation, CH02 Analog Transmission |
| fdm_tdm | 왼쪽 FDM: 신호 3개가 f₁ f₂ f₃ 로 변조돼 주파수축에 나란히(guard band) → 필터로 분리 / 오른쪽 TDM: 4 입력이 시간 슬롯 4 3 2 1 을 돌아가며 차지 | FDM, TDM, multiplexing, CH02 Multiplexing |
| node_to_node | L6 p.58 그림: Alice(N₁,L₁) → R1 → R2 → Bob(N₈,L₈). 프레임이 링크를 건널 때마다 MAC 주소(L)는 dest–source 로 갈아끼워지고 IP 주소(N₁,N₈)는 그대로. 라우터에서 decapsulate→encapsulate | node와 link, IP 주소와 MAC 주소, MAC 주소, CH03 Link-Layer Addressing, CH03 Data-Link Control |
| bit_stuffing_anim | 비트열이 왼쪽에서 흘러 들어오고 "연속 1 카운터"가 0…5 로 오르다 5 에서 0 이 강제 삽입; 수신 측이 flag 01111110 과 헷갈리지 않음 | bit stuffing, bit-oriented framing, flag |
| hamming_sphere | 2D 평면에 valid codeword x, y 점. 반지름 s 원(검출: d_min = s+1 이면 원이 y 에 안 닿음) → 반지름 t 영역(정정: d_min = 2t+1 이면 두 영역이 안 겹침) | Hamming distance, minimum Hamming distance, CH03 Data-Link Control |
| crc_shift | 1001000 위에 1011 이 한 칸씩 내려오며 XOR, 나머지 110 이 남아 dataword 뒤에 붙음 → 수신 측 나눗셈 syndrome 000 | CRC, divisor, syndrome |
| pure_aloha_collision | 스테이션 1~4 가 제멋대로 프레임을 쏘고, 겹치는 구간이 빨갛게(collision duration), 충돌한 프레임은 backoff 뒤 재전송 | pure ALOHA, collision, random access, CH03 Media Access Control |
| vulnerable_time | 시간축 위 B 가 t 에 전송 시작. A 가 t−T_fr 뒤에 시작하면 충돌, C 가 t+T_fr 전에 시작하면 충돌 → 2T_fr. 그 다음 slotted: 슬롯 격자에 맞춰 시작 → T_fr | vulnerable time, pure ALOHA, slotted ALOHA, T_fr |
| csma_space_time | space-time 평면: B 가 t₁ 에 전송, 신호가 양쪽으로 퍼짐(기울어진 띠), C 는 t₂ 에 아직 못 들어서 전송 → 겹침(충돌). vulnerable time = T_p | CSMA, space-time model, propagation time, T_p |
| csma_cd_abort | A 와 C 가 전송 → 충돌 → 각자 감지 즉시 abort + jamming signal → backoff. 아래에 "T_fr ≥ 2T_p 여야 감지 가능" 왕복 화살표 | CSMA/CD, jamming signal, 최소 프레임 크기 |
| persistence_methods | 채널이 busy → idle 로 바뀌는 시간축 위에 1-persistent(계속 듣다 즉시), nonpersistent(랜덤 대기 후 다시), p-persistent(idle 마다 확률 p 로) 세 스테이션의 행동 | persistence method, 1-persistent, nonpersistent, p-persistent |
| controlled_access | reservation(minislot 5 개에 1 표시 후 순서대로) → polling(primary 가 SEL/Poll, NAK/ACK) → token passing(토큰이 링을 돌고 가진 쪽만 전송) 세 장면 | controlled access, reservation, polling, token passing |
