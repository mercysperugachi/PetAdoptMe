import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useChat } from '../../src/features/chat_ia/presentation/hooks/useChat';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const { messages, isLoading, sendMessage } = useChat();
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText.trim();
    setInputText('');
    await sendMessage(textToSend);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarIcon}>🤖</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Asistente IA Gemini</Text>
          <Text style={styles.headerSubtitle}>Tu experto 24/7 en mascotas</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isModel = item.role === 'model';
          return (
            <View style={[styles.messageBubble, isModel ? styles.modelBubble : styles.userBubble]}>
              <Text style={[styles.messageText, isModel ? styles.modelText : styles.userText]}>
                {item.text}
              </Text>
            </View>
          );
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Pregunta sobre salud animal..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.sendIcon}>➤</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#CCFBF1', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarIcon: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280' },
  chatContainer: { padding: 16, gap: 12 },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
  modelBubble: { backgroundColor: '#F3F4F6', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#0F766E', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22 },
  modelText: { color: '#1F2937' },
  userText: { color: '#FFFFFF' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'flex-end' },
  textInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, minHeight: 48, maxHeight: 120, fontSize: 16, marginRight: 12 },
  sendButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0F766E', justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#9CA3AF' },
  sendIcon: { color: '#FFFFFF', fontSize: 18, transform: [{ rotate: '-45deg' }] }
});