import { getEnvConfig } from '../config/env';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // 开发环境
  : 'https://girlsfootball.fun/api';  // 生产环境 - 使用域名和 HTTPS

// 发送短信验证码
export const sendSmsCode = async (phone, code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '发送失败');
    }

    return await response.json();
  } catch (error) {
    console.error('发送短信失败:', error);
    throw error;
  }
}; 