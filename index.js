import { AppRegistry } from 'react-native';
import App from './App';
import appConfig from './app.json';

console.log("index.js 正在加载...");

try {
  const appName = "main"; // 确保这是字符串 "main"
  console.log("从 app.json 读取的根组件名称:", appConfig?.expo?.name);

  if (appName !== appConfig?.expo?.name) {
    console.error(
      `错误：app.json 中的 name 属性与注册名称不一致。app.json: ${appConfig?.expo?.name}, 注册名: ${appName}`
    );
  }

  console.log("尝试注册根组件...");
  AppRegistry.registerComponent("main", () => App);
  console.log("根组件注册成功！");
} catch (error) {
  console.error("注册组件失败:", error);
}

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
