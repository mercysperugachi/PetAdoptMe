import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { MotiView } from 'moti';

import { useChat } from '../../src/features/chat_ia/presentation/hooks/useChat';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');

  const { messages, isLoading, sendMessage } =
    useChat();

  const flatListRef =
    useRef<FlatList>(null);

  const handleSend = async () => {
    if (
      !inputText.trim() ||
      isLoading
    )
      return;

    const textToSend =
      inputText.trim();

    setInputText('');

    await sendMessage(textToSend);
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <MotiView
        style={styles.header}
        from={{
          opacity: 0,
          translateY: -20,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
        }}
      >
        <View style={styles.botAvatar}>
          <Text style={styles.botEmoji}>
            🤖
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            Asistente IA
          </Text>

          <Text style={styles.headerSubtitle}>
            Tu experto en mascotas 24/7
          </Text>
        </View>
      </MotiView>

      {/* MENSAJES */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, idx) =>
          item.id || idx.toString()
        }
        contentContainerStyle={
          styles.messagesContainer
        }
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({
            animated: true,
          })
        }
        renderItem={({ item }) => {
          const isModel =
            item.role === 'model';

          return (
            <MotiView
              from={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                type: 'timing',
                duration: 250,
              }}
              style={[
                styles.messageBubble,
                isModel
                  ? styles.aiBubble
                  : styles.userBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isModel
                    ? styles.aiText
                    : styles.userText,
                ]}
              >
                {item.text}
              </Text>
            </MotiView>
          );
        }}
      />

      {/* INPUT */}
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <View style={styles.inputContainer}>

          <TextInput
            style={styles.input}
            placeholder="Pregunta algo sobre mascotas..."
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() ||
                isLoading) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={
              !inputText.trim() ||
              isLoading
            }
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendText}>
                ➤
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  botAvatar: {
    width: 50,
    height: 50,
    borderRadius: 999,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  botEmoji: {
    fontSize: 24,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 3,
  },

  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },

  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
  },

  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    borderTopLeftRadius: 6,
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0ea5e9',
    borderTopRightRadius: 6,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },

  aiText: {
    color: '#0f172a',
  },

  userText: {
    color: '#ffffff',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },

  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#0f172a',
  },

  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },

  sendText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});