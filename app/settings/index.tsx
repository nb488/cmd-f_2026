import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from '../../utils/storage';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [contacts, setContacts] = useState('');
  const [message, setMessage] = useState('');
  const [showTutorialText, setShowTutorialText] = useState(false);
  const [activeFace, setActiveFace] = useState<'weather' | 'period'>('weather');
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedPin = await SecureStore.getItemAsync('app_settings_pin');
    const savedContacts = await SecureStore.getItemAsync('emergency_contacts');
    const savedMessage = await SecureStore.getItemAsync('emergency_message');
    const savedFace = await SecureStore.getItemAsync('active_face');

    if (savedPin) setPin(savedPin);
    if (savedContacts) {
      const parsed = JSON.parse(savedContacts);
      setContacts(parsed.join(', '));
    }
    if (savedMessage) setMessage(savedMessage);
    if (savedFace === 'period') setActiveFace('period');
    else setActiveFace('weather');
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

      await SecureStore.setItemAsync('active_face', activeFace);

      Alert.alert('Success', 'Settings saved securely.');
    } catch {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  const handleTutorialPress = () => {
    setShowTutorialText(true);
    setTimeout(() => {
      setShowTutorialText(false);
      router.replace({ pathname: '/', params: { showTutorial: 'true' } });
    }, 800);
  };

  // Placeholder for handleLogout, assuming it will be defined elsewhere or added later
  const handleLogout = () => {
    Alert.alert('Logout', 'Logout functionality not yet implemented.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1A0B2E' }}>
      <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#E0BBE4" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#E0BBE4" />
        </TouchableOpacity>
      </View>

      <Text style={styles.helper}>
        Manage your safety preferences and app appearance discreetly.
      </Text>

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
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter your emergency message..."
          placeholderTextColor="#957DAD"
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>App Appearance ("Face")</Text>
        <Text style={styles.helper}>Choose what the app looks like on the surface.</Text>
        
        <TouchableOpacity 
          style={styles.dropdownHeader} 
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownHeaderText}>
            {activeFace === 'weather' ? 'Weather Forecast' : 'Period Tracker'}
          </Text>
          <FontAwesome5 
            name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
            size={14} 
            color="#aaa" 
          />
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={[styles.dropdownItem, activeFace === 'weather' && styles.dropdownItemActive]} 
              onPress={() => {
                setActiveFace('weather');
                setIsDropdownOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemText, activeFace === 'weather' && styles.dropdownItemTextActive]}>
                Weather Forecast
              </Text>
              {activeFace === 'weather' && <FontAwesome5 name="check" size={12} color="#fff" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dropdownItem, activeFace === 'period' && styles.dropdownItemActive]} 
              onPress={() => {
                setActiveFace('period');
                setIsDropdownOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemText, activeFace === 'period' && styles.dropdownItemTextActive]}>
                Period Tracker
              </Text>
              {activeFace === 'period' && <FontAwesome5 name="check" size={12} color="#fff" />}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>SOS Instructions</Text>
        <View style={styles.infoBox}>
          <FontAwesome5 name="info-circle" size={18} color="#4A90E2" style={{ marginRight: 10 }} />
          <Text style={styles.infoText}>
            {activeFace === 'weather' ? (
              <Text>To trigger an SOS in the Weather interface, tap the <Text style={{ fontWeight: 'bold' }}>"Severe Weather Alert"</Text> card.</Text>
            ) : (
              <Text>To trigger an SOS in the Period Tracker interface, tap the <Text style={{ fontWeight: 'bold' }}>"Health Advisory"</Text> card.</Text>
            )}
            {"\n\n"}
            Once tapped, a 5-second countdown will begin. You can cancel the SOS at any time during this countdown.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
        <Text style={styles.saveBtnText}>Save Settings</Text>
      </TouchableOpacity>

      <View style={{ height: 1, backgroundColor: '#4B3F72', marginVertical: 30 }} />

      <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/settings/resources')}>
        <Text style={styles.navBtnText}>Help Resources</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/')}>
        <Text style={styles.navBtnText}>Exit Settings (Return to App)</Text>
      </TouchableOpacity>
      
      <View style={styles.bottomSpacer} />
    </ScrollView>

    <View style={styles.floatingContainer}>
      {isHovered && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>Virtual Assistant</Text>
        </View>
      )}
      <Pressable 
        style={({ pressed }) => [
          styles.floatingChatbotBtn,
          { opacity: pressed ? 0.6 : 1 }
        ]}
        onPress={() => router.push('/settings/chatbot')}
        // @ts-ignore - Web-only event
        onMouseEnter={() => setIsHovered(true)}
        // @ts-ignore - Web-only event
        onMouseLeave={() => setIsHovered(false)}
        onPressIn={() => setIsHovered(true)}
        onPressOut={() => setIsHovered(false)}
      >
        <Image 
          source={require('../../assets/images/wing_logo_v5.png')} 
          style={styles.chatbotIcon}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0B2E', // Deep dark purple
    padding: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#E0BBE4', // Light purple
    letterSpacing: -1,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#957DAD',
    marginBottom: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  helper: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)', 
    fontWeight: '300',
    lineHeight: 22,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#24123E', 
    borderRadius: 16,
    padding: 18,
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
    borderWidth: 1.5,
    borderColor: 'rgba(224, 187, 228, 0.1)', 
  },
  saveBtn: {
    backgroundColor: '#E0BBE4', 
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#E0BBE4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  saveBtnText: {
    color: '#1A0B2E', 
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 35,
  },
  navBtn: {
    flex: 0.48,
    backgroundColor: 'rgba(224, 187, 228, 0.08)', 
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(224, 187, 228, 0.15)',
  },
  navBtnText: { 
    color: '#E0BBE4', 
    fontSize: 16, 
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dropdownHeader: {
    backgroundColor: '#24123E',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(224, 187, 228, 0.1)',
  },
  dropdownHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownMenu: {
    backgroundColor: '#24123E',
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(224, 187, 228, 0.1)',
  },
  dropdownItem: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 187, 228, 0.05)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(224, 187, 228, 0.08)',
  },
  dropdownItemText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    fontWeight: '400',
  },
  dropdownItemTextActive: {
    color: '#E0BBE4',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: 'rgba(224, 187, 228, 0.04)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: 'rgba(224, 187, 228, 0.08)',
  },
  infoText: {
    color: 'rgba(224, 187, 228, 0.7)',
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
    fontWeight: '300',
  },
  bottomSpacer: { height: 120 },
  floatingContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  floatingChatbotBtn: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: '#2D144B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(224, 187, 228, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  tooltipText: {
    color: '#E0BBE4',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chatbotIcon: {
    width: '100%',
    height: '100%',
  }
});
