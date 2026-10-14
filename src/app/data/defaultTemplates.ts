export interface EmailTemplate {
  id: string;
  name: string;
  html: string;
  css: string;
}

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
    {
    id: "01",
    name: "안면인식서비스 단일홍보 A안",
    html: `<!DOCTYPE html>
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style></style>
</head>
<body style="margin:0;padding:0;"><!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.min.css">
  <title>#{단말기_업무담당자}님, 김반장은 얼굴 인증 하나로 급여 정산까지 되는 것 알고 계셨나요?</title>
</head>

  <body style="margin:0; padding:0;font-family:'Pretendard','Pretendard Variable','Apple SD Gothic Neo','Malgun Gothic','맑은 고딕',sans-serif; color:#131416; line-height:1.6; font-size:16px;">

  <!-- 프리헤더 -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; height:0; width:0;">
    얼굴 인증 1초면 공수·급여·4대보험까지 자동으로 — 정산에 밤새울 필요가 없어집니다.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" >
    <tr>
      <td align="center" style="padding: 20px 0;">

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; overflow:hidden; border-radius:16px; box-shadow: 0 8px 24px rgba(19, 20, 22, 0.1);">


          <!-- ① HERO -->
          <tr>
            <td style="background:linear-gradient(180deg, rgba(138,218,255,0.40) 0%, rgba(138,218,255,0.00) 100%); background-color:#e9f6ff; padding:36px 30px 30px 30px; text-align:left;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="middle" style="padding-right:10px;">
                    <img src="https://mail.kbz.co.kr/email/images/sign/symbol.png" height="30" alt="김반장 심볼" style="display:block; border:0; outline:none; text-decoration:none;">
                  </td>
                  <td valign="middle">
                    <img src="https://mail.kbz.co.kr/email/images/sign/logotype.png" height="24" alt="김반장" style="display:block; border:0; outline:none; text-decoration:none;">
                  </td>
                </tr>
              </table>
              <h1 style="margin:20px 0 16px 0; color:#131416; font-size:2.1rem; font-weight:700; line-height:1.3; letter-spacing:-0.5px; word-break:keep-all;">
                안면인식기는 많습니다.<br>그런데 왜 <span style="color:#115AC6;">김반장</span>일까요?
              </h1>
              <p style="margin:0; font-size:1.3rem; color:rgba(0,0,0,0.7); font-weight:400; line-height:1.4; letter-spacing:-0.5px; word-break:keep-all;">
                출퇴근 <b>‘기록’에서 끝나는 장치</b>와<br><b style="color:#115AC6;">급여·신고까지 이어지는 흐름</b>의 차이.
              </p>
            </td>
          </tr>

          <!-- ② 인사 + 문제 제기 -->
          <tr>
            <td style="background-color:#ffffff; padding:30px 30px 8px 30px; text-align:left;">
              <p style="margin:0 0 16px 0; font-size:16px; color:#131416;">
                안녕하세요, <b>#{단말기_사업장명}</b> #{단말기_업무담당자}님.
              </p>
              <p style="margin:0 0 18px 0; font-size:16px; color:#3d434c;">
                안면인식 출퇴근 서비스를 알아보고 계신다면 이미 여러 서비스를 비교 중이실 겁니다.
                사실 대부분은 <b>‘얼굴로 출퇴근을 기록한다’</b>는 점까지는 크게 다르지 않습니다.
              </p>

              <!-- 경고형 콜아웃 -->
              <div style="background-color:#FFF4CE; border-radius:10px; padding:16px 18px; text-align:center;">
                <p style="margin:0; font-size:1rem; line-height:1.6; color:#D83B01;">
                  ⚠️ 담당자의 진짜 부담은 <b>‘기록 그 이후’</b>에 있습니다.<br>
                  공수 계산 · 급여 · 4대보험 · 계약서 · 명세서 — 매달 반복되는 이 업무들이죠.
                </p>
              </div>

              <p style="margin:8px 0 0 0; font-size:3rem; line-height:1; color:#115AC6; text-align:center;">↓</p>

              <h2 style="margin:6px 0 4px 0; font-size:1.5rem; font-weight:700; text-align:center; letter-spacing:-0.5px; line-height:1.35;">
                김반장은 <b>얼굴 인증 한 번으로</b><br><span style="color:#115AC6;">급여 정산까지 끝냅니다.</span>
              </h2>
            </td>
          </tr>

          <!-- ③ 흐름 카드 (핵심 01·02·03) -->
          <tr>
            <td style="background-color:#f4f5f6; padding:24px 30px;">

              <!-- 흐름 스트립 -->
              <div style="background-color:#e9f0fb; border-radius:10px; padding:14px 12px; text-align:center; margin-bottom:16px;">
                <span style="font-size:13px; font-weight:700; color:#115AC6;">1초 인증</span>
                <span style="font-size:13px; color:#9fc0e8; font-weight:700; padding:0 6px;">→</span>
                <span style="font-size:13px; font-weight:700; color:#131416;">공수 산정</span>
                <span style="font-size:13px; color:#9fc0e8; font-weight:700; padding:0 6px;">→</span>
                <span style="font-size:13px; font-weight:700; color:#131416;">급여·4대보험</span>
                <span style="font-size:13px; color:#9fc0e8; font-weight:700; padding:0 6px;">→</span>
                <span style="font-size:13px; font-weight:700; color:#131416;">카톡 교부</span>
              </div>

              <!-- 카드 1 -->
              <div style="background-color:#ffffff; border-radius:8px; margin-bottom:10px;">
                <div style="padding:22px;">
                  <div style="color:#0E3B63; font-size:1.2rem; font-weight:700; letter-spacing:-0.5px;">
                    <span style="display:inline-block; background-color:#114797; color:#ffffff; font-size:0.8rem; font-weight:bold; padding:2px 5px; border-radius:4px; margin-right:4px; vertical-align:middle;">핵심 01</span>
                    근로자 얼굴 셀프 등록
                  </div>
                  <p style="margin:8px 0 0 0; font-size:1rem; color:#6D7882;">
                    근로자가 모바일로 최초 1회 얼굴을 등록하면 끝. 수기 장부 없이 1초 인증으로 정확하게 기록되고, 사진·영상·3D마스크 위조는 원천 차단됩니다.
                  </p>
                </div>
              </div>

              <!-- 카드 2 -->
              <div style="background-color:#ffffff; border-radius:8px; margin-bottom:10px;">
                <div style="padding:22px;">
                  <div style="color:#0E3B63; font-size:1.2rem; font-weight:700; letter-spacing:-0.5px;">
                    <span style="display:inline-block; background-color:#114797; color:#ffffff; font-size:0.8rem; font-weight:bold; padding:2px 5px; border-radius:4px; margin-right:4px; vertical-align:middle;">핵심 02</span>
                    실시간 공수 자동 산출
                  </div>
                  <p style="margin:8px 0 0 0; font-size:1rem; color:#6D7882;">
                    근로자의 근로시간에 맞춰 공수가 자동 산출됩니다. 한 명 한 명 계산하던 번거로움과 오류가 사라지고, 초과근무 예상자도 한눈에 확인됩니다.
                  </p>
                </div>
              </div>

              <!-- 카드 3 -->
              <div style="background-color:#ffffff; border-radius:8px;">
                <div style="padding:22px;">
                  <div style="color:#0E3B63; font-size:1.2rem; font-weight:700; letter-spacing:-0.5px;">
                    <span style="display:inline-block; background-color:#114797; color:#ffffff; font-size:0.8rem; font-weight:bold; padding:2px 5px; border-radius:4px; margin-right:4px; vertical-align:middle;">핵심 03</span>
                    급여·4대보험 자동 정산 + 카톡 교부
                  </div>
                  <p style="margin:8px 0 0 0; font-size:1rem; color:#6D7882;">
                  안면인식기와 연동된 '김반장'이<b style="color:#0E3B63;"> 4대 보험 및 급여 정산을 자동화</b>하며, 근로계약서와 임금명세서도 종이 출력 없이 <b style="color:#0E3B63;">카카오톡으로 원스톱 교부합니다.</b>
                  </p>
                </div>
              </div>

            </td>
          </tr>

          <!-- ④ 요금 티저 (route A: 투명 그라데이션 + 단색 #F0FAFF → 다크모드 반전) -->
          <tr>
            <td style="background:linear-gradient(180deg, rgba(138,218,255,0.45) 0%, rgba(138,218,255,0.22) 55%, rgba(138,218,255,0) 90%); background-color:#F0FAFF; padding:30px 30px 0 30px; text-align:center;">
              <h3 style="margin:0 0 18px 0; font-size:1.5rem; font-weight:700; letter-spacing:-0.5px; color:#131416; word-break:keep-all;">
                설치할수록 <span style="color:#115AC6;">가벼워지는 요금</span>
              </h3>

              <!-- 할인 티저: 2가지 혜택을 하나의 카드로 묶고, 아래로 갈수록 연한 단색으로 계단식 fade
                   (모두 단색이라 다크모드에서 함께 반전) -->
              <div style="border-radius:12px 12px 0 0; overflow:hidden;">
                <!-- 혜택 1 (선명) -->
                <div style="padding:15px 18px; background-color:#ffffff;">
                  <span style="display:inline-block; background-color:#115AC6; color:#ffffff; font-size:0.8rem; font-weight:bold; padding:2px 7px; border-radius:4px; margin-right:8px; vertical-align:middle;">수량 할인</span>
                  <span style="font-size:1rem; font-weight:700; color:#0E3B63;">대수가 늘수록 대당 단가 인하</span>
                </div>
                <!-- 혜택 2 (티저: 같은 카드 안에서 흐리게 + 한 단계 연한 단색으로 아래로 옅어짐) -->
                <div style="padding:15px 18px; background-color:#F7FBFF;">
                  <span style="display:inline-block; background-color:rgba(17,90,198,0.4); color:#ffffff; font-size:0.8rem; font-weight:bold; padding:2px 7px; border-radius:4px; margin-right:8px; vertical-align:middle;">설치비</span>
                  <span style="font-size:1rem; font-weight:700; color:rgba(14,59,99,0.4);">장기 계약 시 설치비 무료</span>
                </div>
                <!-- 하단 dissolve: 단색 #F0FAFF → 계단식 fade의 마지막 단계, 섹션과 함께 반전되며 이어짐 -->
                <div style="height:22px; font-size:0; line-height:0; background-color:#F0FAFF;">&nbsp;</div>
              </div>
            </td>
          </tr>


          <!-- ⑤ 두 가지 선택지 -->
          <tr>
            <td style="background-color:#F0FAFF; padding:28px 24px 30px 24px;">
              <p style="margin:0 0 4px 0; text-align:center; font-size:1.5rem; font-weight:700; color:#131416; letter-spacing:-0.5px;">
                자세한 내용, 편한 방법으로 확인하세요
              </p>
              <p style="margin:0 0 18px 0; text-align:center; font-size:14px; color:#6D7882;">
                아래 <b>두 가지</b> 중 편하신 방법을 선택해 주세요.
              </p>

              <div style="text-align:center; font-size:0;">
                <!--[if mso]>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="50%" valign="top" style="padding:0 5px;">
                <![endif]-->
                <div style="display:inline-block; width:100%; max-width:255px; vertical-align:top; margin:0 4px 12px 4px; text-align:center;">
                  <div style="background-color:#115AC6; border-radius:12px; padding:22px 14px; min-height:216px; box-sizing:border-box;">
                    <div style="font-size:30px; line-height:1;">📄</div>
                    <div style="margin-top:12px; font-size:16px; font-weight:700; color:#ffffff;">소개서 확인하기</div>
                    <div style="margin-top:6px; font-size:13px; color:#cfe0f7; line-height:1.5;">출퇴근 서비스 상세 안내와<br> 요금 확인하기</div>
                    <a href="https://www.kbz.co.kr/resources/static/download/%EA%B9%80%EB%B0%98%EC%9E%A5_%EC%95%88%EB%A9%B4%EC%9D%B8%EC%8B%9D%EC%B6%9C%ED%87%B4%EA%B7%BC%EA%B4%80%EB%A6%AC%EC%84%9C%EB%B9%84%EC%8A%A4_%EC%86%8C%EA%B0%9C%EC%84%9C.pdf?utm_source=kbz_mail&utm_medium=email&utm_campaign=face_2026&utm_content=mail-a" target="_blank" download style="display:inline-block; margin-top:14px; background-color:#ffffff; color:#115AC6; font-size:14px; font-weight:700; text-decoration:none; padding:10px 20px; border-radius:8px;">다운로드 →</a>
                  </div>
                </div>
                <!--[if mso]>
                </td><td width="50%" valign="top" style="padding:0 5px;">
                <![endif]-->
                <div style="display:inline-block; width:100%; max-width:255px; vertical-align:top; margin:0 4px 12px 4px; text-align:center;">
                  <div style="background-color:#ffffff; border:2px solid #115AC6; border-radius:12px; padding:22px 14px; min-height:216px; box-sizing:border-box;">
                    <div style="font-size:30px; line-height:1;">📞</div>
                    <div style="margin-top:12px; font-size:16px; font-weight:700; color:#131416;">전화 상담하기</div>
                    <div style="margin-top:6px; font-size:13px; color:#6D7882; line-height:1.5;">현장에 알맞는 방식을<br>바로 안내받기</div>
                    <a href="tel:1588-9868" style="display:inline-block; margin-top:12px; color:#115AC6; font-size:22px; font-weight:900; text-decoration:none; letter-spacing:0.5px;">1588-9868</a>
                  </div>
                </div>
                <!--[if mso]>
                </td></tr></table>
                <![endif]-->
              </div>
            </td>
          </tr>

          <!-- ⑥ 홈페이지 -->
          <tr>
            <td align="center" style="background-color:#ffffff; padding:22px 30px 28px 30px; text-align:center;">
              <a href="https://www.kbz.co.kr?utm_source=kbz_mail&utm_medium=email&utm_campaign=face_2026&utm_content=mail-a" style="font-size:14px; line-height:1.6; color:#115AC6; text-decoration:none;">www.kbz.co.kr</a>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html></body>
</html>`,
    css: ``,
  },

   {
    id: "02",
    name: "안면인식서비스 단일홍보 B안",
    html: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style></style>
</head>
<body style="margin:0;padding:0;"><!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.min.css">
    <title>담당자님, 대리출근·오기재… 안면인식기 없이 잡을 수 있으세요?</title>

</head>

<body style="margin:0; padding:0; background-color:#eef1f4; font-family:'Pretendard','Pretendard Variable','Apple SD Gothic Neo','Malgun Gothic','맑은 고딕',sans-serif; color:#131416; line-height:1.6; font-size:16px;">

  <!-- 프리헤더 -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; height:0; width:0;">
    수기 장부로는 못 잡던 대리출근·오기재, 얼굴 1초 인증이면 기록부터 정확해집니다.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" >
    <tr>
      <td align="center" style="padding: 20px 0;">

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; overflow:hidden; border-radius:16px; box-shadow: 0 8px 24px rgba(19, 20, 22, 0.1);">


          <!-- ① HERO -->
          <tr>
            <td style="background:linear-gradient(180deg, rgba(138,218,255,0.40) 0%, rgba(138,218,255,0.00) 100%); background-color:#e9f6ff; padding:36px 30px 30px 30px; text-align:left;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="middle" style="padding-right:10px;">
                    <img src="https://mail.kbz.co.kr/email/images/sign/symbol.png" height="30" alt="김반장 심볼" style="display:block; border:0; outline:none; text-decoration:none;">
                  </td>
                  <td valign="middle">
                    <img src="https://mail.kbz.co.kr/email/images/sign/logotype.png" height="24" alt="김반장" style="display:block; border:0; outline:none; text-decoration:none;">
                  </td>
                </tr>
              </table>
              <h1 style="margin:20px 0 16px 0; color:#131416; font-size:2.1rem; font-weight:700; line-height:1.3; letter-spacing:-0.5px; word-break:keep-all;">
                아무리 꼼꼼해도,<br><span style="color:#115AC6;">수기로는 한계가 있습니다.</span>
              </h1>
              <p style="margin:0; font-size:1.3rem; color:rgba(0,0,0,0.7); font-weight:400; line-height:1.4; letter-spacing:-0.5px; word-break:keep-all;">
               <b style="color:#115AC6;">얼굴 1초 인증</b>으로  <br> 출퇴근 기록부터 정산까지 자동화하세요.
              </p>
            </td>
          </tr>

          <!-- ② 인사 + 문제 제기 (기기가 푸는 문제로 좁힘) -->
          <tr>
            <td style="background-color:#ffffff; padding:30px 30px 8px 30px; text-align:left;">
              <p style="margin:0 0 16px 0; font-size:16px; color:#131416;">
                안녕하세요, 담당자님.
              </p>
              <p style="margin:0 0 18px 0; font-size:16px; color:#3d434c;">
                현장 근태를 수기·엑셀로 관리하다 보면 가장 손이 많이가는 건 <b>‘출퇴근 기록’ 그 자체</b>입니다.
                대신 찍어주는 대리출근, 시간 오기재, 지금 현장에 몇 명이 있는지조차 실시간으로 알기 어렵죠.
              </p>

              <!-- 경고형 콜아웃 -->
              <div style="background-color:#FFF4CE; border-radius:10px; padding:16px 18px; text-align:center;">
                <p style="margin:0; font-size:1rem; line-height:1.6; color:#D83B01;">
                  ⚠️ 기록이 틀리면 <b>공수·급여·정산이 전부 어긋납니다.</b><br>
                  모든 노무관리의 첫 단추가 ‘정확한 출퇴근 기록’인 이유죠.
                </p>
              </div>

              <p style="margin:8px 0 0 0; font-size:3rem; line-height:1; color:#115AC6; text-align:center;">↓</p>

              <h2 style="margin:6px 0 4px 0; font-size:1.5rem; font-weight:700; text-align:center; letter-spacing:-0.5px; line-height:1.35;">
                출퇴근 관리,<br><span style="color:#115AC6;">김반장이 하면 다릅니다.</span>
              </h2>
            </td>
          </tr>

          <!-- ③ 안면인식기가 하는 일 (기기가 주인공 · 핵심 01·02·03) -->
          <tr>
            <td style="background-color:#f4f5f6; padding:24px 30px;">

              <!-- 카드 1 -->
              <div style="background-color:#ffffff; border-radius:8px; margin-bottom:10px;">
                <div style="padding:22px;">
                  <div style="color:#0E3B63; font-size:1.2rem; font-weight:700; letter-spacing:-0.5px;">
                    <span style="display:inline-block; background-color:#114797; color:#ffffff; font-size:0.8rem; font-weight:bold; padding:2px 5px; border-radius:4px; margin-right:4px; vertical-align:middle;">핵심 01</span>
                    근로자 얼굴 셀프 등록
                  </div>
                  <p style="margin:8px 0 0 0; font-size:1rem; color:#6D7882;">
                    근로자가 모바일로 최초 1회 얼굴을 등록하면 끝. 이후엔 얼굴만 대면 1초 만에 출퇴근이 기록되어, 관리자가 한 명 한 명 직접 입력할 필요가 없습니다.
                  </p>
                </div>
              </div>

              <!-- 카드 2 -->
              <div style="background-color:#ffffff; border-radius:8px; margin-bottom:10px;">
                <div style="padding:22px;">
                  <div style="color:#0E3B63; font-size:1.2rem; font-weight:700; letter-spacing:-0.5px;">
                    <span style="display:inline-block; background-color:#114797; color:#ffffff; font-size:0.8rem; font-weight:bold; padding:2px 5px; border-radius:4px; margin-right:4px; vertical-align:middle;">핵심 02</span>
                    위조 차단으로 대리출근 원천 차단
                  </div>
                  <p style="margin:8px 0 0 0; font-size:1rem; color:#6D7882;">
                    사진·영상·3D마스크를 이용한 허위 인증을 차단합니다. 카드 태그나 출석부 대리 서명과 달리 남이 대신 찍어줄 수 없으니, 대리출근으로 새던 인건비가 사라집니다.
                  </p>
                </div>
              </div>

              <!-- 카드 3 -->
              <div style="background-color:#ffffff; border-radius:8px;">
                <div style="padding:22px;">
                  <div style="color:#0E3B63; font-size:1.2rem; font-weight:700; letter-spacing:-0.5px;">
                    <span style="display:inline-block; background-color:#114797; color:#ffffff; font-size:0.8rem; font-weight:bold; padding:2px 5px; border-radius:4px; margin-right:4px; vertical-align:middle;">핵심 03</span>
                    출퇴근 기록부터 급여까지 자동 연결
                  </div>
                  <p style="margin:8px 0 0 0; font-size:1rem; color:#6D7882;">
                    다른 안면인식기는 ‘출퇴근 기록’까지입니다. 김반장 안면인식기의 기록은 <b style="color:#0E3B63;">공수 산정부터 급여·4대보험 계산, 근로계약서·임금명세서 교부까지</b> 손대지 않아도 자동으로 연결됩니다.
                  </p>
                </div>
              </div>
            </td>
          </tr>

         <!-- ④ 요금 티저 (route A: 투명 그라데이션 + 단색 #F0FAFF → 다크모드 반전) -->
          <tr>
            <td style="background:linear-gradient(180deg, rgba(138,218,255,0.45) 0%, rgba(138,218,255,0.22) 55%, rgba(138,218,255,0) 90%); background-color:#F0FAFF; padding:30px 30px 0 30px; text-align:center;">
              <h3 style="margin:0 0 18px 0; font-size:1.5rem; font-weight:700; letter-spacing:-0.5px; color:#131416; word-break:keep-all;">
                설치할수록 <span style="color:#115AC6;">가벼워지는 요금</span>
              </h3>

              <!-- 할인 티저: 2가지 혜택을 하나의 카드로 묶고, 아래로 갈수록 연한 단색으로 계단식 fade
                   (모두 단색이라 다크모드에서 함께 반전) -->
              <div style="border-radius:12px 12px 0 0; overflow:hidden;">
                <!-- 혜택 1 (선명) -->
                <div style="padding:15px 18px; background-color:#ffffff;">
                  <span style="display:inline-block; background-color:#115AC6; color:#ffffff; font-size:0.8rem; font-weight:bold; padding:2px 7px; border-radius:4px; margin-right:8px; vertical-align:middle;">수량 할인</span>
                  <span style="font-size:1rem; font-weight:700; color:#0E3B63;">대수가 늘수록 대당 단가 인하</span>
                </div>
                <!-- 혜택 2 (티저: 같은 카드 안에서 흐리게 + 한 단계 연한 단색으로 아래로 옅어짐) -->
                <div style="padding:15px 18px; background-color:#F7FBFF;">
                  <span style="display:inline-block; background-color:rgba(17,90,198,0.4); color:#ffffff; font-size:0.8rem; font-weight:bold; padding:2px 7px; border-radius:4px; margin-right:8px; vertical-align:middle;">설치비</span>
                  <span style="font-size:1rem; font-weight:700; color:rgba(14,59,99,0.4);">장기 계약 시 설치비 무료</span>
                </div>
                <!-- 하단 dissolve: 단색 #F0FAFF → 계단식 fade의 마지막 단계, 섹션과 함께 반전되며 이어짐 -->
                <div style="height:22px; font-size:0; line-height:0; background-color:#F0FAFF;">&nbsp;</div>
              </div>
            </td>
          </tr>


          <!-- ⑤ 두 가지 선택지 -->
          <tr>
            <td style="background-color:#F0FAFF; padding:28px 24px 30px 24px;">
              <p style="margin:0 0 4px 0; text-align:center; font-size:1.5rem; font-weight:700; color:#131416; letter-spacing:-0.5px;">
                자세한 내용, 편한 방법으로 확인하세요
              </p>
              <p style="margin:0 0 18px 0; text-align:center; font-size:14px; color:#6D7882;">
                아래 <b>두 가지</b> 중 편하신 방법을 선택해 주세요.
              </p>

              <div style="text-align:center; font-size:0;">
                <!--[if mso]>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="50%" valign="top" style="padding:0 5px;">
                <![endif]-->
                <div style="display:inline-block; width:100%; max-width:255px; vertical-align:top; margin:0 4px 12px 4px; text-align:center;">
                  <div style="background-color:#115AC6; border-radius:12px; padding:22px 14px; min-height:216px; box-sizing:border-box;">
                    <div style="font-size:30px; line-height:1;">📄</div>
                    <div style="margin-top:12px; font-size:16px; font-weight:700; color:#ffffff;">소개서 확인하기</div>
                    <div style="margin-top:6px; font-size:13px; color:#cfe0f7; line-height:1.5;">출퇴근 서비스 상세 안내와<br> 요금 확인하기</div>
                    <a href="https://www.kbz.co.kr/resources/static/download/%EA%B9%80%EB%B0%98%EC%9E%A5_%EC%95%88%EB%A9%B4%EC%9D%B8%EC%8B%9D%EC%B6%9C%ED%87%B4%EA%B7%BC%EA%B4%80%EB%A6%AC%EC%84%9C%EB%B9%84%EC%8A%A4_%EC%86%8C%EA%B0%9C%EC%84%9C.pdf?utm_source=kbz_mail&utm_medium=email&utm_campaign=face_2026&utm_content=mail-b" target="_blank" download style="display:inline-block; margin-top:14px; background-color:#ffffff; color:#115AC6; font-size:14px; font-weight:700; text-decoration:none; padding:10px 20px; border-radius:8px;">다운로드 →</a>
                  </div>
                </div>
                <!--[if mso]>
                </td><td width="50%" valign="top" style="padding:0 5px;">
                <![endif]-->
                <div style="display:inline-block; width:100%; max-width:255px; vertical-align:top; margin:0 4px 12px 4px; text-align:center;">
                  <div style="background-color:#ffffff; border:2px solid #115AC6; border-radius:12px; padding:22px 14px; min-height:216px; box-sizing:border-box;">
                    <div style="font-size:30px; line-height:1;">📞</div>
                    <div style="margin-top:12px; font-size:16px; font-weight:700; color:#131416;">전화 상담하기</div>
                    <div style="margin-top:6px; font-size:13px; color:#6D7882; line-height:1.5;">현장에 알맞는 방식을<br>바로 안내받기</div>
                    <a href="tel:1588-9868" style="display:inline-block; margin-top:12px; color:#115AC6; font-size:22px; font-weight:900; text-decoration:none; letter-spacing:0.5px;">1588-9868</a>
                  </div>
                </div>
                <!--[if mso]>
                </td></tr></table>
                <![endif]-->
              </div>
            </td>
          </tr>

          <!-- ⑥ 홈페이지 -->
          <tr>
            <td align="center" style="background-color:#ffffff; padding:22px 30px 28px 30px; text-align:center;">
              <a href="https://www.kbz.co.kr?utm_source=kbz_mail&utm_medium=email&utm_campaign=face_2026&utm_content=mail-b" style="font-size:14px; line-height:1.6; color:#115AC6; text-decoration:none;">www.kbz.co.kr</a>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html></body>
</html>`,
    css: ``,
  },


   {
    id: "03",
    name: "안면인식서비스 추가",
    html: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style></style>
</head>
<body style="margin:0;padding:0;"><!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; color: #131416; line-height: 1.6; font-size:16px;">

      <table width="100%" cellpadding="0" cellspacing="0" border="0" >
        <tr>
            <td align="center">
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF;   overflow: hidden; box-shadow: 0 8px 24px rgba(19, 20, 22, 0.1);">

 <div style="max-width: 350px; background-color: #F8F9FA; border: 1px solid #E6E8EA; border-radius: 12px; padding: 22px 20px; margin: 20px 0 25px 0; text-align: left;">
    <p style="margin: 0 0 16px 0; text-align: center; font-size: 14px; font-weight: bold; color: #525B64; letter-spacing: -0.5px;">
        📋 3줄 핵심 요약
    </p>
    <ul style="list-style-type: none; margin: 0; padding: 0; font-size: 15px; color: #131416;"><li style="margin-bottom: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span style="display: inline-block; background-color: #E7F0FD; color: #115AC6; font-size: 12px; font-weight: bold; padding: 3px 6px; border-radius: 4px; margin-right: 8px; vertical-align: middle;">지원혜택</span> 
            🎁 4대보험·퇴직공제 <strong style="color: #115AC6;"> 업무대행 3개월 무료</strong>
        </li><li style="margin-bottom: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span style="display: inline-block; background-color: #FFF4CE; color: #D83B01; font-size: 12px; font-weight: bold; padding: 3px 6px; border-radius: 4px; margin-right: 8px; vertical-align: middle;">노무꿀팁</span> 
            🎟️ 전자카드 단말기 <strong style="color: #115AC6;"> 계약 시 커피쿠폰 증정 </strong>
        </li><li style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span style="display: inline-block; background-color: #E2F3E7; color: #0C6B37; font-size: 12px; font-weight: bold; padding: 3px 6px; border-radius: 4px; margin-right: 8px; vertical-align: middle;">신규론칭</span> 
            🥸 안면인식만 하면 <strong style="color: #115AC6;"> 일용직 급여정산 완료!</strong>
        </li></ul>
</div>
                  
                    <tr>
                        <td style="background: linear-gradient(180deg,rgba(138, 218, 255, 0.40) 50%, rgba(138, 218, 255, 0.00) 100%); padding: 35px 30px; text-align: left;">
                            <span style="font-size: 1.1rem; background-color:#fff; padding:10px; border-radius: 10px;color: #115AC6; word-break: keep-all; font-weight: bold;"> 🎉 건설근로자공제회 공식 지원 사업  </span>
                              <h1 style="margin: 20px 0 16px 0; color: #131416;  font-size: 2.1rem; font-weight: 700; line-height: 1.3; letter-spacing: -0.5px; word-break: keep-all;">
                                지금 신청하면<br> 퇴직공제 업무대행<br> <span style="color: #115AC6;">3개월 완전 무료!</span>
                            </h1>
                            <h2 style="margin: 0; color:rgba(0,0,0,0.7); max-width:400px; font-size: 1.3rem; font-weight: 400; line-height: 1.4; letter-spacing: -0.5px; word-break: keep-all;">
                                <strong>공제회가 업무대행 비용 77,000원을 지원</strong>하고, 나머지 금액은 김반장이 부담합니다.
                            </h2>
                        </td>
                    </tr>

                    <tr>
                        <td style="text-align: center; background-color: #FFFFFF; padding: 30px 30px 30px 30px;">
                            <p style="margin: 0 0 10px 0;">안녕하세요. #{단말기_사업장명}의 #{단말기_업무담당자}님.</p>
                            
                            <p style="margin: 0; font-size: 1rem; text-align:center; color: #D83B01; background-color: #FFF4CE; padding: 12px 15px; border-radius: 6px;">
                                ⚠️<br> 현재 <span style="font-weight:bold;">퇴직공제 전자카드 단말기 설치 의무공사</span>를 진행하심에 따라, 단말기 관리부터 복잡한 근로내역 확정신고까지 업무 과중 리스크가 커질 것으로 예상됩니다.
                            </p>

                          <p style="margin: 0; font-size: 3rem; text-align:center; color: #115AC6; padding: 12px;">
                               ↓
                            </p>
                          <h3 style="margin: 0 0 12px 0; font-size: 1.5rem; font-weight: 700; text-align:center;  letter-spacing: -0.5px; line-height: 1.2;">
                             지원 대상에 해당되면 <br>  <span style="color: #115AC6;">퇴직공제 업무대행 무료!</span>  
                            </h3>
  <div style="text-align:center; overflow: hidden;">
                                <div style="padding: 10px;">

                                                                        <p style="background-color:#115AC6; padding:3px; margin: 0; color: #fff;">
                                     지원대상
                                    </p>
                                      <p style="background-color:#fff; padding:3px; margin: 0; color: #115AC6; border-bottom: dotted 1px #115AC6;">
                                     공사예정금액 <strong>300억 원 미만 </strong>현장을 보유한 건설사
                                    </p>
                                   <p style="background-color:#fff; padding:3px; margin: 0; color: #115AC6; border-bottom: dotted 1px #115AC6;">
                                    현장 내 <strong>전자카드 단말기 설치 완료 </strong> 사업장
                                    </p>
                                   <p style="background-color:#fff; padding:3px; margin: 0; color: #115AC6; border-bottom: dotted 1px #115AC6;">
                                    퇴직공제 근로내역 신고 예정 사업장
                                    </p>
                                </div>

                            </div>
     <p style="margin: 10px 0 0 0; font-size: 14px; color: #6D7882;">
       * 이용 서비스에 따라 지원금액이 다를 수 있습니다.<br>
       * 예산 소진 시 조기 마감 됩니다.</p>

                                <div style="padding: 0; margin-top:10px; border-radius: 10px; background-color: #131416;">
                            <a href="https://www.kbz.co.kr/mobile/consultation.sgn?utm_source=coldmail&utm_medium=email&utm_campaign=coldmail&utm_content=mail-a" target="_blank" style="display: block; width: 100%; height:100%; box-sizing: border-box; text-align: center; color: #FFFFFF;  overflow: hiddden; font-size: 2rem; font-weight: bold; text-decoration: none; line-height: 2rem; padding:10px;">
                               <div style="font-size: 1rem; margin-bottom:8px; font-weight:500;">사업 기간: 2026년 4월 1일 ~ 12월 31일  </div> 
                                업무대행 신청하기
                            </a>
                        </div>
                        </td>
                      
                    </tr>
          <tr>
                          <td style=" text-align: center; background-color: #FFFFFF; padding: 40px 40px 30px 40px;">
                            <h3 style="margin: 0 0 12px 0; color: #131416; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2;">
                                <span style="color: #115AC6;">퇴직공제 전자카드 단말기 </span><br>설치 전이라면  <br> 김반장으로 대비하세요.
                            </h3>
                         
                            
                            <ul style="list-style-type: none; margin: 0; padding: 0; font-size: 15px;">
                                <li style="margin-bottom: 8px; padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>현장 맞춤 설치:</strong> 어떤 현장이든 OK! 다양한 타입의 단말기 보유
                                </li>
                                <li style="margin-bottom: 8px; padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>쓸수록 커지는 할인:</strong> 장기 이용 시 더욱 합리적이고 저렴해지는 월 임대료
                                </li>
                                <li style="padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>결합 혜택: </strong>'김반장 프리미엄' 동시 계약 시 추가 할인 혜택 제공
                                </li>
                            </ul>
                            
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #FFFFFF; padding: 10px 40px 40px 40px;">
                            
                            <div style="border: 1px solid #115AC6; border-radius: 12px; overflow: hidden; text-align: center; box-shadow: 0 4px 12px rgba(17, 90, 198, 0.1);">
                                
                                <div style="background-color: rgba(27, 159, 226, 0.1); padding: 15px 20px; border-bottom: 1px dashed #1B9FE2;">
                                    <p style="margin: 0; font-size: 15px; font-weight: bold; color: #114797;">
                                        🎁 단말기 임대 계약 시 <span style="color: #115AC6;">'커피쿠폰' 증정 이벤트</span> 진행 중!
                                    </p>
                                </div>
                                
                                <div style="background-color: #FFFFFF; padding: 25px 20px;">
                                    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #0E3B63;">
                                        전화 상담이 필요하신가요?
                                    </p>
                                    <a href="tel:1588-3818" style="display: inline-block; font-size: 2rem; font-weight: 900; color: #115AC6; text-decoration: none; letter-spacing: 1px;">
                                        📞 1588-3818
                                    </a>
                                    <p>
                                     <a href="https://www.kbz.co.kr?utm_source=coldmail&utm_medium=email&utm_campaign=title_ab&utm_content=mail-a"  target="_blank"  style="margin: 10px 0 0 0; font-size: 14px; color: #6D7882;">김반장 홈페이지 구경하기 </a>
                                    </p>
                                </div>
                                
                            </div>

                        </td>
                    </tr>



   

                    <tr>
                        <td style="background-color:rgba(27, 159, 226, 0.1); padding: 40px 30px;">
                            
                                                        <span style="font-size: 1.1rem; background-color:#fff; padding:10px; border-radius: 10px;color: #115AC6; word-break: keep-all; font-weight: bold;"> 근로자 4대보험·퇴직공제 업무  </span>
                            <h1 style="margin: 20px 0 16px 0; color: #115AC6; font-size: 2.1rem; font-weight: 700; line-height: 1.3; letter-spacing: -0.5px; word-break: keep-all;">
                                김반장 프리미엄으로 원스톱 해결!<br>
                            </h1>
                            <h2 style="margin: 0;  font-size: 1.1rem; font-weight: 400; line-height: 1.4; letter-spacing: -0.5px; word-break: keep-all;">
                                🥇 전국 1위 4대보험 업무대행기관<br>
                                🎖️ 2025년 고용노동부 장관 표창<br>
                                🥳 2년 연속 퇴직공제대행 최우수기관
                            </h2>
         <div style="margin: 15px 0; display: flex; flex-direction: column; align-items: center; font-size: 1rem;   color: #115AC6; background-color:rgba(27, 159, 226, 0.1); padding: 12px 15px;  border-radius: 6px;">
                           <p style=" text-align: center; max-width: 400px">     김반장 프리미엄은 10,000여 개 건설사가 선택한 퇴직공제·4대보험 통합 신고 서비스로서, 10년 이상 경력의 전담팀 통해 법적 리스크를 안전하게 방어합니다.</p>
                           
                          
                          
                            
                            <ul style="list-style-type: none; margin-bottom: : 15px; padding: 0; font-size: 15px; color: #333333;">
                                <li style="margin-bottom: 8px; padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>신고 업무 대행:</strong> 입퇴사 정보만 전송하면 '모든' 신고 전담 처리
                                </li>
                                <li style="margin-bottom: 8px; padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>과태료 방지:</strong> 개정 기준 적용으로 오류 및 신고 누락 리스크 사전 차단
                                </li>
                                <li style="padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>고지서 검증:</strong> 매월 4대보험료 검증 및 각종 증명원 발급
                                </li>
                            </ul> </div>

  <div style="background-color: #FFFFFF; border-radius: 8px; margin-top: 10px; text-align:center; overflow: hidden;">                                <div style="padding: 25px;">
                                    <div style="color: #0E3B63; font-size:1.2rem; font-weight: 700; letter-spacing: -0.5px;">
                                        <span style="display: inline-block; background-color: rgba(27, 159, 226, 0.15); color: #1B9FE2; font-size: 0.8rem; font-weight: bold; padding: 2px 5px; border-radius: 4px; margin-right: 4px; vertical-align: middle;">업데이트</span>
                                        상용근로자 관리
                                    </div>
                                    <p style="  margin: 0; color: #6D7882; margin-top: 8px;">
                                     이제 김반장 3.0에서 상용근로자 근태까지 통합 관리하세요!  4대 보험, 급여 정산까지 김반장 하나면 해결됩니다.
                                    </p>
                                </div>
                            </div>

                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0; background-color: #115AC6;">
                            <a href="https://www.kbz.co.kr/mobile/consultation.sgn?utm_source=coldmail&utm_medium=email&utm_campaign=title_ab&utm_content=mail-a" target="_blank" style="display: block; width: 100%; box-sizing: border-box; text-align: center; color: #FFFFFF; font-size: 2rem; font-weight: bold; text-decoration: none; padding: 20px 0;">
                                 서비스 상담 신청하기 →
                            </a>
                        </td>
                    </tr>
<!-- [비율 최종 교정 섹션] 안면인식 출퇴근관리 홍보 시작 -->

      <!-- 1. 상단 소제목 (카테고리 태그) -->
                    <tr>
                        <td style="background:#f4f5f6; padding: 45px 10px 0px 30px; text-align: left;">
                            <span style="font-size: 1.1rem; border: 1px solid; border-color: #e6e8ea; background-color:#fff; padding:10px; border-radius: 10px; color: #115AC6; word-break: keep-all; font-weight: bold;">건설현장 출퇴근 관리  </span>
                              <h1 style="margin: 20px 0 16px 0; color: #131416;  font-size: 2.1rem; font-weight: 700; line-height: 1.3; letter-spacing: -0.5px; word-break: keep-all;">
                           김반장 안면인식 출퇴근으로 <br> <span style="color: #115AC6;"> 정확하게, 자동으로!</span>
                            </h1>
                            
                        </td>

                      
                    </tr>
    
      
  
      
      <!-- 4. [수정] 비용 안내 바 디자인 비율 최적화 -->
      <tr>
        <td style=" padding: 0px 30px 10px 30px; background:#f4f5f6;">
           <div style="background-color: #fff; border-radius: 8px; margin-top: 10px; text-align:left; overflow: hidden;">                                <div style="padding: 25px;">
                                    <div style="color: #0E3B63; font-size:1.2rem; font-weight: 700; letter-spacing: -0.5px;">
                                          <span style="display: inline-block; background-color:#114797; color: #fff; font-size: 0.8rem; font-weight: 500; padding: 2px 5px; border-radius: 4px; margin-right: 4px; vertical-align: middle;">장점 01</span>
                                        근로자 간편 등록 & 1초 안면인식
                                    </div>
                                    <p style="  margin: 0; color: #6D7882; margin-top: 8px;">
                                     근로자가 직접 QR코드로 최초 1회 얼굴 등록하면 끝! 수기 장부 작성이 필요 없는 1초 안면인식으로 빠르고 정확하게 기록됩니다.
                                    </p>
                                </div>
                            </div>
                     <div style="background-color: #ffffff; border-radius: 8px; margin-top: 10px; text-align:left; overflow: hidden;">                                <div style="padding: 25px;">
                                    <div style="color: #0E3B63; font-size:1.2rem; font-weight: 700; letter-spacing: -0.5px;">
                                        <span style="display: inline-block; background-color:#114797; color: #fff; font-size: 0.8rem; font-weight: 500; padding: 2px 5px; border-radius: 4px; margin-right: 4px; vertical-align: middle;">장점 02</span>
                                       실시간 공수 자동 산출 및 관리
                                    </div>
                                    <p style="  margin: 0; color: #6D7882; margin-top: 8px;">
                                     출퇴근 기록을 기반으로 현장 인정 시간에 맞춰 근로자별 공수가 자동으로 산출되므로 일일이 계산하는 번거로움과 오류가 사라집니다.
                                    </p>
                                </div>
                            </div>
                     <div style="background-color: #fff; border-radius: 8px; margin-top: 10px; text-align:left; overflow: hidden;">                                <div style="padding: 25px;">
                                    <div style="color: #0E3B63; font-size:1.2rem; font-weight: 700; letter-spacing: -0.5px;">
                                        <span style="display: inline-block; background-color:#114797; color: #fff; font-size: 0.8rem; font-weight: 500; padding: 2px 5px; border-radius: 4px; margin-right: 4px; vertical-align: middle;">장점 03</span>
                                       자동 급여 정산 및 명세서 카톡 교부
                                    </div>
                                    <p style="  margin: 0; color: #6D7882; margin-top: 8px;">
                                     4대보험과 소득세가 연동되어 자동 계산되며, 정산 후 임금명세서를 생성하여 카카오톡으로 근로자에게 원스톱 교부할 수 있습니다.
                                    </p>
                                </div>
                            </div>
        </td>
        
      </tr>

  <tr>
                        <td align="center" style="background: linear-gradient(180deg,rgba(244, 245, 256, 1) 50%, rgba(138, 218, 255, 0.00) 100%);; padding: 0px 30px 0px 30px;">
                            
                   
                                
                                <div style="background-color: #114797; border-radius: 12px; text-align: left;  padding: 15px 20px;">
                                                   <span style="font-size: 12px; color: #114797; font-weight: bold; margin-bottom: 8px; background-color: #ffffff; padding: 4px 6px; border-radius: 4px; display: inline-block; vertical-align: middle;">12개월 계약 시 설치비 무료</span>
<br>
                <span style=" font-size: 20px; color: #fff; font-weight: bold;">월 150,000원 / 대</span>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #b7d0f5;">
       * 김반장 3.0 미이용 사업장은 월 2만원 이용료가 추가됩니다.<br>
       * 계약 수량에 따라 할인혜택이 제공됩니다
      <br>
      </p>   
                                </div>
                      
                  <div style=" border-radius: 12px; text-align: center; color: #114797; padding: 45px;">
                          
                          <span> 안면인식 출퇴근 서비스 상세문의 </span><br>
 <a href="tel:1588-3818" style="display: inline-block; font-size: 2.2rem; text-decoration: none; letter-spacing: 1px;">
                                   <span style=" font-weight: 900;">1588-9868</span>  
                                    </a></div>
                        </td>
                    </tr>

<!-- [비율 최종 교정 섹션] 안면인식 출퇴근관리 홍보 끝 -->
          
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
    css: ``,
  },
  {
    id: "04",
    name: "퇴직공제 업무대행 홍보메일",
    html: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style></style>
</head>
<body style="margin:0;padding:0;"><!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; color: #131416; line-height: 1.6; font-size:16px;">

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F5F6;">
        <tr>
            <td align="center">
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF;   overflow: hidden; box-shadow: 0 8px 24px rgba(19, 20, 22, 0.1);">


                  
                    <tr>
                        <td style="background: linear-gradient(180deg,rgba(138, 218, 255, 0.40) 50%, rgba(138, 218, 255, 0.00) 100%); padding: 35px 30px; text-align: left;">
                            <span style="font-size: 1.1rem; background-color:#fff; padding:10px; border-radius: 10px;color: #115AC6; word-break: keep-all; font-weight: bold;"> 🎉 건설근로자공제회 공식 지원 사업  </span>
                              <h1 style="margin: 20px 0 16px 0; color: #131416;  font-size: 2.1rem; font-weight: 700; line-height: 1.3; letter-spacing: -0.5px; word-break: keep-all;">
                                지금 신청하면<br> 퇴직공제 업무대행<br> <span style="color: #115AC6;">3개월 완전 무료!</span>
                            </h1>
                            <h2 style="margin: 0; color:rgba(0,0,0,0.7); max-width:400px; font-size: 1.3rem; font-weight: 400; line-height: 1.4; letter-spacing: -0.5px; word-break: keep-all;">
                                <strong>공제회가 업무대행 비용 77,000원을 지원</strong>하고, 나머지 금액은 김반장이 부담합니다.
                            </h2>
                        </td>
                    </tr>

                    <tr>
                        <td style="text-align: center; background-color: #FFFFFF; padding: 30px 30px 30px 30px;">
                            <p style="margin: 0 0 10px 0;">안녕하세요. #{단말기_사업장명}의 #{단말기_업무담당자}님.</p>
                            
                            <p style="margin: 0; font-size: 1rem; text-align:center; color: #D83B01; background-color: #FFF4CE; padding: 12px 15px; border-radius: 6px;">
                                ⚠️<br> 현재 <span style="font-weight:bold;">퇴직공제 전자카드 단말기 설치 의무공사</span>를 진행하심에 따라, 단말기 관리부터 복잡한 근로내역 확정신고까지 업무 과중 리스크가 커질 것으로 예상됩니다.
                            </p>

                          <p style="margin: 0; font-size: 3rem; text-align:center; color: #115AC6; padding: 12px;">
                               ↓
                            </p>
                          <h3 style="margin: 0 0 12px 0; font-size: 1.5rem; font-weight: 700; text-align:center;  letter-spacing: -0.5px; line-height: 1.2;">
                             지원 대상에 해당되면 <br>  <span style="color: #115AC6;">퇴직공제 업무대행 무료!</span>  
                            </h3>
  <div style="text-align:center; overflow: hidden;">
                                <div style="padding: 10px;">

                                                                        <p style="background-color:#115AC6; padding:3px; margin: 0; color: #fff;">
                                     지원대상
                                    </p>
                                      <p style="background-color:#fff; padding:3px; margin: 0; color: #115AC6; border-bottom: dotted 1px #115AC6;">
                                     공사예정금액 <strong>300억 원 미만 </strong>현장을 보유한 건설사
                                    </p>
                                   <p style="background-color:#fff; padding:3px; margin: 0; color: #115AC6; border-bottom: dotted 1px #115AC6;">
                                    현장 내 <strong>전자카드 단말기 설치 완료 </strong> 사업장
                                    </p>
                                   <p style="background-color:#fff; padding:3px; margin: 0; color: #115AC6; border-bottom: dotted 1px #115AC6;">
                                    퇴직공제 근로내역 신고 예정 사업장
                                    </p>
                                </div>

                            </div>
     <p style="margin: 10px 0 0 0; font-size: 14px; color: #6D7882;">
       * 이용 서비스에 따라 지원금액이 다를 수 있습니다.<br>
       * 예산 소진 시 조기 마감 됩니다.</p>

                                <div style="padding: 0; margin-top:10px; border-radius: 10px; background-color: #131416;">
                            <a href="https://www.kbz.co.kr/mobile/consultation.sgn?utm_source=coldmail&utm_medium=email&utm_campaign=coldmail&utm_content=mail-b" target="_blank" style="display: block; width: 100%; height:100%; box-sizing: border-box; text-align: center; color: #FFFFFF;  overflow: hiddden; font-size: 2rem; font-weight: bold; text-decoration: none; line-height: 2rem; padding:10px;">
                               <div style="font-size: 1rem; margin-bottom:8px; font-weight:500;">사업 기간: 2026년 4월 1일 ~ 12월 31일  </div> 
                                업무대행 신청하기
                            </a>
                        </div>
                        </td>
                      
                    </tr>
          <tr>
                          <td style=" text-align: center; background-color: #FFFFFF; padding: 40px 40px 30px 40px;">
                            <h3 style="margin: 0 0 12px 0; color: #131416; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2;">
                                <span style="color: #115AC6;">퇴직공제 전자카드 단말기 </span><br>설치 전이라면  <br> 김반장으로 대비하세요.
                            </h3>
                         
                            
                            <ul style="list-style-type: none; margin: 0; padding: 0; font-size: 15px;">
                                <li style="margin-bottom: 8px; padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>현장 맞춤 설치:</strong> 어떤 현장이든 OK! 다양한 타입의 단말기 보유
                                </li>
                                <li style="margin-bottom: 8px; padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>쓸수록 커지는 할인:</strong> 장기 이용 시 더욱 합리적이고 저렴해지는 월 임대료
                                </li>
                                <li style="padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>결합 혜택: </strong>'김반장 프리미엄' 동시 계약 시 추가 할인 혜택 제공
                                </li>
                            </ul>
                            
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #FFFFFF; padding: 10px 40px 40px 40px;">
                            
                            <div style="border: 1px solid #115AC6; border-radius: 12px; overflow: hidden; text-align: center; box-shadow: 0 4px 12px rgba(17, 90, 198, 0.1);">
                                
                                <div style="background-color: rgba(27, 159, 226, 0.1); padding: 15px 20px; border-bottom: 1px dashed #1B9FE2;">
                                    <p style="margin: 0; font-size: 15px; font-weight: bold; color: #114797;">
                                        🎁 단말기 임대 계약 시 <span style="color: #115AC6;">'스타벅스 커피쿠폰' 증정 이벤트</span> 진행 중!
                                    </p>
                                </div>
                                
                                <div style="background-color: #FFFFFF; padding: 25px 20px;">
                                    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #0E3B63;">
                                        전화 상담이 필요하신가요?
                                    </p>
                                    <a href="tel:1588-3818" style="display: inline-block; font-size: 2rem; font-weight: 900; color: #115AC6; text-decoration: none; letter-spacing: 1px;">
                                        📞 1588-3818
                                    </a>
                                    <p>
                                     <a href="https://www.kbz.co.kr?utm_source=coldmail&utm_medium=email&utm_campaign=title_ab&utm_content=mail-b"  target="_blank"  style="margin: 10px 0 0 0; font-size: 14px; color: #6D7882;">김반장 홈페이지 구경하기 </a>
                                    </p>
                                </div>
                                
                            </div>

                        </td>
                    </tr>



   

                    <tr>
                        <td style="background-color:rgba(27, 159, 226, 0.1); padding: 40px 30px;">
                            
                                                        <span style="font-size: 1.1rem; background-color:#fff; padding:10px; border-radius: 10px;color: #115AC6; word-break: keep-all; font-weight: bold;"> 근로자 4대보험·퇴직공제 업무  </span>
                            <h1 style="margin: 20px 0 16px 0; color: #115AC6; font-size: 2.1rem; font-weight: 700; line-height: 1.3; letter-spacing: -0.5px; word-break: keep-all;">
                                김반장 프리미엄으로 원스톱 해결!<br>
                            </h1>
                            <h2 style="margin: 0;  font-size: 1.1rem; font-weight: 400; line-height: 1.4; letter-spacing: -0.5px; word-break: keep-all;">
                                🥇 전국 1위 4대보험 업무대행기관<br>
                                🎖️ 2025년 고용노동부 장관 표창<br>
                                🥳 2년 연속 퇴직공제대행 최우수기관
                            </h2>
         <div style="margin: 15px 0; display: flex; flex-direction: column; align-items: center; font-size: 1rem;   color: #115AC6; background-color:rgba(27, 159, 226, 0.1); padding: 12px 15px;  border-radius: 6px;">
                           <p style=" text-align: center; max-width: 400px">     김반장 프리미엄은 10,000여 개 건설사가 선택한 퇴직공제·4대보험 통합 신고 서비스로서, 10년 이상 경력의 전담팀 통해 법적 리스크를 안전하게 방어합니다.</p>
                           
                          
                          
                            
                            <ul style="list-style-type: none; margin-bottom: : 15px; padding: 0; font-size: 15px; color: #333333;">
                                <li style="margin-bottom: 8px; padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>신고 업무 대행:</strong> 입퇴사 정보만 전송하면 '모든' 신고 전담 처리
                                </li>
                                <li style="margin-bottom: 8px; padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>과태료 방지:</strong> 개정 기준 적용으로 오류 및 신고 누락 리스크 사전 차단
                                </li>
                                <li style="padding-left: 20px; text-indent: -20px;">
                                    <span style="color: #115AC6; font-weight: bold; margin-right: 4px;">✔</span><strong>고지서 검증:</strong> 매월 4대보험료 검증 및 각종 증명원 발급
                                </li>
                            </ul> </div>

  <div style="background-color: #FFFFFF; border-radius: 8px; margin-top: 10px; text-align:center; overflow: hidden;">                                <div style="padding: 25px;">
                                    <div style="color: #0E3B63; font-size:1.2rem; font-weight: 700; letter-spacing: -0.5px;">
                                        <span style="display: inline-block; background-color: rgba(27, 159, 226, 0.15); color: #1B9FE2; font-size: 0.8rem; font-weight: bold; padding: 2px 5px; border-radius: 4px; margin-right: 4px; vertical-align: middle;">업데이트</span>
                                        상용근로자 관리
                                    </div>
                                    <p style="  margin: 0; color: #6D7882; margin-top: 8px;">
                                     이제 김반장 3.0에서 상용근로자 근태까지 통합 관리하세요!  4대 보험, 급여 정산까지 김반장 하나면 해결됩니다.
                                    </p>
                                </div>
                            </div>

                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0; background-color: #115AC6;">
                            <a href="https://www.kbz.co.kr/mobile/consultation.sgn?utm_source=coldmail&utm_medium=email&utm_campaign=title_ab&utm_content=mail-b" target="_blank" style="display: block; width: 100%; box-sizing: border-box; text-align: center; color: #FFFFFF; font-size: 2rem; font-weight: bold; text-decoration: none; padding: 20px 0;">
                                 서비스 상담 신청하기 →
                            </a>
                        </td>
                    </tr>

          
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
    css: ``,
  },
  {
    id: "05",
    name: "가이드북 메일 전송 템플릿",
    html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <title>[김반장]{작성자이름}님,📘 요청하신 업무북이 도착했습니다! </title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif; color: #131416; line-height: 1.6; font-size:16px;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F5F6;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; overflow: hidden; box-shadow: 0 8px 24px rgba(19, 20, 22, 0.1);">

                    <tr>
                        <td style="background: linear-gradient(180deg, rgba(138, 218, 255, 0.40) 50%, rgba(138, 218, 255, 0.00) 100%); padding: 40px 30px; text-align: left;">
                          <div style="margin-bottom: 20px;">
    <a href="https://www.kbz.co.kr?utm_source=guidebook&utm_medium=email" target="_blank" style="text-decoration: none;">
 <img class="hand logo-symbol" onclick="location.href='/'" src="https://kbz.co.kr/resources/static/images/header/symbol.svg" alt="김반장 심볼" title="김반장 심볼">
<img class="hand logo-text" onclick="location.href='/'" src="https://kbz.co.kr/resources/static/images/header/logotype.svg" alt="김반장 로고타입"title="김반장 로고타입">

    </a>
</div>
                       
                            <h1 style="margin: 20px 0 16px 0; color: #131416; font-size: 2.1rem; font-weight: 700; line-height: 1.3; letter-spacing: -1px; word-break: keep-all;"> 건설 실무에 꼭 필요한<br>
                               <span style="color: #115AC6;">{타이틀}</span>을<br>지금 바로 확인하세요.
                            </h1>
                            <h2 style="margin: 0; color:rgba(0,0,0,0.7); font-size: 1.1rem; font-weight: 400; line-height: 1.5; word-break: keep-all;">
                              안녕하세요 <strong>{회사명} {작성자이름}</strong>님!  <br>
                              업무북은 첨부파일 또는 다운로드 버튼을 통해 확인하실 수 있어요.
                            </h2>
                          
                          
                        </td>
                    </tr>

<tr>
    <td align="center" style="padding: 0 30px 20px 30px;">
        <div style="width: 100%; height: 200px; overflow: hidden; border-radius: 8px; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0;">
            <img src="https://pluck-poppy-16281853.figma.site/_assets/v11/64aebdaf80ac9569d92f1a68e01c03098eff985f.png" 
                 title="{타이틀}" 
                 alt="{타이틀}"
                 width="100%" 
                 style="display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; border: 0;">

          
        </div>
          <div style="padding: 0; margin-top:10px; border-radius: 10px; background-color: #131416;">
                            <a href="https://www.kbz.co.kr/mobile/consultation.sgn?utm_source=guidebook&utm_medium=email" target="_blank" style="display: block; width: 100%; height:100%; box-sizing: border-box; text-align: center; color: #FFFFFF;  overflow: hiddden; font-size: 1.5rem; font-weight: bold; text-decoration: none; line-height: 2rem; padding:20px;">

                                다운로드
                            </a>
                        </div>
    </td>
</tr>

                 
                    <tr>
                        <td style=" padding: 35px 30px; color: #777777; font-size: 12px; line-height: 1.8;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                       
                                        <hr style="border: 0; border-top: 1px solid #E1E1E1; margin: 20px 0;">
                                 
                                        <p style="margin: 20px 0 0 0; text-align: left; color: #AAAAAA;">
                                          본 메일은 <strong>김반장 업무북 신청</strong>을 하신 고객님께 발송되었습니다.<br> 
                                          본 메일은 발신전용으로 회신이 되지 않습니다. <br>
                                          
                                            Copyright ⓒ 김반장. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table> </td>
        </tr>
    </table>
</body>
</html>`,
    css: ``,
  },


   {
    id: "06",
    name: "김반장 견적서 템플릿",
    html: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style></style>
</head>
<body style="margin:0;padding:0;"><!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.min.css">
  <title>[김반장] #{담당자}님, 요청하신 #{상품명}견적서를 보내드립니다</title>
  <style>
    /* 첨부 카드 호버 인터랙션 (지원 클라이언트 한정 · 미지원 시 클릭은 정상) */
    .att-card { transition: background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
    .att-card:hover { background-color:#e2eefe !important; border-color:#115AC6 !important; box-shadow:0 6px 16px rgba(17,90,198,0.20) !important; transform:translateY(-1px); }
    .att-btn { transition: background-color .18s ease; }
    .att-card:hover .att-btn { background-color:#0E4AAE !important; }
    .att-card:hover .att-arrow { transform:translateY(2px); }
    .att-arrow { display:inline-block; transition: transform .18s ease; }
  </style>
</head>
<!--
  KBZ 김반장 견적서 전송(커버) 메일 — 전 서비스 공용 · 트랜잭션/브랜드 신뢰형
  서사: 감사 인사 → 견적서(PDF) 첨부 다운로드 → 브랜드 신뢰 수치 → 문의 안내 + 담당자 서명
  치환: #{사업장명} #{담당자} #{견적파일명} #{견적파일URL} / 서명: #team #name #position #phone #email
-->
<body style="margin:0; padding:0; font-family:'Pretendard','Pretendard Variable','Apple SD Gothic Neo','Malgun Gothic','맑은 고딕',sans-serif; color:#131416; line-height:1.6; font-size:16px; word-break:keep-all;">

  <!-- 프리헤더 -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; height:0; width:0;">
    궁금하신 점은 연락처로 언제든 편하게 문의 주세요.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:20px 0;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background-color:#FFFFFF; overflow:hidden; border-radius:16px; box-shadow:0 8px 24px rgba(19,20,22,0.1);">

          <!-- ① HERO -->
          <tr>
            <td style="background:linear-gradient(180deg, rgba(138,218,255,0.40) 0%, rgba(138,218,255,0.00) 100%); background-color:#e9f6ff; padding:36px 30px 30px 30px; text-align:left;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="middle" style="padding-right:10px;">
                    <img src="https://mail.kbz.co.kr/email/images/sign/symbol.png" height="30" alt="김반장 심볼" style="display:block; border:0; outline:none; text-decoration:none;">
                  </td>
                  <td valign="middle">
                    <img src="https://mail.kbz.co.kr/email/images/sign/logotype.png" height="24" alt="김반장" style="display:block; border:0; outline:none; text-decoration:none;">
                  </td>
                </tr>
              </table>
              <h1 style="margin:20px 0 16px 0; color:#131416; font-size:2.1rem; font-weight:700; line-height:1.3; letter-spacing:-0.5px; word-break:keep-all;">
                요청하신 #{상품명}견적서를<br><span style="color:#115AC6;">보내드립니다.</span>
              </h1>
              <p style="margin:0; font-size:1.3rem; color:rgba(0,0,0,0.7); font-weight:400; line-height:1.4; letter-spacing:-0.5px; word-break:keep-all;">
                김반장을 믿고 문의해 주셔서 감사합니다.<br>상세 내역은 <b style="color:#115AC6;">첨부파일</b>을 확인해 주세요.
              </p>
            </td>
          </tr>

          <!-- ② 인사 + 첨부 안내 -->
          <tr>
            <td style="background-color:#ffffff; padding:30px 30px 8px 30px; text-align:left;">
              <p style="margin:0 0 16px 0; font-size:16px; color:#131416;">
                안녕하세요, <b>#{사업장명}</b> #{담당자}님.
              </p>
               <p style="margin:0 0 20px 0; font-size:16px; color:#3d434c;">
                문의 주신 건에 대한 <b>견적서를 첨부파일로 보내드립니다.</b> </br>
                검토 중 궁금하신 점이 있으시다면 </br> <b>#name 컨설턴트</b>에게 언제든 요청해주세요.
              </p>
            </td>
          </tr>

          <!-- ③ 신뢰 섹션 (브랜드 신뢰 · 전 서비스 공용) -->
          <tr>
            <td style="background-color:#f4f5f6; padding:28px 30px 24px 30px;">
              <h2 style="margin:0 0 16px 0; font-size:1.5rem; font-weight:700; text-align:center; letter-spacing:-0.5px; line-height:1.35; word-break:keep-all;">
                다들 <span style="color:#115AC6;">김반장</span>을 찾는 데는<br>이유가 있습니다
              </h2>

              <!-- 브랜드 수치 카드 (2행) -->
              <div style="background-color:#ffffff; border-radius:12px; padding:24px 8px;">
                <!-- 1행: 브랜드 지표 -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td width="33%" align="center" valign="top" style="width:33%;">
                      <div style="font-size:22px; line-height:1.15; color:#0E3B63; font-weight:800; letter-spacing:-0.5px;">28년<span style="font-size:15px;">+</span></div>
                      <div style="font-size:12px; line-height:1.4; color:#6D7882; margin-top:6px;">1998년부터<br>신뢰받은 서비스</div>
                    </td>
                    <td width="34%" align="center" valign="top" style="width:34%; border-left:1px solid #eceff4; border-right:1px solid #eceff4;">
                      <div style="font-size:22px; line-height:1.15; color:#0E3B63; font-weight:800; letter-spacing:-0.5px;">압도적인 <span style="color:#115AC6;">1위</span></div>
                      <div style="font-size:12px; line-height:1.4; color:#6D7882; margin-top:6px;">건설업 4대보험 BPO<br>서비스 점유율</div>
                    </td>
                    <td width="33%" align="center" valign="top" style="width:33%;">
                      <div style="font-size:22px; line-height:1.15; color:#0E3B63; font-weight:800; letter-spacing:-0.5px;">10,000<span style="font-size:15px;">개+</span></div>
                      <div style="font-size:12px; line-height:1.4; color:#6D7882; margin-top:6px;">함께하는<br> 건설사</div>
                    </td>
                  </tr>
                </table>

                <!-- 구분선 -->
                <div style="border-top:1px solid #eceff4; margin:20px 10px 18px 10px; font-size:0; line-height:0;">&nbsp;</div>

                <!-- 2행: 고객 신뢰 지표 -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td width="50%" align="center" valign="top" style="width:50%;">
                      <div style="font-size:26px; line-height:1.1; color:#115AC6; font-weight:800; letter-spacing:-0.5px;">56%</div>
                      <div style="font-size:12px; line-height:1.4; color:#6D7882; margin-top:6px;">8년 이상<br>장기 이용 건설사 비중</div>
                    </td>
                    <td width="50%" align="center" valign="top" style="width:50%; border-left:1px solid #eceff4;">
                      <div style="font-size:26px; line-height:1.1; color:#115AC6; font-weight:800; letter-spacing:-0.5px;">68%</div>
                      <div style="font-size:12px; line-height:1.4; color:#6D7882; margin-top:6px;">전체 계약 중<br>실무자 추천 재도입 비중</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- ④ 담당자 서명 -->
          <tr>
            <td style="background-color:#ffffff; border-top:1px solid #eceff4; padding:26px 30px 28px 30px; text-align:center;">
              <p style="margin:0 0 4px 0; font-size:1.5rem; font-weight:700; color:#131416; letter-spacing:-0.5px; line-height:1.35;">담당 컨설턴트</p><p></p>
     
              <div style="font-size:0; line-height:0; text-align:center;">

                <!-- 왼쪽: 로고 카드 -->
                <div style="display:inline-block; vertical-align:top; width:100%; max-width:230px; margin-bottom:18px; font-size:16px; line-height:1.5;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" height="130" bgcolor="#e9f6ff" style="border-collapse:separate; width:100%; height:130px; background-color:#e9f6ff; border-radius:14px;">
                    <tr>
                      <td align="center" valign="middle" style="padding:16px 0;">
                        <table align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; margin:0 auto;">
                          <tr>
                            <td valign="middle" style="padding-right:10px;">
                              <img src="https://mail.kbz.co.kr/email/images/sign/symbol.png" height="40" alt="김반장 심볼" style="display:block; border:0; outline:none; text-decoration:none;">
                            </td>
                            <td valign="middle">
                              <div style="font-size:12px; line-height:1.3; color:#5b6470; font-weight:500; margin-bottom:3px; white-space:nowrap;">건설노무관리 해결사</div>
                              <img src="https://mail.kbz.co.kr/email/images/sign/logotype.png" height="24" alt="김반장" style="display:block; border:0; outline:none; text-decoration:none;">
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- 오른쪽: 담당자 정보 -->
                <div style="display:inline-block; vertical-align:top; min-width:280px; max-width:100%; font-size:16px; line-height:1.5; text-align:left;">
                  <div style="padding-left:20px;">
                    <div style="margin-bottom:12px;"><span style="font-size:20px; line-height:1.3; color:#131416; font-weight:500;">#team</span><span style="font-size:20px; line-height:1.3; color:#131416; font-weight:600; letter-spacing:0.04em;"> #name</span><span style="font-size:14px; line-height:1.3; color:#5b6470; font-weight:400;"> #position</span></div>
                    <div style="font-size:14px; line-height:1.8; color:#131416;">
                      <div><span style="display:inline-block; width:72px; color:#8a929c; white-space:nowrap; vertical-align:top;">대표전화</span><span style="font-weight:500;">#phone</span></div>
                      <div><span style="display:inline-block; width:72px; color:#8a929c; white-space:nowrap; vertical-align:top;">대표메일</span><a href="mailto:#email" style="color:#131416; font-weight:500; text-decoration:none; word-break:break-all;" rel="noreferrer noopener" target="_blank">#email</a></div>
                      <div><span style="display:inline-block; width:72px; color:#8a929c; white-space:nowrap; vertical-align:top;">홈페이지</span><a href="https://www.kbz.co.kr" style="color:#131416; font-weight:500; text-decoration:none; word-break:break-all;" rel="noreferrer noopener" target="_blank">www.kbz.co.kr</a></div>
                    </div>
                  </div>
                </div>

              </div>
            </td>
          </tr>

        </table>

        <!-- 푸터 -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr>
            <td align="center" style="padding:16px 24px 4px;">
              <div style="font-size:11px; line-height:1.6; color:#a7adb8;">
                본 메일은 견적 문의에 대한 답신으로 발송되었습니다.
              </div>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`,
    css: ``,
  },

    {
    id: "07",
    name: "김반장 예상 견적서 템플릿",
    html: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style></style>
</head>
<body style="margin:0;padding:0;"><!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.min.css">
  <title>[김반장] #{담당자}님, 요청하신 #{상품명}예상견적서를 보내드립니다</title>
  <style>
    /* 첨부 카드 호버 인터랙션 (지원 클라이언트 한정 · 미지원 시 클릭은 정상) */
    .att-card { transition: background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
    .att-card:hover { background-color:#e2eefe !important; border-color:#115AC6 !important; box-shadow:0 6px 16px rgba(17,90,198,0.20) !important; transform:translateY(-1px); }
    .att-btn { transition: background-color .18s ease; }
    .att-card:hover .att-btn { background-color:#0E4AAE !important; }
    .att-card:hover .att-arrow { transform:translateY(2px); }
    .att-arrow { display:inline-block; transition: transform .18s ease; }
  </style>
</head>
<!--
  KBZ 김반장 견적서 전송(커버) 메일 — 전 서비스 공용 · 트랜잭션/브랜드 신뢰형
  서사: 감사 인사 → 견적서(PDF) 첨부 다운로드 → 브랜드 신뢰 수치 → 문의 안내 + 담당자 서명
  치환: #{사업장명} #{담당자} #{견적파일명} #{견적파일URL} / 서명: #team #name #position #phone #email
-->
<body style="margin:0; padding:0; font-family:'Pretendard','Pretendard Variable','Apple SD Gothic Neo','Malgun Gothic','맑은 고딕',sans-serif; color:#131416; line-height:1.6; font-size:16px; word-break:keep-all;">

  <!-- 프리헤더 -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; height:0; width:0;">
    궁금하신 점은 연락처로 언제든 편하게 문의 주세요.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:20px 0;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background-color:#FFFFFF; overflow:hidden; border-radius:16px; box-shadow:0 8px 24px rgba(19,20,22,0.1);">

          <!-- ① HERO -->
          <tr>
            <td style="background:linear-gradient(180deg, rgba(138,218,255,0.40) 0%, rgba(138,218,255,0.00) 100%); background-color:#e9f6ff; padding:36px 30px 30px 30px; text-align:left;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="middle" style="padding-right:10px;">
                    <img src="https://mail.kbz.co.kr/email/images/sign/symbol.png" height="30" alt="김반장 심볼" style="display:block; border:0; outline:none; text-decoration:none;">
                  </td>
                  <td valign="middle">
                    <img src="https://mail.kbz.co.kr/email/images/sign/logotype.png" height="24" alt="김반장" style="display:block; border:0; outline:none; text-decoration:none;">
                  </td>
                </tr>
              </table>
              <h1 style="margin:20px 0 16px 0; color:#131416; font-size:2.1rem; font-weight:700; line-height:1.3; letter-spacing:-0.5px; word-break:keep-all;">
                요청하신 #{상품명}<br>예상견적서를 <span style="color:#115AC6;">보내드립니다.</span>
              </h1>
              <p style="margin:0; font-size:1.3rem; color:rgba(0,0,0,0.7); font-weight:400; line-height:1.4; letter-spacing:-0.5px; word-break:keep-all;">
                <b style="color:#115AC6;">첨부파일</b>을 확인해 주세요!
              </p>
            </td>
          </tr>

          <!-- ② 인사 + 첨부 안내 -->
          <tr>
            <td style="background-color:#ffffff; padding:30px 30px 8px 30px; text-align:left;">
              <p style="margin:0 0 16px 0; font-size:16px; color:#131416;">
                안녕하세요, <b>#{사업장명}</b> #{담당자}님.
              </p>
               <p style="margin:0 0 20px 0; font-size:16px; color:#3d434c;">
               
                안내된 금액은 참고용 예상 견적이며, 
                최종 금액은 자세한 상담 후 결정됩니다.   </br> <b>아래 대표번호</b>로 언제든 연락해주세요.
              </p>
            </td>
          </tr>
           <tr>
                        <td align="center" style="background-color: #FFFFFF; padding: 10px 40px 40px 40px;">
                            
                            <div style="border: 1px solid #115AC6; border-radius: 12px; overflow: hidden; text-align: center; box-shadow: 0 4px 12px rgba(17, 90, 198, 0.1);">
                                
                                <div style="background-color: rgba(27, 159, 226, 0.1); padding: 15px 20px; border-bottom: 1px dashed #1B9FE2;">
                                    <p style="margin: 0; font-size: 15px; font-weight: bold; color: #114797;">
                                        🎁 단말기 임대 계약 시 <span style="color: #115AC6;">'커피쿠폰' 증정 이벤트</span> 진행 중!
                                    </p>
                                </div>
                                
                                <div style="background-color: #FFFFFF; padding: 25px 20px;">

                                    <a href="tel:1588-3818" style="display: inline-block; font-size: 2rem; font-weight: 900; color: #115AC6; text-decoration: none; letter-spacing: 1px;">
                                        📞 1588-3818
                                    </a>

                                </div>
                                
                            </div>

                        </td>
                    </tr>

          <!-- ③ 신뢰 섹션 (브랜드 신뢰 · 전 서비스 공용) -->
          <tr>
            <td style="background-color:#f4f5f6; padding:28px 30px 24px 30px;">
              <h2 style="margin:0 0 16px 0; font-size:1.5rem; font-weight:700; text-align:center; letter-spacing:-0.5px; line-height:1.35; word-break:keep-all;">
                다들 <span style="color:#115AC6;">김반장</span>을 찾는 데는<br>이유가 있습니다
              </h2>

              <!-- 브랜드 수치 카드 (2행) -->
              <div style="background-color:#ffffff; border-radius:12px; padding:24px 8px;">
                <!-- 1행: 브랜드 지표 -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td width="33%" align="center" valign="top" style="width:33%;">
                      <div style="font-size:22px; line-height:1.15; color:#0E3B63; font-weight:800; letter-spacing:-0.5px;">28년<span style="font-size:15px;">+</span></div>
                      <div style="font-size:12px; line-height:1.4; color:#6D7882; margin-top:6px;">1998년부터<br>신뢰받은 서비스</div>
                    </td>
                    <td width="34%" align="center" valign="top" style="width:34%; border-left:1px solid #eceff4; border-right:1px solid #eceff4;">
                      <div style="font-size:22px; line-height:1.15; color:#0E3B63; font-weight:800; letter-spacing:-0.5px;">압도적인 <span style="color:#115AC6;">1위</span></div>
                      <div style="font-size:12px; line-height:1.4; color:#6D7882; margin-top:6px;">건설업 4대보험 BPO<br>서비스 점유율</div>
                    </td>
                    <td width="33%" align="center" valign="top" style="width:33%;">
                      <div style="font-size:22px; line-height:1.15; color:#0E3B63; font-weight:800; letter-spacing:-0.5px;">10,000<span style="font-size:15px;">개+</span></div>
                      <div style="font-size:12px; line-height:1.4; color:#6D7882; margin-top:6px;">함께하는<br> 건설사</div>
                    </td>
                  </tr>
                </table>

                <!-- 구분선 -->
                <div style="border-top:1px solid #eceff4; margin:20px 10px 18px 10px; font-size:0; line-height:0;">&nbsp;</div>

                <!-- 2행: 고객 신뢰 지표 -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td width="50%" align="center" valign="top" style="width:50%;">
                      <div style="font-size:26px; line-height:1.1; color:#115AC6; font-weight:800; letter-spacing:-0.5px;">56%</div>
                      <div style="font-size:12px; line-height:1.4; color:#6D7882; margin-top:6px;">8년 이상<br>장기 이용 건설사 비중</div>
                    </td>
                    <td width="50%" align="center" valign="top" style="width:50%; border-left:1px solid #eceff4;">
                      <div style="font-size:26px; line-height:1.1; color:#115AC6; font-weight:800; letter-spacing:-0.5px;">68%</div>
                      <div style="font-size:12px; line-height:1.4; color:#6D7882; margin-top:6px;">전체 계약 중<br>실무자 추천 재도입 비중</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

    

        <!-- 푸터 -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr>
            <td align="center" style="padding:16px 24px 4px;">
              <div style="font-size:11px; line-height:1.6; color:#a7adb8;">
                본 메일은 견적 문의에 대한 답신으로 발송되었습니다.
              </div>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`,
    css: ``,
  },
  
];