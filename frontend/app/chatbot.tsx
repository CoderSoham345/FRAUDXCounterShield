import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'How to report UPI fraud?',
  'What is phishing?',
  'How does AI detect fraud?',
  'Tips for safe payments',
];

export default function ChatbotScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: "Hi! I'm your FraudX AI Security Assistant 🛡️\n\nI can help you with:\n• UPI fraud prevention tips\n• How to report cyber fraud\n• Understanding risk scores\n• Account security advice\n\nAsk me anything about digital payment safety!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || loading) return;

    Keyboard.dismiss();
    setInputText('');

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageText,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.session_id) setSessionId(data.session_id);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I'm having trouble connecting. Please try again in a moment.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Connection error. Please check your network and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
      {!item.isUser && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
      )}
      <View style={[styles.messageContent, item.isUser ? styles.userContent : styles.botContent]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
          {item.text}
        </Text>
        <Text style={styles.timeText}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Security Assistant</Text>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 28 }}>🛡️</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && (
          <View style={styles.typingIndicator}>
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarText}>🤖</Text>
            </View>
            <View style={styles.typingDots}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.typingText}>Thinking...</Text>
            </View>
          </View>
        )}

        {messages.length <= 1 && !loading && (
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Quick Questions</Text>
            <View style={styles.quickPromptsRow}>
              {QUICK_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPromptBtn}
                  onPress={() => sendMessage(prompt)}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about fraud, security..."
            placeholderTextColor="#6b7280"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#1f2937', borderBottomWidth: 1, borderBottomColor: '#374151',
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  onlineText: { fontSize: 12, color: '#10b981' },
  headerIcon: { width: 40, alignItems: 'center' },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageBubble: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  botBubble: { alignSelf: 'flex-start' },
  botAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(59, 130, 246, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  botAvatarText: { fontSize: 20 },
  messageContent: { borderRadius: 16, padding: 14, maxWidth: '100%' },
  userContent: { backgroundColor: '#3b82f6', borderBottomRightRadius: 4 },
  botContent: { backgroundColor: '#1f2937', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#374151' },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  botText: { color: '#d1d5db' },
  timeText: { fontSize: 10, color: '#6b7280', marginTop: 6, alignSelf: 'flex-end' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1f2937', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  typingText: { fontSize: 13, color: '#3b82f6' },
  quickPromptsContainer: { paddingHorizontal: 16, paddingBottom: 12 },
  quickPromptsTitle: { fontSize: 13, color: '#9ca3af', fontWeight: '600', marginBottom: 8 },
  quickPromptsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickPromptBtn: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  quickPromptText: { fontSize: 13, color: '#3b82f6', fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    backgroundColor: '#1f2937', borderTopWidth: 1, borderTopColor: '#374151',
  },
  textInput: {
    flex: 1, backgroundColor: '#0a0a0a', borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 12, paddingRight: 16,
    color: '#fff', fontSize: 15, maxHeight: 100,
    borderWidth: 1, borderColor: '#374151',
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
});
