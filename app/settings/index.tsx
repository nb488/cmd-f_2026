import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Image, Pressable, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from '../../utils/storage';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const THEMES = {
  weather: {
    bg: ['#4A90E2', '#1A0B2E'],
    title: '#FFFFFF',
    label: '#FFFFFF',
    helper: 'rgba(255,255,255,0.8)',
    input: 'rgba(255, 255, 255, 0.15)',
    inputBorder: 'rgba(255, 255, 255, 0.3)',
    button: '#FFFFFF',
    buttonText: '#4A90E2',
    navBtn: 'rgba(255, 255, 255, 0.1)',
    navBtnBorder: 'rgba(255, 255, 255, 0.2)',
    infoBox: 'rgba(255, 255, 255, 0.08)',
    infoText: '#FFFFFF',
    icon: '#FFFFFF'
  },
  period: {
    bg: ['#FFF5F7', '#FFF5F7'],
    title: '#D6336C',
    label: '#D6336C',
    helper: '#868E96',
    input: '#FFFFFF',
    inputBorder: 'rgba(214, 51, 108, 0.15)',
    button: '#D6336C',
    buttonText: '#FFFFFF',
    navBtn: '#FFFFFF',
    navBtnBorder: 'rgba(214, 51, 108, 0.1)',
    infoBox: 'rgba(214, 51, 108, 0.05)',
    infoText: '#495057',
    icon: '#D6336C'
  }
};

