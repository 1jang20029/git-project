// netlify/functions/send-sms.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const { phoneNumbers, message } = JSON.parse(event.body);

    // Aligo 인증 정보
    const ALIGO_USER_ID  = 'groria123';
    const ALIGO_API_KEY  = '43b9dx0kx8k9x217sj4euwtyzcil6o2g';
    const ALIGO_SENDER   = '15442525';  // 발급받은 서비스 전용 번호
    const ALIGO_ENDPOINT = 'https://apis.aligo.in/send/';

    // 하이픈 제거 함수
    const normalize = no => no.replace(/\D/g, '');

    // receiver: 배열 or 단일처리
    const receiver = Array.isArray(phoneNumbers)
      ? phoneNumbers.map(normalize).join(',')
      : normalize(phoneNumbers);

    // form-data 준비
    const params = new URLSearchParams({
      user_id:     ALIGO_USER_ID,
      key:         ALIGO_API_KEY,
      sender:      ALIGO_SENDER,
      receiver,
      msg:         message,
      testmode_yn: 'N'
    });

    // Aligo API 호출
    const res = await fetch(ALIGO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const data = await res.json();

    if (data.result_code === '1') {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: data.message })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
