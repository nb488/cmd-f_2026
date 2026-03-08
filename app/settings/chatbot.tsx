import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from '../../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const THEMES = {
  weather: {
    bg: ['#4A90E2', '#1A0B2E'],
    header: 'rgba(255, 255, 255, 0.1)',
    headerText: '#FFFFFF',
    userBubble: 'rgba(255, 255, 255, 0.2)',
    aiBubble: 'rgba(255, 255, 255, 0.15)',
    bubbleBorder: 'rgba(255, 255, 255, 0.2)',
    text: '#FFFFFF',
    inputBg: 'rgba(255, 255, 255, 0.1)',
    inputBorder: 'rgba(255, 255, 255, 0.2)',
    button: '#FFFFFF',
    buttonText: '#4A90E2',
    icon: '#FFFFFF'
  },
  period: {
    bg: ['#FFF5F7', '#FFF5F7'],
    header: '#FFFFFF',
    headerText: '#D6336C',
    userBubble: '#D6336C',
    aiBubble: '#FFFFFF',
    bubbleBorder: 'rgba(214, 51, 108, 0.1)',
    text: '#495057',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(214, 51, 108, 0.15)',
    button: '#D6336C',
    buttonText: '#FFFFFF',
    icon: '#D6336C'
  }
};

export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello. I am here to help you form a safety plan. You can tell me about your current situation regarding finances, location, or safety, and I can give you advice on how to proceed.' }
  ]);
  const [input, setInput] = useState('');
  const [activeFace, setActiveFace] = useState<'weather' | 'period'>('weather');

  useFocusEffect(
    useCallback(() => {
      const loadFace = async () => {
        const savedFace = await SecureStore.getItemAsync('active_face');
        if (savedFace === 'period') setActiveFace('period');
        else setActiveFace('weather');
      };
      loadFace();
    }, [])
  );

  const theme = THEMES[activeFace];

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    // Mock AI Response based on keywords
    setTimeout(() => {
      let aiResponse = "I hear you, and your safety is the most important thing. " +
        "When making a plan, try to gather important documents (ID, passport, bank cards) and keep them in a safe place or with a trusted friend. ";

      const lowerText = userMsg.toLowerCase();
      if (lowerText.includes('money') || lowerText.includes('finance')) {
        aiResponse += "For finances, try to quietly open a separate bank account if safe to do so, and slowly save money where your abuser cannot access it.";
      } else if (lowerText.includes('location') || lowerText.includes('leave')) {
        aiResponse += "If you are planning to leave, identify a safe place to go such as a local shelter (see 'Resources' tab) or a trusted friend's home. Disable location tracking on your phone and car.";
      } else if (lowerText.includes('kids') || lowerText.includes('child')) {
        aiResponse += "If you have children, plan a safe way to bring them with you, but do not tell them the plan too far in advance to avoid accidental disclosure. Pack a small bag for them as well.";
      } else {
        aiResponse += "Please refer to the 'Resources' tab for professional organizations that can help you execute a safe exit strategy. Remember to clear your browsing history and this app's data if you suspect your device is monitored.";
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 1000);
  };

  return (
    <LinearGradient colors={theme.bg as [string, string, ...string[]]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.header, { backgroundColor: theme.header, borderBottomColor: theme.bubbleBorder }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color={theme.icon} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.headerText }]}>AI Assistant</Text>
          </View>

          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              IMPORTANT: This is an AI assistant. While it can provide guidance, do not rely on it for critical safety or legal decisions. Always consult with professional resources.
            </Text>
          </View>

          <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingBottom: 20 }}>
            {messages.map((msg, index) => (
              <View 
                key={index} 
                style={[
                  styles.messageBubble, 
                  msg.role === 'user' 
                    ? [styles.userBubble, { backgroundColor: theme.userBubble, borderColor: theme.bubbleBorder }] 
                    : [styles.aiBubble, { backgroundColor: theme.aiBubble, borderColor: theme.bubbleBorder }]
                ]}
              >
                <Text style={[styles.messageText, { color: msg.role === 'user' ? '#fff' : activeFace === 'weather' ? '#fff' : '#495057' }]}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.inputArea, { backgroundColor: theme.header, borderTopColor: theme.bubbleBorder }]}>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: activeFace === 'weather' ? '#fff' : '#495057' }]}
              value={input}
              onChangeText={setInput}
              placeholder="Ask for advice..."
              placeholderTextColor={activeFace === 'weather' ? 'rgba(255,255,255,0.4)' : '#ADB5BD'}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.button, shadowColor: theme.button }]} onPress={handleSend}>
              <Text style={[styles.sendBtnText, { color: theme.buttonText }]}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 10, 
    paddingBottom: 20, 
    paddingHorizontal: 24, 
    borderBottomWidth: 1.5,
  },
  backBtn: { padding: 10, marginLeft: -10 },
  headerTitle: { 
    fontSize: 30, 
    fontWeight: '700', 
    marginLeft: 10,
    letterSpacing: -1,
  },
  chatArea: { flex: 1, padding: 24 },
  messageBubble: { 
    maxWidth: '85%', 
    padding: 18, 
    borderRadius: 20, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  userBubble: { 
    alignSelf: 'flex-end', 
    borderBottomRightRadius: 4,
  },
  aiBubble: { 
    alignSelf: 'flex-start', 
    borderBottomLeftRadius: 4,
  },
  messageText: { 
    fontSize: 16, 
    lineHeight: 24,
    fontWeight: '300',
  },
  inputArea: { 
    flexDirection: 'row', 
    padding: 20, 
    alignItems: 'center',
    borderTopWidth: 1.5,
  },
  input: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 25, 
    fontSize: 16, 
    marginRight: 10, 
    borderWidth: 1.5, 
    fontWeight: '400',
  },
  sendBtn: { 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 25,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  sendBtnText: { fontWeight: '700', fontSize: 16 },
  warningBanner: {
    backgroundColor: 'rgba(61, 37, 37, 0.6)',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(110, 68, 68, 0.4)',
  },
  warningText: {
    color: '#ff9b9b',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
    opacity: 0.9,
  },
});
