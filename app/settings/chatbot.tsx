import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

const SYSTEM_PROMPT = `You are a compassionate safety planning assistant for people experiencing domestic abuse. 
Your role is to help users create personalized safety plans. Focus on:
- Financial safety (separate accounts, hidden savings)
- Location safety (shelters, trusted contacts, disabling tracking)
- Children's safety if applicable
- Document safety (ID, passport, bank cards)
- Digital safety (clearing history, monitored devices)
Always be empathetic, non-judgmental, and prioritize the user's immediate safety.
Keep responses concise and actionable. Remind users to clear browsing history if their device may be monitored.`;

export default function ChatbotScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Hello. I am here to help you form a safety plan. You can tell me about your current situation regarding finances, location, or safety, and I can give you advice on how to proceed.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const PREDEFINED_OPTIONS = [
    "I need help with my finances",
    "I need a safe location to leave",
    "How can I protect my children?",
    "I need general advice"
  ];

  const sendMessageToAI = async (userMsg: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setInput('');

    // Pre-populate UI with user message + empty AI bubble
    setMessages(prev => [
      ...prev,
      { role: 'user', text: userMsg },
      { role: 'ai', text: '' }
    ]);

    // Build history for API, formatting correctly for OpenRouter
    const historyToUse = messages.length > 0 && messages[0].role === 'ai' ? messages.slice(1) : messages;
    const conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...historyToUse.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: userMsg }
    ];

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "openrouter/free", // This auto-routes to whatever free model is currently available to avoid 429s!
          "messages": conversationHistory,
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Received ${response.status} status from OpenRouter. Response body:`, errorBody);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      const aiResponseText = data.choices[0]?.message?.content || "I couldn't process that response.";

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'ai', text: aiResponseText };
        return updated;
      });
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      console.error('API integration error:', errorMessage);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'ai',
          text: `[DEBUG API ERROR]: ${errorMessage}`
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    sendMessageToAI(option);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessageToAI(input.trim());
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

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => (
            msg.text && msg.role !== 'ai' || (msg.role === 'ai' && msg.text !== '' && !msg.text.startsWith('[DEBUG')) ? (
              <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                {msg.role === 'user' ? (
                  <Text style={styles.messageText}>{msg.text}</Text>
                ) : (
                  <Markdown style={markdownStyles}>{msg.text}</Markdown>
                )}
              </View>
            ) : msg.text && msg.text.startsWith('[DEBUG') ? (
              <View key={index} style={[styles.messageBubble, styles.aiBubble]}>
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ) : (
              // Loading bubble
              <View key={index} style={[styles.messageBubble, styles.aiBubble]}>
                <Text style={styles.messageText}>...</Text>
              </View>
            )
          ))}
        </ScrollView>

        <View style={styles.optionsWrapper}>
          {PREDEFINED_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionBtn, isLoading && styles.optionBtnDisabled]}
              onPress={() => handleOptionSelect(option)}
              disabled={isLoading}
            >
              <Text style={styles.optionBtnText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask for advice..."
            placeholderTextColor="#666"
            onSubmitEditing={handleSend}
            editable={!isLoading}
          />
          <TouchableOpacity style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]} onPress={handleSend} disabled={isLoading}>
            <Text style={styles.sendBtnText}>{isLoading ? '...' : 'Send'}</Text>
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
  optionsWrapper: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, backgroundColor: '#222', gap: 10, justifyContent: 'center' },
  optionBtn: { backgroundColor: '#333', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#4A90E2' },
  optionBtnDisabled: { opacity: 0.5 },
  optionBtnText: { color: '#4A90E2', fontSize: 14, textAlign: 'center', fontWeight: '500' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#222', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#111', color: '#fff', padding: 15, borderRadius: 25, fontSize: 16, marginRight: 10 },
  sendBtn: { backgroundColor: '#4A90E2', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25 },
  sendBtnDisabled: { backgroundColor: '#2a5a8a', opacity: 0.5 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

const markdownStyles = StyleSheet.create({
  body: { color: '#fff', fontSize: 16, lineHeight: 24 },
  strong: { fontWeight: 'bold' },
  em: { fontStyle: 'italic' },
  paragraph: { marginTop: 0, marginBottom: 5 },
  list_item: { marginBottom: 5, flexDirection: 'row' },
  bullet_list_icon: { color: '#fff', fontSize: 16, marginRight: 5 },
});
