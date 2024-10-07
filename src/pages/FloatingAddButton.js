import React, { useEffect, useRef, useCallback } from 'react';
import { TouchableOpacity, Image, StyleSheet, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

// Calculate responsive size
const responsiveWidth = (percent) => (width * percent) / 100;
const responsiveHeight = (percent) => (height * percent) / 100;

const FloatingAddButton = ({ onPress }) => {
    const buttonScale = useRef(new Animated.Value(1)).current;
    const pressAnimationScale = useRef(new Animated.Value(1)).current;

    // Press animation
    const handlePress = useCallback(() => {
        // Scale in
        Animated.timing(pressAnimationScale, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            // Scale out
            Animated.timing(pressAnimationScale, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start(() => {
                // Call the original onPress after animation
                onPress();
            });
        });
    }, [onPress, pressAnimationScale]);

    // Combine both scales
    const combinedScale = Animated.multiply(buttonScale, pressAnimationScale);

    return (
        <TouchableOpacity onPress={handlePress}>
            <Animated.View style={[styles.fab, { transform: [{ scale: combinedScale }] }]}>
                <Image
                    source={require('../../assets/plus.png')}
                    style={styles.fabIcon}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: responsiveWidth(12),  // Responsive right positioning
        bottom: responsiveHeight(5.5), // Responsive bottom positioning
        width: responsiveWidth(5),
        height: responsiveWidth(5),
        borderRadius: responsiveWidth(4),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4C24FF',
    },
    fabIcon: {
        width: responsiveWidth(14),
        height: responsiveWidth(14),
    },
});

export default FloatingAddButton;