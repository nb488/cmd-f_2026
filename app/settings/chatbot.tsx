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
  safeArea: { flex: 1, backgroundColor: '#111' },
  container: { flex: 1, backgroundColor: '#111' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: '#222' },
  backBtn: { padding: 10, marginLeft: -10 },
  backBtnText: { color: '#4A90E2', fontSize: 18 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  chatArea: { flex: 1, padding: 20 },
  messageBubble: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 15 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#4A90E2', borderBottomRightRadius: 5 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#333', borderBottomLeftRadius: 5 },
  messageText: { color: '#fff', fontSize: 16, lineHeight: 24 },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#222', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 25, fontSize: 16, marginRight: 10 },
  sendBtn: { backgroundColor: '#4A90E2', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
