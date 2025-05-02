import { Text as RNText } from 'react-native';

const ProxyText = (props) => {
  const appliedStyle = Array.isArray(props.style)
    ? Object.assign({}, ...props.style)
    : props.style || {};

  const actualFont = appliedStyle.fontFamily || Text.defaultProps?.style?.fontFamily || '未指定';
  const contentText = typeof props.children === 'string' ? props.children : '【组件嵌套】';

  console.log(`🕵️ Text渲染: "${contentText}" → 字体: ${actualFont}`);

  return <RNText {...props} />;
};

global.Text = ProxyText;

console.log('🔥 JS 启动了！');
console.log("👉 AppRegistry 注册开始");

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

console.log("📦 app.json 中 name:", appName);

AppRegistry.registerComponent(appName, () => App);

console.log("✅ AppRegistry 注册完成！");

try {
  console.log("检查是否正确导入 App 组件...");
  if (!App) {
    throw new Error("App 组件未正确导入，请检查 App.js 文件");
  } else {
    console.log("App 组件导入成功！");
  }
} catch (error) {
  console.error("App 组件检查失败:", error);
}


try {
  console.log('尝试获取运行路径:');
  console.log('当前运行目录 (process.cwd):', process.cwd?.() || '无法获取运行目录');
  console.log('当前脚本目录 (__dirname):', typeof __dirname !== 'undefined' ? __dirname : '无法获取脚本目录');
} catch (error) {
  console.error('路径检查失败:', error);
}
