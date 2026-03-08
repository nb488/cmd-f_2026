import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface WeatherIconProps {
  name: string;
  size: number;
}

export default function WeatherIcon({ name, size }: WeatherIconProps) {
  // Partly sunny
  if (name === 'partly-sunny' || name === 'partly-sunny-outline') {
    const sunSize = size * 0.75; 
    const cloudSize = size * 0.85;
    return (
      <View style={[styles.layeredContainer, { width: size, height: size }]}>
        <Ionicons 
          name="sunny" 
          size={sunSize} 
          color="#ffcc00" 
          style={[styles.layeredItem, { left: 0, top: 0, zIndex: 1 }]} 
        />
        <Ionicons 
          name="cloud" 
          size={cloudSize} 
          color="#ffffff" 
          style={[styles.layeredItem, { bottom: size * 0.05, right: -size * 0.05, zIndex: 2 }]} 
        />
      </View>
    );
  }

  // Cloudy
  if (name === 'cloudy' || name === 'cloudy-outline') {
    return <Ionicons name="cloud" size={size} color="#ffffff" />;
  }

  // Pure sunny or clear night
  if (name === 'sunny' || name === 'clear' || name === 'sunny-outline') {
    return <Ionicons name={name as any} size={size} color="#ffcc00" />;
  }

  if (name === 'moon' || name === 'moon-outline') {
    return <Ionicons name={name as any} size={size} color="#b6c0c5" />;
  }

  // Rain / Water / Thunderstorm / Snow
  if (name.includes('rain') || name.includes('water') || name.includes('thunderstorm') || name.includes('snow')) {
    const isSnow = name.includes('snow');
    const isThunder = name.includes('thunderstorm');

    // iOS style rain: slanted light-blue pills
    const renderRainDrops = () => (
      <View style={[styles.layeredItem, { bottom: -size * 0.15, zIndex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', width: size }]}>
        {/* Drop 1 (Shorter, higher) */}
        <View style={{ width: size * 0.05, height: size * 0.15, backgroundColor: '#5ac8fa', borderRadius: size * 0.025, transform: [{ rotate: '15deg' }], marginTop: size * 0.02, marginRight: size * 0.08 }} />
        {/* Drop 2 (Longer, lower) */}
        <View style={{ width: size * 0.05, height: size * 0.2, backgroundColor: '#5ac8fa', borderRadius: size * 0.025, transform: [{ rotate: '15deg' }], marginTop: size * 0.1, marginRight: size * 0.08 }} />
        {/* Drop 3 (Shorter, higher) */}
        <View style={{ width: size * 0.05, height: size * 0.15, backgroundColor: '#5ac8fa', borderRadius: size * 0.025, transform: [{ rotate: '15deg' }], marginTop: size * 0.02, marginRight: size * 0.08 }} />
        {/* Drop 4 (Longer, lower) */}
        <View style={{ width: size * 0.05, height: size * 0.2, backgroundColor: '#5ac8fa', borderRadius: size * 0.025, transform: [{ rotate: '15deg' }], marginTop: size * 0.1 }} />
      </View>
    );

    const renderSnowFlakes = () => (
      <View style={[styles.layeredItem, { bottom: -size * 0.05, zIndex: 1, flexDirection: 'row', justifyContent: 'center', width: size }]}>
        <FontAwesome5 name="snowflake" size={size * 0.3} color="#ffffff" style={{ marginRight: size * 0.1, marginTop: size * 0.05 }} />
        <FontAwesome5 name="snowflake" size={size * 0.25} color="#ffffff" style={{ marginLeft: size * 0.1 }} />
      </View>
    );

    return (
      <View style={[styles.layeredContainer, { width: size, height: size }]}>
        {/* Base cloud is ALWAYS white */}
        <Ionicons 
          name="cloud" 
          size={size * 0.85} 
          color="#ffffff" 
          style={[styles.layeredItem, { top: 0, zIndex: 2 }]} 
        />
        
        {/* Precipitation elements below the cloud */}
        {!isSnow && !isThunder && renderRainDrops()}
        
        {isSnow && renderSnowFlakes()}

        {isThunder && (
          <>
            <View style={[styles.layeredItem, { bottom: size * 0.1, zIndex: 3 }]}>
               <Ionicons name="flash" size={size * 0.5} color="#ffcc00" />
            </View>
            <View style={[styles.layeredItem, { bottom: -size * 0.02, zIndex: 1, flexDirection: 'row', justifyContent: 'center', width: size }]}>
                <View style={{ width: size * 0.06, height: size * 0.25, backgroundColor: '#5ac8fa', borderRadius: size * 0.03, transform: [{ rotate: '15deg' }], marginTop: size * 0.1, marginRight: size * 0.15 }} />
                <View style={{ width: size * 0.06, height: size * 0.25, backgroundColor: '#5ac8fa', borderRadius: size * 0.03, transform: [{ rotate: '15deg' }], marginLeft: size * 0.15 }} />
            </View>
          </>
        )}
      </View>
    );
  }

  // Default block (clouds or unknown)
  return <Ionicons name={name as any} size={size} color="#ffffff" />;
}

const styles = StyleSheet.create({
  layeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  layeredItem: {
    position: 'absolute',
  }
});
