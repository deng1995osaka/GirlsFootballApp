// 直接使用线上接口地址
const API_BASE_URL = 'https://girlsfootball.fun/api';

// 发送短信验证码
export const sendSmsCode = async (phone, code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, code })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('发送短信验证码失败:', error);
    throw error;
  }
}; 