export default function SettingsScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [contacts, setContacts] = useState('');
  const [message, setMessage] = useState('');
  const [showTutorialText, setShowTutorialText] = useState(false);
  const [activeFace, setActiveFace] = useState<'weather' | 'period'>('weather');
  const [tempFace, setTempFace] = useState<'weather' | 'period'>('weather');
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const theme = THEMES[activeFace];

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
    if (savedFace === 'period') {
      setActiveFace('period');
      setTempFace('period');
    } else {
      setActiveFace('weather');
      setTempFace('weather');
    }
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

      await SecureStore.setItemAsync('active_face', tempFace);
      setActiveFace(tempFace);

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

  return (
    <LinearGradient colors={theme.bg as [string, string, ...string[]]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={theme.icon} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.title }]}>Settings</Text>
            <TouchableOpacity onPress={handleTutorialPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
              {showTutorialText && <Text style={{ color: theme.helper, marginRight: 6, fontSize: 14 }}>Tutorial</Text>}
              <FontAwesome5 name="question-circle" size={22} color={theme.icon} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.helper, { color: theme.helper }]}>
            Manage your safety preferences and app appearance discreetly.
          </Text>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.label }]}>Access PIN (4 Digits)</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: activeFace === 'weather' ? '#fff' : '#495057' }]} 
              secureTextEntry 
              keyboardType="number-pad"
              maxLength={4}
              value={pin}
              onChangeText={setPin}
              placeholder="Leave blank to disable PIN"
              placeholderTextColor={activeFace === 'weather' ? 'rgba(255,255,255,0.4)' : '#ADB5BD'}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.label }]}>Emergency Contacts</Text>
            <Text style={[styles.helper, { color: theme.helper }]}>Comma separated list of phone numbers</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: activeFace === 'weather' ? '#fff' : '#495057' }]} 
              keyboardType="phone-pad"
              value={contacts}
              onChangeText={setContacts}
              placeholder="1234567890, 0987654321"
              placeholderTextColor={activeFace === 'weather' ? 'rgba(255,255,255,0.4)' : '#ADB5BD'}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.label }]}>SOS Message</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.input, borderColor: theme.inputBorder, color: activeFace === 'weather' ? '#fff' : '#495057', height: 100, textAlignVertical: 'top' }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter your emergency message..."
              placeholderTextColor={activeFace === 'weather' ? 'rgba(255,255,255,0.4)' : '#ADB5BD'}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.label }]}>App Appearance ("Face")</Text>
            <Text style={[styles.helper, { color: theme.helper }]}>Choose what the app looks like on the surface.</Text>
            
            <TouchableOpacity 
          style={[styles.dropdownHeader, { backgroundColor: theme.input, borderColor: theme.inputBorder }]} 
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownHeaderText, { color: activeFace === 'weather' ? '#fff' : '#495057' }]}>
            {tempFace === 'weather' ? 'Weather Forecast' : 'Period Tracker'}
          </Text>
          <FontAwesome5 
            name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
            size={14} 
            color={activeFace === 'weather' ? 'rgba(255,255,255,0.6)' : '#ADB5BD'} 
          />
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={[styles.dropdownMenu, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
            <TouchableOpacity 
              style={[styles.dropdownItem, tempFace === 'weather' && { backgroundColor: activeFace === 'weather' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(214, 51, 108, 0.05)' }]} 
              onPress={() => {
                setTempFace('weather');
                setIsDropdownOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemText, tempFace === 'weather' && { color: theme.icon, fontWeight: '600' }, tempFace === 'period' && { color: activeFace === 'weather' ? 'rgba(255,255,255,0.5)' : '#868E96' }]}>
                Weather Forecast
              </Text>
              {tempFace === 'weather' && <FontAwesome5 name="check" size={12} color={theme.icon} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dropdownItem, tempFace === 'period' && { backgroundColor: activeFace === 'weather' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(214, 51, 108, 0.05)' }]} 
              onPress={() => {
                setTempFace('period');
                setIsDropdownOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemText, tempFace === 'period' && { color: theme.icon, fontWeight: '600' }, tempFace === 'weather' && { color: activeFace === 'weather' ? 'rgba(255,255,255,0.5)' : '#868E96' }]}>
                Period Tracker
              </Text>
              {tempFace === 'period' && <FontAwesome5 name="check" size={12} color={theme.icon} />}
            </TouchableOpacity>
          </View>
        )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.label }]}>SOS Instructions</Text>
            <View style={[styles.infoBox, { backgroundColor: theme.infoBox, borderColor: theme.navBtnBorder }]}>
              <FontAwesome5 name="info-circle" size={18} color={theme.icon} style={{ marginRight: 10 }} />
              <Text style={[styles.infoText, { color: theme.infoText }]}>
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

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.button, shadowColor: theme.button }]} onPress={saveSettings}>
            <Text style={[styles.saveBtnText, { color: theme.buttonText }]}>Save Settings</Text>
          </TouchableOpacity>

          <View style={{ height: 1.5, backgroundColor: theme.navBtnBorder, marginVertical: 40 }} />

          <TouchableOpacity style={[styles.navBtn, { backgroundColor: theme.navBtn, borderColor: theme.navBtnBorder }]} onPress={() => router.push('/settings/resources')}>
            <Text style={[styles.navBtnText, { color: theme.icon }]}>Help Resources</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navBtn, { backgroundColor: theme.navBtn, borderColor: theme.navBtnBorder }]} onPress={() => router.replace('/')}>
            <Text style={[styles.navBtnText, { color: theme.icon }]}>Exit Settings (Return to App)</Text>
          </TouchableOpacity>
          
          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.floatingContainer}>
          {isHovered && (
            <View style={[styles.tooltip, { backgroundColor: activeFace === 'weather' ? '#4A90E2' : '#D6336C', borderColor: 'transparent' }]}>
              <Text style={[styles.tooltipText, { color: '#FFFFFF' }]}>Virtual Assistant</Text>
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
              source={activeFace === 'weather' ? require('../../assets/images/assistant_btn_blue.png') : require('../../assets/images/assistant_btn_pink.png')} 
              style={styles.chatbotIcon}
              resizeMode="cover"
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  helper: {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 22,
    marginBottom: 12,
  },
  input: {
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    fontWeight: '400',
    borderWidth: 1.5,
  },
  saveBtn: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  saveBtnText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  navBtn: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  navBtnText: { 
    fontSize: 16, 
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dropdownHeader: {
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  dropdownHeaderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownMenu: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  dropdownItem: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '400',
  },
  infoBox: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
  },
  infoText: {
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
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'transparent',
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
