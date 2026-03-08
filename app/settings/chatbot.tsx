import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello. I am here to help you form a safety plan. You can tell me about your current situation regarding finances, location, or safety, and I can give you advice on how to proceed.' }
  ]);
  const [input, setInput] = useState('');

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>&lt; Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>

        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            IMPORTANT: This is an AI assistant. While it can provide guidance, do not rely on it for critical safety or legal decisions. Always consult with professional resources.
          </Text>
        </View>

        <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingBottom: 20 }}>
          {messages.map((msg, index) => (
            <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputArea}>
          <TextInput 
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask for advice..."
            placeholderTextColor="#666"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1A0B2E' },
  container: { flex: 1, backgroundColor: '#1A0B2E' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 10, 
    paddingBottom: 20, 
    paddingHorizontal: 24, 
    backgroundColor: '#2D144B',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(224, 187, 228, 0.05)',
  },
  backBtn: { padding: 10, marginLeft: -10 },
  backBtnText: { color: '#E0BBE4', fontSize: 18, fontWeight: '500' },
  headerTitle: { 
    color: '#E0BBE4', 
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
  },
  userBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#4B2A6B', 
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(224, 187, 228, 0.1)',
  },
  aiBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#3D1B5D', 
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(224, 187, 228, 0.05)',
  },
  messageText: { 
    color: '#fff', 
    fontSize: 16, 
    lineHeight: 24,
    fontWeight: '300',
  },
  inputArea: { 
    flexDirection: 'row', 
    padding: 20, 
    backgroundColor: '#2D144B', 
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(224, 187, 228, 0.05)',
  },
  input: { 
    flex: 1, 
    backgroundColor: '#1A0B2E', 
    color: '#fff', 
    padding: 16, 
    borderRadius: 25, 
    fontSize: 16, 
    marginRight: 10, 
    borderWidth: 1.5, 
    borderColor: 'rgba(224, 187, 228, 0.1)',
    fontWeight: '400',
  },
  sendBtn: { 
    backgroundColor: '#E0BBE4', 
    paddingVertical: 14, 
    paddingHorizontal: 24, 
    borderRadius: 25,
    shadowColor: '#E0BBE4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  sendBtnText: { color: '#1A0B2E', fontWeight: '700', fontSize: 16 },
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
