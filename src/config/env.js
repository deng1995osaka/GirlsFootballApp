// 环境变量配置
const ENV = {
  dev: {
    // 开发环境配置
    SMS: {
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      signName: '女孩踢球',
      templateCode: 'SMS_154950909'
    }
  },
  prod: {
    // 生产环境配置
    SMS: {
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      signName: process.env.ALIYUN_SMS_SIGN_NAME,
      templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE
    }
  }
};

// 获取当前环境的配置
const getEnvConfig = () => {
  return __DEV__ ? ENV.dev : ENV.prod;
};

export default getEnvConfig(); 