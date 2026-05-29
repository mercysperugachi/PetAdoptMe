import { MotiView } from 'moti';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    <View className="flex-1 bg-gradient-to-b from-slate-50 to-blue-50">
      {/* Header */}
      <MotiView
        className="flex-row items-center gap-4 px-6 py-4 pt-16 bg-white border-b border-slate-200"
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
      >
        <View className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 justify-center items-center">
          <Text className="text-xl">🤖</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-900">Asistente IA</Text>
          <Text className="text-xs text-slate-500 mt-1">Tu experto 24/7 en mascotas</Text>
        </View>
      </MotiView>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, idx) => item.id || idx.toString()}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isModel = item.role === 'model';
          return (
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 300 }}
              className={`max-w-4/5 px-4 py-3 rounded-2xl ${
                isModel 
                  ? 'self-start bg-gradient-to-br from-slate-100 to-slate-200 rounded-tl-none' 
                  : 'self-end bg-gradient-to-br from-blue-500 to-cyan-600 rounded-tr-none'
              }`}
            >
              <Text className={`text-base leading-6 ${
                isModel ? 'text-slate-800' : 'text-white'
              }`}>
                {item.text}
              </Text>
            </MotiView>
          );
        }}
      />

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-row items-end gap-3 px-4 py-4 bg-white border-t border-slate-200">
          <TextInput
            className="flex-1 bg-slate-100 border border-slate-300 rounded-2xl px-4 py-3 text-base text-slate-900"
            placeholder="Pregunta sobre salud animal..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxHeight={100}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            className={`w-12 h-12 rounded-full justify-center items-center ${
              !inputText.trim() || isLoading
                ? 'bg-slate-300'
                : 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg'
            }`}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-xl">➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}