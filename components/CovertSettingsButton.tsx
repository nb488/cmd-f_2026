import { TouchableOpacity, Image, StyleSheet } from 'react-native';

interface CovertSettingsButtonProps {
  onPress: () => void;
  size?: number;
  opacity?: number;
}

export default function CovertSettingsButton({ 
  onPress, 
  size = 36, 
  opacity = 1 
}: CovertSettingsButtonProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8} 
      style={styles.buttonContainer}
      accessibilityLabel="Weather Map Layers"
      accessibilityRole="button"
    >
      <Image 
        source={require('../assets/images/hand_signal_new.png')} 
        style={{
          width: size,
          height: size,
          opacity: opacity,
          borderRadius: size / 2,
        }} 
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background to emphasize the round shape
    overflow: 'hidden'
  }
});
