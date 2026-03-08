import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from '../utils/storage';

export default function PinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkPin = useCallback(async () => {
    try {
      const storedPin = await SecureStore.getItemAsync('app_settings_pin');
      if (!storedPin) {
        // First time access, no pin required. Go straight to settings.
        router.replace('/settings');
      } else {
        setSavedPin(storedPin);
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkPin();
  }, [checkPin]);

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (newPin === savedPin) {
          router.replace('/settings');
        } else {
          Alert.alert('Error', 'Incorrect PIN');
          setPin('');
        }
      }
    }
  };



  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter PIN</Text>
      
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.dot, pin.length > index && styles.dotFilled]} />
        ))}
      </View>

      <View style={styles.keypad}>
        {['1','2','3','4','5','6','7','8','9','','0','<'].map((key, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.key, key === '' && styles.keyEmpty]}
            onPress={() => {
              if (key === '<') setPin(pin.slice(0, -1));
              else if (key !== '') handlePress(key);
            }}
            disabled={key === ''}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 24, marginBottom: 40 },
  dotsContainer: { flexDirection: 'row', gap: 20, marginBottom: 60 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#fff' },
  dotFilled: { backgroundColor: '#fff' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, justifyContent: 'space-between' },
  key: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  keyEmpty: { backgroundColor: 'transparent' },
  keyText: { color: '#fff', fontSize: 32 },
  backBtn: { marginTop: 40, padding: 20 },
  backText: { color: '#888', fontSize: 18 }
});
