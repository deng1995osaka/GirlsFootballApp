import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@styles/main';
import Svg, { Rect, Pattern, Defs } from 'react-native-svg';
import { normalize, wp, hp } from '@utils/responsive';

export const SHIRT_PATTERN = [
  [0,0,0,1,1,0,0,0,0,1,1,0,0,0],
  [0,0,1,0,0,1,1,1,1,0,0,1,0,0],
  [0,1,0,0,0,0,0,0,0,0,0,0,1,0],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,1,0,0,1],
  [0,1,1,1,0,0,0,0,0,0,1,1,1,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0]
];

const UniformRenderer = ({ pixels, style }) => {
  if (!pixels) return null;

  const pixelSize = 1;
  const SHIRT_HEIGHT = SHIRT_PATTERN.length;
  const SHIRT_WIDTH = SHIRT_PATTERN[0].length;

  const MARGIN_TOP = 2;
  const MARGIN_BOTTOM = 2;
  const MARGIN_LEFT = 1;
  const MARGIN_RIGHT = 1;

  const isInsideShirt = (row, col) => {
    if (row === 5) return true;
    if (SHIRT_PATTERN[row][col] === 1) return false;
    
    let crossings = 0;
    for (let i = 0; i <= col; i++) {
      if (SHIRT_PATTERN[row][i] === 1) crossings++;
    }
    return crossings % 2 === 1;
  };

  return (
    <View style={[{ width: '100%', aspectRatio: (SHIRT_WIDTH + MARGIN_LEFT + MARGIN_RIGHT) / (SHIRT_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM) }, style]}>
      <Svg
        width="100%"
        height="100%"
        style={{ flex: 1 }}
        viewBox={`${-MARGIN_LEFT + 1} ${-MARGIN_TOP} ${SHIRT_WIDTH + MARGIN_LEFT + MARGIN_RIGHT} ${SHIRT_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM}`}
        preserveAspectRatio="xMidYMin meet"
      >
        <Defs>
          <Pattern id="checkerboard" width="2" height="2" patternUnits="userSpaceOnUse">
            <Rect x="0" y="0" width="1" height="1" fill="#FFFFFF" />
            <Rect x="1" y="0" width="1" height="1" fill="#C2C2C2" />
            <Rect x="0" y="1" width="1" height="1" fill="#C2C2C2" />
            <Rect x="1" y="1" width="1" height="1" fill="#FFFFFF" />
          </Pattern>
        </Defs>

        <Rect 
          x={-MARGIN_LEFT + 1}
          y={-MARGIN_TOP}
          width={SHIRT_WIDTH + MARGIN_LEFT + MARGIN_RIGHT}
          height={SHIRT_HEIGHT + MARGIN_TOP + MARGIN_BOTTOM}
          fill="url(#checkerboard)"
        />

        {SHIRT_PATTERN.map((row, i) =>
          row.map((cell, j) => {
            if (cell === 1 || isInsideShirt(i, j)) {
              const color = pixels?.[i]?.[j] || '#F5F4E2';
              return (
                <Rect
                  key={`pixel-${i}-${j}`}
                  x={(j + MARGIN_LEFT) * pixelSize}
                  y={i * pixelSize}
                  width={pixelSize}
                  height={pixelSize}
                  fill={color}
                />
              );
            }
            return null;
          })
        )}

        

        
      </Svg>
    </View>
  );
};

export default UniformRenderer; 