/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {PropsWithChildren, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Modal,
  GestureResponderEvent,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import RNShake from 'react-native-shake';

import ColorPicker from 'react-native-wheel-color-picker';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MESSAGE_URL = 'https://dear-stranger.herokuapp.com/messages';

type SmallButtonProps = PropsWithChildren<{
  icon: any;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
}>;

type InputProps = PropsWithChildren<{
  input: string;
  onInputChange: ((action: React.SetStateAction<string>) => void) | undefined;
}>;

type LetterProps = PropsWithChildren<{
  key: any;
  hue: string;
  body: string;
  timestamp: number;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
}>;

type LetterListProps = PropsWithChildren<{
  letters: [Message?];
  onOpen: ((messages: [Message?]) => void) | undefined;
}>;

function MoodInput({input, onInputChange}: InputProps): JSX.Element {
  return (
    <View style={styles.bottomSpacing}>
      <View style={styles.stacked}>
        <View style={styles.moodItem}>
          <Text style={styles.smallText}>
            pick a color that describes how you feel
          </Text>
        </View>
      </View>
      <ColorPicker
        color={input}
        onColorChange={onInputChange}
        thumbSize={30}
        row={false}
        sliderHidden={true}
        swatches={false}
      />
    </View>
  );
}

function LetterInput({input, onInputChange}: InputProps): JSX.Element {
  return (
    <View style={styles.letterBox}>
      <TextInput
        multiline
        numberOfLines={10}
        maxLength={1000}
        style={styles.letterText}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="things to get off your chest, thoughtful remarks, crazy life stories (minimum 50 characters)"
        placeholderTextColor="#808080"
        onChangeText={onInputChange}
        value={input}
      />
    </View>
  );
}

function Introduction(): JSX.Element {
  return (
    <View style={styles.mediumView}>
      <Text style={styles.mediumText}>shake to receive someone's letter.</Text>
    </View>
  );
}

function EmptyMailbox(): JSX.Element {
  return (
    <View style={styles.centeredBox}>
      <View style={styles.mediumView}>
        <Text style={styles.mediumText}>your mailbox is empty.</Text>
      </View>
    </View>
  );
}

function WhiteCircularButton({icon, onPress}: SmallButtonProps): JSX.Element {
  return (
    <TouchableOpacity style={styles.mediumWhiteIcon} onPress={onPress}>
      <Image style={styles.smallImage} source={icon} />
    </TouchableOpacity>
  );
}

function DarkCircularButton({icon, onPress}: SmallButtonProps): JSX.Element {
  return (
    <TouchableOpacity style={styles.mediumIcon} onPress={onPress}>
      <Image style={styles.smallImage} source={icon} />
    </TouchableOpacity>
  );
}

function LetterSlot({body, hue, onPress}: LetterProps): JSX.Element {
  const hueCircle = {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: hue,
  };

  return (
    <View style={styles.listItem}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.flexrowed}>
          <View style={styles.listColumn}>
            <View style={hueCircle} />
          </View>
          <View style={styles.listColumn}>
            <Text style={styles.letterText} numberOfLines={2}>
              {body.substring(0, 40)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function LargeLetterSlot({body, hue, timestamp}: LetterProps): JSX.Element {
  const hueCircle = {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: hue,
  };

  return (
    <View style={styles.letterstacked}>
      <ScrollView>
        <View style={styles.listColumn}>
          <View style={styles.verticalCentering}>
            <View style={styles.flexrowed}>
              <View style={styles.smallRightPadding}>
                <View style={hueCircle} />
              </View>
              <View style={styles.smallRightPadding}>
                <Text style={styles.grayText}>
                  {`${new Date(timestamp).toLocaleString()}`}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.listColumn}>
          <Text style={styles.letterText}>{body}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ReplySlot({body}: LetterProps): JSX.Element {
  return (
    <View style={styles.smallReplyBox}>
      <ScrollView>
        <Text style={styles.letterText}>{body}</Text>
      </ScrollView>
    </View>
  );
}

class Message {
  uuid: string;
  inResponseTo: string;
  body: string;
  timestamp: number;
  hue: string;
  senderUuid: string;

  constructor(obj: {
    body: string;
    hue: string;
    senderUuid: string;
    timestamp: number;
    inResponseTo: string;
    uuid: string;
  }) {
    this.uuid = obj.uuid;
    this.inResponseTo = obj.inResponseTo;
    this.body = obj.body;
    this.timestamp = obj.timestamp;
    this.hue = obj.hue;
    this.senderUuid = obj.senderUuid;
  }
}

function LetterList({letters, onOpen}: LetterListProps): JSX.Element {
  let letterList: [LetterProps?] = [];
  let letterMap: Map<string, Message> = new Map();
  let threadMap: Map<string, [Message?]> = new Map();

  for (let i = 0; i < letters.length; ++i) {
    const letter = letters[i];
    if (!letter) {
      continue;
    }
    letterMap.set(letter.uuid, letter);
    let priorLetter = letter?.inResponseTo;
    let isInitialLetter = !priorLetter;
    if (isInitialLetter) {
      threadMap.set(letter.uuid, []);
    } else if (threadMap.has(priorLetter)) {
      threadMap.get(priorLetter)?.push(letter);
    } else {
      threadMap.set(priorLetter, [letter]);
    }
  }

  // threadMap.forEach((replies, keyUuid) => {
  //   const letter = letterMap.get(keyUuid);
  //   if (letter) {
  //     const letterJson = {
  //       key: keyUuid,
  //       body: letter.body,
  //       hue: letter.hue,
  //       timestamp: letter.timestamp,
  //       onPress: () => {},
  //     };
  //     const thread: [Message?] = [letter];
  //     if (onOpen) {
  //       thread.concat(replies);
  //       letterJson.onPress = () => {
  //         onOpen(thread);
  //       };
  //     }
  //     letterList.push(letterJson);
  //   }
  // });

  for (let i = 0; i < letters.length; ++i) {
    const letter = letters[i];
    if (letter) {
      const letterJson = {
        key: i,
        body: letter.body,
        hue: letter.hue,
        timestamp: letter.timestamp,
        onPress: () => {},
      };
      const thread: [Message?] = [letter];
      const replies = threadMap.get(letter.uuid);
      if (onOpen) {
        thread.concat(replies);
        letterJson.onPress = () => {
          onOpen(thread);
        };
      }
      letterList.push(letterJson);
    }
  }

  return (
    <View>
      {letterList.map(letterProp => {
        if (letterProp) {
          return LetterSlot(letterProp);
        }
      })}
    </View>
  );
}

function LargeLetterList({letters}: LetterListProps): JSX.Element {
  let firstLetter: LetterProps | undefined;
  let letterList: [LetterProps?] = [];
  for (let i = 0; i < letters.length; ++i) {
    const letter = letters[i];
    if (letter && i === 0) {
      firstLetter = {
        key: i,
        body: letter.body,
        hue: letter.hue,
        timestamp: letter.timestamp,
        onPress: () => {},
      };
    } else if (letter) {
      letterList.push({
        key: i,
        body: letter.body,
        hue: letter.hue,
        timestamp: letter.timestamp,
        onPress: () => {},
      });
    }
  }
  return (
    <View>
      {firstLetter && LargeLetterSlot(firstLetter)}
      {letterList.map(letterProp => {
        if (letterProp) {
          return ReplySlot(letterProp);
        }
      })}
    </View>
  );
}

function App(): JSX.Element {
  const [writeBoxVisible, setwriteBoxVisible] = useState(false);
  const [mailboxVisible, setMailboxVisible] = useState(false);
  const [receiveLetterVisible, setReceiveLetterVisible] = useState(false);
  const [nextReceivedLetter, setNextReceivedLetter] = useState<Message>();
  const [openedLetterVisible, setOpenedLetterVisible] = useState(false);
  const [mailbox, setMailbox] = useState<[Message?]>([]);
  const [openedLetters, setOpenedLetters] = useState<[Message?]>([]);
  const [color, setColor] = useState('#ffffff');
  const [body, setBody] = useState('');
  const [receivedLetters, setReceivedLetters] = useState<[Message?]>([]);
  const [senderUuid, setSenderUuid] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastSendTime, setLastSendTime] = useState(0);
  const [sentBacklog, setSentBacklog] = useState(0);

  const onColorChange = (newColor: React.SetStateAction<string>) => {
    setColor(newColor);
  };

  const onBodyChange = (newBody: React.SetStateAction<string>) => {
    setBody(newBody);
  };

  const storeUuid = async (value: string) => {
    try {
      await AsyncStorage.setItem('@uuid', value);
    } catch (e) {
      // saving error
    }
  };

  const initializeUuid = async () => {
    try {
      const value = await AsyncStorage.getItem('@uuid');
      if (value !== null) {
        // value previously stored
        setSenderUuid(value);
      } else {
        const newUuid = uuid.v4();
        setSenderUuid(String(newUuid));
        storeUuid(String(newUuid));
      }
    } catch (e) {
      // error reading value
    }
  };

  const postLetter = async () => {
    const response = await fetch(MESSAGE_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderUuid: senderUuid,
        body: body,
        hue: color,
        timestamp: new Date().getTime(),
        inResponseTo: receiveLetterVisible ? nextReceivedLetter?.uuid : null,
      }),
    });
    console.log(response);
  };

  const getLetters = async () => {
    const response = await fetch(MESSAGE_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    const letters: [Message?] = [];
    const myLetters: Set<string> = new Set();
    const myReplies: Set<string> = new Set();
    for (const letter of data) {
      const isMyLetter = letter.senderUuid === senderUuid;
      const isTheirReply = myLetters.has(letter.inResponseTo);
      const isRepliedLetter = myReplies.has(letter.uuid);
      if (
        (isMyLetter || isTheirReply || isRepliedLetter) &&
        letter.body.length > 0
      ) {
        letters.push(new Message(letter));
        myLetters.add(letter.uuid);
        myReplies.add(letter.inResponseTo);
      }
    }
    letters.sort((a, b) => {
      if (!a || !b) {
        return 0;
      }
      if (a.timestamp > b.timestamp) {
        return -1;
      }
      if (a.timestamp === b.timestamp) {
        return 0;
      }
      return 1;
    });
    setMailbox(letters);
    return letters;
  };

  const receiveLetter = async () => {
    const response = await fetch(MESSAGE_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    const letters: [Message?] = [];
    for (const letter of data) {
      if (
        !receivedLetters.includes(letter) &&
        letter.body.length > 0 &&
        letter.hue &&
        letter.senderUuid !== senderUuid &&
        !letter.inResponseTo
      ) {
        letters.push(new Message(letter));
      }
    }
    if (!letters.length) {
      return;
    }
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    receivedLetters.push(randomLetter);
    setNextReceivedLetter(randomLetter);
    setReceivedLetters([...receivedLetters]);
    setReceiveLetterVisible(true);
  };

  const openLetter = (letters: [Message?]) => {
    setOpenedLetters([...letters]);
    setOpenedLetterVisible(true);
    console.log(openedLetters);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getLetters();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initializeUuid();
    getLetters();

    RNShake.addListener(() => {
      // Your code...
      console.log('hello');
      receiveLetter();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.background}>
        <View style={styles.centeredBox}>
          <Introduction />
        </View>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent={false}
        visible={writeBoxVisible}
        onRequestClose={() => {
          setwriteBoxVisible(!writeBoxVisible);
        }}>
        <View style={styles.background}>
          <SafeAreaView style={styles.background}>
            <View style={styles.centeredHeader}>
              <Text style={styles.appTitle}>send a letter</Text>
            </View>
            <View style={styles.leftHeader}>
              <DarkCircularButton
                icon={require('./assets/close.png')}
                onPress={() => setwriteBoxVisible(false)}
              />
            </View>
            <View style={styles.rightHeader}>
              {body.length > 50 && (
                <DarkCircularButton
                  icon={require('./assets/arrow.png')}
                  onPress={async () => {
                    if (new Date().getSeconds() - lastSendTime < 3600) {
                      Alert.alert(
                        'Too many messages at once',
                        'Come back and send your message sometime later',
                      );
                      return;
                    }
                    if (sentBacklog >= 1) {
                      Alert.alert(
                        "Let's help others first",
                        "You will have to respond to someone else's message before sending another",
                      );
                      return;
                    }
                    await postLetter();
                    setLastSendTime(new Date().getSeconds());
                    setSentBacklog(sentBacklog + 1);
                    setColor('#FFF');
                    setBody('');
                    setwriteBoxVisible(false);
                  }}
                />
              )}
            </View>
            <View style={styles.body}>
              <MoodInput input={color} onInputChange={onColorChange} />
              <LetterInput input={body} onInputChange={onBodyChange} />
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={false}
        visible={mailboxVisible}
        onRequestClose={() => {
          setMailboxVisible(!mailboxVisible);
        }}>
        {!openedLetterVisible ? (
          <View style={styles.background}>
            <SafeAreaView style={styles.background}>
              <View style={styles.mailboxHeader}>
                <Text style={styles.appTitle}>mailbox</Text>
              </View>
              <View style={styles.leftHeader}>
                <DarkCircularButton
                  icon={require('./assets/close.png')}
                  onPress={() => setMailboxVisible(false)}
                />
              </View>
              <View style={styles.body}>
                <ScrollView
                  style={styles.bodyBuffer}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor="white"
                    />
                  }>
                  {mailbox.length > 0 && (
                    <LetterList letters={mailbox} onOpen={openLetter} key="0" />
                  )}
                  {mailbox.length === 0 && <EmptyMailbox />}
                </ScrollView>
              </View>
            </SafeAreaView>
          </View>
        ) : (
          <View style={styles.background}>
            <SafeAreaView style={styles.background}>
              <View style={styles.leftHeader}>
                <DarkCircularButton
                  icon={require('./assets/back-arrow.png')}
                  onPress={() => setOpenedLetterVisible(false)}
                />
              </View>
              <View style={styles.body}>
                <ScrollView style={styles.bodyBuffer}>
                  {openedLetters && (
                    <LargeLetterList
                      letters={openedLetters}
                      onOpen={() => {}}
                    />
                  )}
                </ScrollView>
              </View>
            </SafeAreaView>
          </View>
        )}
      </Modal>

      <Modal
        animationType="fade"
        transparent={false}
        visible={receiveLetterVisible}
        onRequestClose={() => {
          setReceiveLetterVisible(!receiveLetterVisible);
        }}>
        <View style={styles.background}>
          <SafeAreaView style={styles.background}>
            <View style={styles.someoneHeader}>
              <Text style={styles.appTitle}>reply to someone</Text>
            </View>
            <View style={styles.leftHeader}>
              <DarkCircularButton
                icon={require('./assets/close.png')}
                onPress={() => setReceiveLetterVisible(!receiveLetterVisible)}
              />
            </View>
            <View style={styles.rightHeader}>
              {body.length > 50 && (
                <DarkCircularButton
                  icon={require('./assets/arrow.png')}
                  onPress={async () => {
                    await postLetter();
                    setSentBacklog(0);
                    setColor('#FFF');
                    setBody('');
                    setReceiveLetterVisible(false);
                  }}
                />
              )}
            </View>
            <View style={styles.body}>
              {nextReceivedLetter && (
                <LargeLetterSlot
                  body={nextReceivedLetter.body}
                  hue={nextReceivedLetter.hue}
                  timestamp={nextReceivedLetter.timestamp}
                  onPress={() => {}}
                  key={0}
                />
              )}
              {nextReceivedLetter && (
                <LetterInput input={body} onInputChange={onBodyChange} />
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <View style={styles.centeredHeader}>
        <Text style={styles.appTitle}>dear someone</Text>
      </View>

      <View style={styles.rightFooter}>
        <WhiteCircularButton
          icon={require('./assets/pencil.png')}
          onPress={() => setwriteBoxVisible(true)}
        />
      </View>

      <View style={styles.leftFooter}>
        <WhiteCircularButton
          icon={require('./assets/mail.png')}
          onPress={() => {
            getLetters();
            setMailboxVisible(true);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  leftHeader: {
    position: 'absolute',
    left: 0,
    top: 30,
    padding: 30,
  },
  centeredHeader: {
    position: 'absolute',
    left: '34%',
    top: 60,
  },
  someoneHeader: {
    position: 'absolute',
    left: '31%',
    top: 60,
  },
  mailboxHeader: {
    position: 'absolute',
    left: '40%',
    top: 60,
  },
  rightHeader: {
    position: 'absolute',
    right: 0,
    top: 30,
    padding: 30,
  },
  body: {
    flex: 1,
    top: 30,
  },
  moodBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bottomSpacing: {
    flex: 1,
    paddingBottom: 20,
  },
  moodItem: {
    marginTop: 25,
  },
  flexbox: {
    flex: 1,
  },
  flexstacked: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  letterstacked: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
  },
  stacked: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexrowed: {
    flex: 1,
    flexDirection: 'row',
  },
  bodyBuffer: {
    marginTop: 20,
  },
  listColumn: {
    padding: 10,
  },
  letterBox: {
    flex: 2,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderColor: 'white',
    borderTopWidth: 1,
  },
  replyBox: {
    flex: 2,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderColor: 'white',
    borderTopWidth: 1,
  },
  smallReplyBox: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderColor: 'white',
    borderTopWidth: 1,
  },
  letterText: {
    color: 'white',
    fontSize: 15,
  },
  listItem: {
    borderColor: 'white',
    borderBottomWidth: 1,
  },
  verticalCentering: {
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    backgroundColor: '#0B1224',
  },
  appTitle: {
    color: 'white',
    fontSize: 20,
  },
  centeredBox: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediumView: {
    flex: 1,
    justifyContent: 'center',
  },
  mediumText: {
    color: 'white',
    fontSize: 20,
  },
  smallText: {
    color: 'white',
    fontSize: 15,
  },
  grayText: {
    color: 'gray',
    fontSize: 15,
  },
  mediumWhiteIcon: {
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: '#FCF6F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediumIcon: {
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallImage: {
    height: 30,
    width: 30,
  },
  smallRightPadding: {
    paddingRight: 20,
  },
  rightFooter: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 40,
  },
  leftFooter: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    padding: 40,
  },
});

export default App;
