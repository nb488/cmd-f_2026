import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from '../../utils/storage';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [contacts, setContacts] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedPin = await SecureStore.getItemAsync('app_settings_pin');
    const savedContacts = await SecureStore.getItemAsync('emergency_contacts');
    const savedMessage = await SecureStore.getItemAsync('emergency_message');

    if (savedPin) setPin(savedPin);
    if (savedContacts) {
      const parsed = JSON.parse(savedContacts);
      setContacts(parsed.join(', '));
    }
    if (savedMessage) setMessage(savedMessage);
  };

  const saveSettings = async () => {
    try {
      if (pin) {
        if (pin.length !== 4) {
          Alert.alert('Error', 'PIN must be exactly 4 digits');
          return;
        }
        await SecureStore.setItemAsync('app_settings_pin', pin);
      } else {
        await SecureStore.deleteItemAsync('app_settings_pin');
      }
      
      const contactsArray = contacts.split(',').map(c => c.trim()).filter(c => c);
      await SecureStore.setItemAsync('emergency_contacts', JSON.stringify(contactsArray));
      
      if (message) {
        await SecureStore.setItemAsync('emergency_message', message);
      } else {
        await SecureStore.deleteItemAsync('emergency_message');
      }

      Alert.alert('Success', 'Settings saved securely.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <FontAwesome5 name="hand-paper" size={28} color="#fff" style={styles.headerIcon} />
        <Text style={styles.header}>Settings</Text>
      </View>
      <Text style={styles.subtext}>Configure your discreet emergency options here.</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Access PIN (4 Digits)</Text>
        <TextInput 
          style={styles.input} 
          secureTextEntry 
          keyboardType="number-pad"
          maxLength={4}
          value={pin}
          onChangeText={setPin}
          placeholder="Leave blank to disable PIN"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Emergency Contacts</Text>
        <Text style={styles.helper}>Comma separated list of phone numbers</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="phone-pad"
          value={contacts}
          onChangeText={setContacts}
          placeholder="1234567890, 0987654321"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>SOS Message</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          multiline
          numberOfLines={4}
          value={message}
          onChangeText={setMessage}
          placeholder="I am in danger and need help."
          placeholderTextColor="#666"
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
        <Text style={styles.saveBtnText}>Save Settings</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/settings/resources')}>
        <Text style={styles.navBtnText}>Help Resources</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/settings/chatbot')}>
        <Text style={styles.navBtnText}>AI Assistant</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.navBtn, styles.exitBtn]} onPress={() => router.replace('/')}>
        <Text style={styles.exitBtnText}>Exit Settings (Return to App)</Text>
      </TouchableOpacity>
      
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 40 },
  headerIcon: { marginRight: 15 },
  header: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  subtext: { color: '#aaa', marginBottom: 30, fontSize: 16, marginTop: 10 },
  section: { marginBottom: 25 },
  label: { color: '#fff', fontSize: 18, marginBottom: 8 },
  helper: { color: '#888', fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: '#222', color: '#fff', padding: 15, borderRadius: 10, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 30 },
  navBtn: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  navBtnText: { color: '#fff', fontSize: 16 },
  exitBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ff6b6b' },
  exitBtnText: { color: '#ff6b6b', fontSize: 16 },
  bottomSpacer: { height: 50 }
});
