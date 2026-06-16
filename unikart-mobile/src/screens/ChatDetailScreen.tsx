import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send, ArrowLeft, Image as ImageIcon, User as UserIcon } from 'lucide-react-native';
import client from '../api/client';
import { useAuth } from '../api/authContext';

export function ChatDetailScreen({ route, navigation }: any) {
  const { room, recipientId, recipientName, recipientAvatar } = route.params;
  const { user: currentUser } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const fetchHistory = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await client.get(`/chat/history/${room}`);
      const data = response.data.data || response.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load chat history:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(true);
    
    // Auto-refresh chat history every 3 seconds for instant response (polling mechanism)
    const interval = setInterval(() => {
      fetchHistory(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [room]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const response = await client.post('/chat/send', {
        receiverId: recipientId,
        content: textToSend,
      });
      const newMsg = response.data.data || response.data;
      setMessages((prev) => [...prev, {
        _id: newMsg._id || Date.now().toString(),
        senderId: currentUser?._id,
        content: textToSend,
        createdAt: new Date().toISOString()
      }]);
      // Scroll to bottom
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const renderMessageItem = ({ item }: any) => {
    const isMe = item.senderId === currentUser?._id;

    return (
      <View style={[styles.messageRow, isMe ? styles.myRow : styles.theirRow]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, isMe ? styles.myTime : styles.theirTime]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
        <Image source={{ uri: recipientAvatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.recipientName}>{recipientName}</Text>
          <Text style={styles.statusText}>Active on campus</Text>
        </View>
      </View>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type your message..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
          multiline
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
          <Send size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  statusText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  theirRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: '#111827',
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
    fontWeight: '600',
  },
  myTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    color: '#111827',
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
