import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import Video from 'react-native-video';

const { width } = Dimensions.get('window');
const getResponsiveSize = (percent) => (width * percent) / 100;

const ExerciseVideo = ({
    id,
    isVisible = false,
    size = 20, // Size as percentage of screen width
    borderRadius = 4,
    showRetryButton = true,
    onError,
    onLoad,
    customStyles = {}
}) => {
    const videoRef = useRef(null);
    const [state, setState] = useState({
        loading: true,
        error: null,
        retryCount: 0,
        key: 0,
        paused: !isVisible
    });

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    useEffect(() => {
        setState(prev => ({ ...prev, paused: !isVisible }));

        if (!isVisible && videoRef.current) {
            videoRef.current.seek(0);
        }
    }, [isVisible]);

    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.seek(0);
            }
        };
    }, []);

    const handleLoadStart = useCallback(() => {
        setState(prev => ({ ...prev, loading: true, error: null }));
    }, []);

    const handleLoad = useCallback(() => {
        setState(prev => ({ ...prev, loading: false, error: null, retryCount: 0 }));
        onLoad?.();
    }, [onLoad]);

    const handleError = useCallback((error) => {
        console.error(`Error loading video ${id}:`, JSON.stringify(error));

        setState(prev => {
            const newRetryCount = prev.retryCount + 1;

            if (newRetryCount <= MAX_RETRIES) {
                setTimeout(() => {
                    setState(prev => ({
                        ...prev,
                        key: prev.key + 1,
                        loading: true,
                        error: null
                    }));
                }, RETRY_DELAY * newRetryCount);
            }

            return {
                ...prev,
                loading: false,
                error,
                retryCount: newRetryCount
            };
        });

        onError?.(error);
    }, [id, onError]);

    const handleRetry = useCallback(() => {
        setState(prev => ({
            ...prev,
            key: prev.key + 1,
            loading: true,
            error: null,
            retryCount: 0
        }));
    }, []);

    const responsiveSize = getResponsiveSize(size);
    const containerStyle = {
        width: responsiveSize,
        height: responsiveSize,
        borderRadius: getResponsiveSize(borderRadius),
        ...customStyles
    };

    if (state.error && state.retryCount >= MAX_RETRIES) {
        return (
            <View style={[styles.videoContainer, containerStyle]}>
                <View style={styles.fallbackContainer}>
                    <Text style={styles.fallbackText}>Unable to load video</Text>
                    {showRetryButton && (
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={handleRetry}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.videoContainer, containerStyle]}>
            <Video
                key={state.key}
                ref={videoRef}
                source={{ uri: `file:///android_asset/videos/${id}.mp4` }}
                style={styles.video}
                resizeMode="cover"
                repeat={true}
                paused={state.paused}
                onLoadStart={handleLoadStart}
                onLoad={handleLoad}
                onError={handleError}
                bufferConfig={{
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000
                }}
                reportBandwidth={true}
                textTracks={[]}
                audioOnly={false}
                maxBitRate={2000000}
            />
            {state.loading && (
                <View style={[styles.overlay, styles.loaderOverlay]}>
                    <ActivityIndicator size="small" color="#4C24FF" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    videoContainer: {
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#333',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333',
    },
    fallbackText: {
        color: '#FFF',
        fontSize: 12,
        marginBottom: 8,
    },
    retryButton: {
        backgroundColor: '#4C24FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    retryButtonText: {
        color: '#FFF',
        fontSize: 12,
    }
});

export default React.memo(ExerciseVideo);