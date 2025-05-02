import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { colors } from '@styles/main';

const Background = ({ children, backgroundType = 'default' }) => {
    // 默认背景图像
    const defaultBackground = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAA0VXHyAAAAM0lEQVQ4EWNkYGD4D8TIgBGZQ4jNREgBIfmBN4CQC0eCPDFxjjedDHw0UuyCkRDPhPwIABjaAg94YMjJAAAAAElFTkSuQmCC';
    
    // 网格背景图像
    const gridBackground = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAKKADAAQAAAABAAAAKAAAAAB65masAAAAmElEQVRYCe3VwQqFIBhE4Wwt+P6PKbi/d1tnE8OP4OK0aqIx+ZRs18c15/w9XxljtGfefX/v/kB1fCeoYFWg2ncPVgUb/3MccK31etR7f+XdwSWuCh8v+Hmuco96FmNPHL/EThArFkcFYzIUFARIHBWMyVBQECBxVDAmQ0FBgMRRwZgMBQUBEkcFYzIUFARIHBWMyVA4XvAPunQPIODvkoIAAAAASUVORK5CYII=';

    const backgroundImage = backgroundType === 'grid' ? gridBackground : defaultBackground;

    return (
        <ImageBackground 
            source={{ uri: backgroundImage }}
            style={styles.container}
            resizeMode="repeat"
        >
            {children}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Background; 