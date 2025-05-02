const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { exit } = require('process');

// 定义颜色
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// 工具函数
const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.bright}${colors.cyan}▶ ${msg}${colors.reset}`)
};

const execCommand = (command, errorMessage) => {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log.error(errorMessage || `命令执行失败: ${command}`);
    log.error(error.message);
    return false;
  }
};

// 清理函数
const cleanBuildFiles = () => {
  log.step('清理旧的构建文件');
  
  const pathsToClean = [
    'ios/build',
    'ios/Pods',
    'ios/DerivedData',
    'ios/main.jsbundle',
    'ios/main.jsbundle.map',
    'ios/assets'
  ];

  pathsToClean.forEach(p => {
    const fullPath = path.join(process.cwd(), p);
    if (fs.existsSync(fullPath)) {
      try {
        if (fs.lstatSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
        log.success(`已删除: ${p}`);
      } catch (error) {
        log.warning(`无法删除 ${p}: ${error.message}`);
      }
    }
  });
};

// 生成资源
const generateAssets = () => {
  log.step('生成资源文件');
  
  // 生成图标映射
  if (!execCommand('npm run gen:icons', '生成图标映射失败')) {
    return false;
  }
  log.success('图标映射已更新');

  return true;
};

// 安装依赖
const installDependencies = () => {
  log.step('安装依赖');
  
  // 安装 npm 依赖
  if (!execCommand('npm install', 'npm 依赖安装失败')) {
    return false;
  }
  
  // 安装 CocoaPods
  if (!execCommand('cd ios && pod install && cd ..', 'CocoaPods 安装失败')) {
    return false;
  }

  log.success('所有依赖已安装');
  return true;
};

// 生成 bundle
const generateBundle = () => {
  log.step('生成 React Native bundle');

  const bundleCommand = 
    'npx react-native bundle ' +
    '--platform ios ' +
    '--dev false ' +
    '--entry-file index.js ' +
    '--bundle-output ios/main.jsbundle ' +
    '--assets-dest ios/assets';

  if (!execCommand(bundleCommand, 'Bundle 生成失败')) {
    return false;
  }

  log.success('Bundle 已生成');
  return true;
};

// 主函数
const main = async () => {
  log.info('开始构建发布版本...\n');

  // 1. 清理旧文件
  cleanBuildFiles();

  // 2. 生成资源
  if (!generateAssets()) {
    exit(1);
  }

  // 3. 安装依赖
  if (!installDependencies()) {
    exit(1);
  }

  // 4. 生成 bundle
  if (!generateBundle()) {
    exit(1);
  }

  log.step('构建完成');
  log.info('现在您可以在 Xcode 中打开项目并构建发布版本');
  log.info('路径: ios/GirlsFootballApp.xcworkspace');
};

// 运行脚本
main().catch(error => {
  log.error('构建过程中发生错误:');
  log.error(error.message);
  exit(1);
}); 