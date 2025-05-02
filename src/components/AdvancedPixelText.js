import React from 'react';
import { Text, Platform } from 'react-native';
import { fonts } from '@styles/main';

/**
 * 高级像素风格文本组件，可以处理中英混合文本、表情符号和特殊字符
 * @param {Object} props - 组件属性
 * @param {string|React.ReactNode} props.children - 文本内容
 * @param {Object} props.style - 文本样式
 * @param {string} props.pixelFont - 像素风格字体名称
 * @param {string} props.chineseFont - 中文字体名称
 * @param {boolean} props.splitText - 是否将文本拆分为单个字符
 * @param {Object} props.textProps - 传递给内部 Text 组件的属性
 */
const AdvancedPixelText = ({
  children,
  style,
  pixelFont = fonts.primary,
  chineseFont = Platform.select({
    ios: 'PingFang SC',
    android: 'NotoSansCJK-Regular',
  }),
  splitText = true,
  textProps = {},
  ...rest
}) => {
  // 如果不需要拆分文本，直接使用像素字体
  if (!splitText) {
    return (
      <Text
        style={[
          { fontFamily: pixelFont },
          style,
        ]}
        {...textProps}
        {...rest}
      >
        {children}
      </Text>
    );
  }

  // 如果 children 不是字符串，直接渲染
  if (typeof children !== 'string') {
    return (
      <Text
        style={[
          { fontFamily: pixelFont },
          style,
        ]}
        {...textProps}
        {...rest}
      >
        {children}
      </Text>
    );
  }

  // 将文本拆分为字符组，处理表情符号和特殊字符
  const renderText = () => {
    // 使用正则表达式匹配中文字符、表情符号和其他字符
    const segments = [];
    let currentSegment = '';
    let currentType = null;

    // 遍历字符串中的每个字符
    for (let i = 0; i < children.length; i++) {
      const char = children[i];
      
      // 检查字符类型
      let charType;
      if (/[\u4e00-\u9fa5]/.test(char)) {
        charType = 'chinese';
      } else if (/[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(char + (children[i + 1] || ''))) {
        // 处理表情符号（UTF-16 代理对）
        charType = 'emoji';
        i++; // 跳过下一个字符，因为它是表情符号的一部分
      } else {
        charType = 'other';
      }

      // 如果字符类型改变，创建新的段落
      if (charType !== currentType) {
        if (currentSegment) {
          segments.push({
            text: currentSegment,
            type: currentType,
          });
        }
        currentSegment = char;
        currentType = charType;
      } else {
        currentSegment += char;
      }
    }

    // 添加最后一个段落
    if (currentSegment) {
      segments.push({
        text: currentSegment,
        type: currentType,
      });
    }

    // 渲染段落
    return segments.map((segment, index) => {
      let fontFamily;
      switch (segment.type) {
        case 'chinese':
          fontFamily = chineseFont;
          break;
        case 'emoji':
          // 表情符号使用系统默认字体
          fontFamily = undefined;
          break;
        default:
          fontFamily = pixelFont;
      }

      return (
        <Text
          key={index}
          style={{ fontFamily }}
        >
          {segment.text}
        </Text>
      );
    });
  };

  return (
    <Text style={style} {...textProps} {...rest}>
      {renderText()}
    </Text>
  );
};

export default AdvancedPixelText; 