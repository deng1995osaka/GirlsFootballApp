import React from 'react';
import { StyleSheet, ImageBackground } from 'react-native';

const Background = ({ children }) => {
    // Base64 背景图像
    const base64Image = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAA0VXHyAAAAM0lEQVQ4EWNkYGD4D8TIgBGZQ4jNREgBIfmBN4CQC0eCPDFxjjedDHw0UuyCkRDPhPwIABjaAg94YMjJAAAAAElFTkSuQmCC';

    return (
        <ImageBackground 
            source={{ uri: base64Image }}
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