const express = require('express');
const cors = require('cors');
const Client = require('@alicloud/dysmsapi20170525').default;
const OpenApi = require('@alicloud/openapi-client');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 创建阿里云客户端
const createClient = () => {
  const config = new OpenApi.Config({
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
  });
  config.endpoint = 'dysmsapi.aliyuncs.com';
  return new Client(config);
};

// 发送短信接口
app.post('/api/send-sms', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({
      success: false,
      message: '手机号和验证码不能为空'
    });
  }

  try {
    const client = createClient();
    const result = await client.sendSms({
      phoneNumbers: phone,
      signName: process.env.ALIYUN_SMS_SIGN_NAME,
      templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
      templateParam: JSON.stringify({
        code: code,
        time: "5"
      })
    });

    res.json({
      success: true,
      message: '发送成功',
      requestId: result.body.requestId,
      bizId: result.body.bizId
    });
  } catch (error) {
    console.error('发送短信失败:', error);
    res.status(500).json({
      success: false,
      message: '发送失败',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 