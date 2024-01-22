import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { database } from '../firebase/firebaseconfig';
import { getCurrentUser } from '../firebase/firebaseconfig'; 
import colors from '../colors';

const Chat = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatRoomId } = route.params;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesQuery = query(
        collection(database, 'chatRooms', chatRoomId, 'messages'),
        orderBy('createdAt')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(newMessages);
      });

      return unsubscribe;
    };

    fetchMessages();
  }, [chatRoomId]);

  const sendMessage = async () => {
    try {
      const currentUser = getCurrentUser();

      if (!currentUser) {
        console.error('Failed to get currentUser');
        return;
      }

      const messageRef = collection(database, 'chatRooms', chatRoomId, 'messages');
      await addDoc(messageRef, {
        text: messageText,
        createdAt: new Date(),
        sender: currentUser.uid,
      });

      setMessageText('');
    } catch (error) {
      console.error('Error :', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender === getCurrentUser()?.uid;

    return (
      <View style={isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="메세지를 입력하세요."
          value={messageText}
          onChangeText={(text) => setMessageText(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    padding: 16,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#D3E3FD',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8E8E8',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
    padding: 8,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: '#fff',
  },
});

export default Chat;
