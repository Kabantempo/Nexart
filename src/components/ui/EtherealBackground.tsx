'use client';

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

interface BlobConfig {
  x: number;
  y: number;
  size: number;
  color: [string, string];
  duration: number;
  delay: number;
  scaleFrom: number;
  scaleTo: number;
}

const BLOBS: BlobConfig[] = [
  {
    x: -W * 0.2,
    y: -H * 0.1,
    size: W * 0.85,
    color: ['#818cf8', '#6366f1'],
    duration: 6000,
    delay: 0,
    scaleFrom: 0.9,
    scaleTo: 1.15,
  },
  {
    x: W * 0.35,
    y: H * 0.45,
    size: W * 0.7,
    color: ['#a5b4fc', '#818cf8'],
    duration: 7500,
    delay: 800,
    scaleFrom: 1.0,
    scaleTo: 1.2,
  },
  {
    x: -W * 0.1,
    y: H * 0.55,
    size: W * 0.6,
    color: ['#c7d2fe', '#a5b4fc'],
    duration: 9000,
    delay: 1600,
    scaleFrom: 0.85,
    scaleTo: 1.1,
  },
  {
    x: W * 0.5,
    y: -H * 0.05,
    size: W * 0.55,
    color: ['#e0e7ff', '#c7d2fe'],
    duration: 5500,
    delay: 400,
    scaleFrom: 1.05,
    scaleTo: 0.85,
  },
];

function Blob({ config }: { config: BlobConfig }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(1, {
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [config.scaleFrom, config.scaleTo],
    );
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.55, 0.75, 0.55]);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: config.x,
          top: config.y,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          overflow: 'hidden',
        },
        animStyle,
      ]}
    >
      <LinearGradient
        colors={config.color}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

interface EtherealBackgroundProps {
  children?: React.ReactNode;
  intensity?: number; // 0–1, contrôle l'opacité globale
}

export default function EtherealBackground({
  children,
  intensity = 0.18,
}: EtherealBackgroundProps) {
  return (
    <View style={s.container}>
      {/* Fond blanc */}
      <View style={[s.base, { backgroundColor: '#f8fafc' }]} />

      {/* Blobs animés */}
      <View style={[s.blobLayer, { opacity: intensity }]}>
        {BLOBS.map((b, i) => (
          <Blob key={i} config={b} />
        ))}
      </View>

      {/* Voile blanc pour adoucir */}
      <View style={s.veil} />

      {/* Contenu */}
      <View style={s.content}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  base:      { ...StyleSheet.absoluteFillObject },
  blobLayer: { ...StyleSheet.absoluteFillObject },
  veil:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(248,250,252,0.45)' },
  content:   { flex: 1 },
});
