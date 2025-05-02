const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../assets/icons');
const outputPath = path.join(__dirname, '../src/constants/icons.ts');

// 读取所有PNG文件
const files = fs.readdirSync(iconsDir)
  .filter(file => file.endsWith('.png'));

// 对图标进行分类
const categorizeIcons = (files) => {
  const tabBarIcons = new Set(['teams', 'news', 'profile']);
  const gameIcons = new Set(['ball', 'field', 'shoot', 'kickoff']);
  
  const categories = {
    tabBar: {},
    game: {},
    other: {} // 未分类的图标
  };

  // 处理底部导航图标（带active状态的）
  files.forEach(file => {
    const baseName = file.replace('.png', '');
    const isActive = baseName.endsWith('_active');
    const mainName = isActive ? baseName.replace('_active', '') : baseName;

    if (tabBarIcons.has(mainName)) {
      if (!categories.tabBar[mainName]) {
        categories.tabBar[mainName] = {};
      }
      if (isActive) {
        categories.tabBar[mainName].active = `require('../../assets/icons/${file}')`;
      } else {
        categories.tabBar[mainName].inactive = `require('../../assets/icons/${file}')`;
      }
    } else if (gameIcons.has(mainName)) {
      categories.game[mainName] = `require('../../assets/icons/${file}')`;
    } else if (!isActive) { // 其他未分类的图标（非active版本）
      categories.other[mainName] = `require('../../assets/icons/${file}')`;
    }
  });

  return categories;
};

// 生成TypeScript类型定义
const generateTypes = (categories) => {
  const types = [
    'export type IconsType = {',
    '  tabBar: {',
    '    [key: string]: {',
    '      active: any;',
    '      inactive: any;',
    '    };',
    '  };',
    '  game: {',
    '    [key: string]: any;',
    '  };',
    '  other: {',
    '    [key: string]: any;',
    '  };',
    '};',
    ''
  ].join('\n');

  return types;
};

// 生成图标对象
const generateIconsObject = (categories) => {
  const tabBarSection = Object.entries(categories.tabBar)
    .map(([name, states]) => {
      return `    ${name}: {\n      active: ${states.active},\n      inactive: ${states.inactive},\n    }`;
    })
    .join(',\n');

  const gameSection = Object.entries(categories.game)
    .map(([name, path]) => `    ${name}: ${path}`)
    .join(',\n');

  const otherSection = Object.entries(categories.other)
    .map(([name, path]) => `    ${name}: ${path}`)
    .join(',\n');

  return `export const icons = {
  // 底部导航栏图标
  tabBar: {
${tabBarSection}
  },

  // 游戏相关图标
  game: {
${gameSection}
  }${Object.keys(categories.other).length ? `,

  // 其他图标
  other: {
${otherSection}
  }` : ''}
} as const;

export default icons;`;
};

// 主执行逻辑
const categories = categorizeIcons(files);
const types = generateTypes(categories);
const iconsObject = generateIconsObject(categories);

// 写入文件
fs.writeFileSync(outputPath, `${types}\n${iconsObject}\n`);

console.log('✨ icons.ts 已生成，包含:');
console.log(`📱 ${Object.keys(categories.tabBar).length} 个底部导航图标`);
console.log(`🎮 ${Object.keys(categories.game).length} 个游戏相关图标`);
console.log(`📦 ${Object.keys(categories.other).length} 个其他图标`); 