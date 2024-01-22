import React, { useState, useEffect, useLayoutEffect, } from "react";
import { View, TouchableOpacity, StyleSheet, TextInput, Modal, Button, FlatList, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from '@expo/vector-icons';
import colors from '../colors';
import { collection, addDoc, doc, getDocs } from 'firebase/firestore';
import { database  } from '../firebase/firebaseconfig'; 
import { auth } from '../firebase/firebaseconfig';
import { signOut } from 'firebase/auth';
import { AntDesign } from '@expo/vector-icons';

const getCurrentUser = () => {
    const user = auth.currentUser;
    if (user) {
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
        };
    } else {
        return null;
    }
};

const fetchChatRooms = async (setChatRooms) => {
    const chatRoomCollection = collection(database, 'chatRooms');
    const snapshot = await getDocs(chatRoomCollection);
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setChatRooms(rooms);
};

const Home = () => {
    const navigation = useNavigation();
    const [isModalVisible, setModalVisible] = useState(false);
    const [chatRoomName, setChatRoomName] = useState('');
    const [chatRooms, setChatRooms] = useState([]);
    
    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
      };

      useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <TouchableOpacity
              onPress={onSignOut}
            >
              <AntDesign name="logout" size={24} color={'#676767'}/>
            </TouchableOpacity>
          )
        });
      }, [navigation]);
      
    useEffect(() => {
        fetchChatRooms(setChatRooms);
    }, []); 

    const createChatRoom = async () => {
        try {
            const currentUser = getCurrentUser();
    
            if (!currentUser) {
                console.error("Failed to get currentUser");
                return;
            }
    
            const chatRoomRef = collection(database, 'chatRooms');
            const newChatRoomDocRef = await addDoc(chatRoomRef, {
                chatRoomName: chatRoomName, 
                createdAt: new Date(),
                createdBy: currentUser, 
            });
    
            console.log("Chat room created :", newChatRoomDocRef.id);
            fetchChatRooms(setChatRooms); 
        } catch (error) {
            console.error("Error creating chat room :", error);
        }
    
        setModalVisible(false);
        setChatRoomName('');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.chatButton}>
                <Entypo name="chat" size={24} color={colors.lightGray} />
            </TouchableOpacity>

            <FlatList
                data={chatRooms}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View>
                        <TouchableOpacity onPress={() => navigation.navigate("Chat", { chatRoomId: item.id })}>
                            <Text style={styles.chatRoomItem_icon}>{">"}</Text>
                            <Text style={styles.chatRoomItem}>{item.chatRoomName}</Text>
                            <Text style={styles.chatRoomItem_sub}>{"방장 : " + item.createdBy.email}</Text>
                            <Text style={styles.chatRoomItem_sub2}>{"채팅방 생성날짜 : " + item.createdAt.toDate().toLocaleString()}</Text>
                        </TouchableOpacity>
                        <View style={styles.separator}></View>
                    </View>
                )}

            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(!isModalVisible)}
            >
                <View style={styles.modalContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="채팅방 명을 입력하세요."
                        value={chatRoomName}
                        onChangeText={(text) => setChatRoomName(text)}
                    />
                    <View style={styles.buttonContainer}>
                        <Button
                            title="채팅방 생성"
                            onPress={createChatRoom}
                            color="#02567E" 
                        />
                        <View style={styles.buttonSpacer}></View> 
                        <Button
                            title="취소"
                            onPress={() => {
                                setModalVisible(false);
                                setChatRoomName('');
                            }}
                            color="#02567E" 
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: "#fff",
        position: 'relative', 
    },
    chatButton: {
        backgroundColor: colors.primary,
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: .9,
        shadowRadius: 8,
        position: 'absolute', 
        bottom: 20, 
        right: 20, 
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 8,
        width: 200,
        backgroundColor: 'white',
    },
    buttonContainer: {
        flexDirection: 'column', 
        justifyContent: 'space-evenly',

        marginVertical: 8, 
    },
    buttonSpacer: {
        height: 8,
    },
    chatRoomItem: {
        fontSize: 18,
        marginLeft: 16,
        marginTop: 8,
        marginBottom: 4,
    },
    chatRoomItem_sub: {
        fontSize: 14,
        color: '#A1A1A1',
        marginLeft: 16,
    },
    chatRoomItem_sub2:  {
        fontSize: 14,
        marginLeft: 16,
        color: '#A1A1A1',
        marginBottom: 8,
    },
    separator: {
        height: 1,
        backgroundColor: colors.gray,
        width: '100%'
    },    
    listItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatRoomItem_icon: {
        fontSize: 14,
        textAlign: 'right',
        marginRight: 16,
        color: '#A1A1A1',
        marginTop: 8,
    }
});

export default Home;