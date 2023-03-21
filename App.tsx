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
  Dimensions,
} from 'react-native';
import RNShake from 'react-native-shake';

import ColorPicker from 'react-native-wheel-color-picker';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const vh = Dimensions.get('window').height / 100;
const vm = Dimensions.get('window').width / 100;

const MESSAGE_URL = 'https://dear-stranger.herokuapp.com/messages';
const FLAG_URL = 'https://dear-stranger.herokuapp.com/reports';

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
  uuid: string;
  senderUuid: string;
  hue: string;
  body: string;
  timestamp: number;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
  isFlaggable: boolean | undefined;
  onFlag: (() => void) | undefined;
}>;

type LetterListProps = PropsWithChildren<{
  letters: [Letter?];
  personalUuid: string;
  onOpen: ((messages: [Letter?]) => void) | undefined;
}>;

function MoodInput({input, onInputChange}: InputProps): JSX.Element {
  const hueCircle = {
    height: 20,
    width: 20,
    borderRadius: 15,
    backgroundColor: input,
  };

  return (
    <View style={styles.bottomSpacing}>
      <View style={styles.stacked}>
        <View style={styles.moodItem}>
          <View style={styles.flexrowed}>
            <View style={[styles.smallRightPadding]}>
              <View style={hueCircle} />
            </View>
            <View>
              <Text style={styles.smallText}>
                pick a color that describes how you feel
              </Text>
            </View>
          </View>
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
      <View style={styles.smallBottomPadding}>
        <TextInput
          multiline
          numberOfLines={10}
          maxLength={1000}
          style={styles.letterText}
          autoCapitalize="none"
          autoCorrect={true}
          placeholder="things to get off your chest, thoughtful remarks, crazy life stories (minimum 50 characters)"
          placeholderTextColor="#808080"
          onChangeText={onInputChange}
          value={input}
        />
      </View>
      <Text style={[styles.grayText]}>
        {(input.length && input.length < 50 && `${input.length}/${50}`) ||
          (!input.length && '')}
      </Text>
    </View>
  );
}

function Introduction(): JSX.Element {
  return (
    <View style={styles.mediumView}>
      <Text style={styles.mediumText}>shake to receive someone's letter</Text>
      <Text style={styles.smallText}>it may take a few seconds</Text>
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
      <Image style={styles.mediumImage} source={icon} />
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

function SmallDarkCircularButton({
  icon,
  onPress,
}: SmallButtonProps): JSX.Element {
  return (
    <TouchableOpacity style={styles.smallIcon} onPress={onPress}>
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

function LargeLetterSlot({
  body,
  hue,
  timestamp,
  isFlaggable,
  onFlag,
}: LetterProps): JSX.Element {
  const hueCircle = {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: hue,
  };

  const createFlagAlert = () => {
    Alert.alert(
      'Flag this letter',
      'Report this letter and permanently remove it from your mailbox',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            if (onFlag) {
              onFlag();
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.letterstacked}>
      <ScrollView>
        <View style={styles.listColumn}>
          <View style={styles.verticalCentering}>
            <View style={styles.flexrowed}>
              <View style={styles.mediumRightPadding}>
                <View style={hueCircle} />
              </View>
              <View style={styles.smallRightPadding}>
                <Text style={styles.grayText}>
                  {`${new Date(timestamp).toLocaleString()}`}
                </Text>
              </View>
              {isFlaggable && (
                <View>
                  <SmallDarkCircularButton
                    icon={require('./assets/flag.png')}
                    onPress={createFlagAlert}
                  />
                </View>
              )}
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

async function postReport(
  letterUuid: string,
  reporterUuid: string,
  explanation: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const response = await fetch(FLAG_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      letterUuid: letterUuid,
      reporterUuid: reporterUuid,
      explanation: explanation,
    }),
  });
  // console.log(response);
}

function ReplySlot(
  {uuid, body, timestamp}: LetterProps,
  personalUuid: string,
): JSX.Element {
  const [isFlagged, setIsFlagged] = useState(false);

  const createFlagAlert = () => {
    Alert.alert(
      'Flag this letter',
      'Report this letter and permanently remove it from your mailbox',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            await postReport(uuid, personalUuid, body);
            setIsFlagged(true);
          },
        },
      ],
    );
  };

  if (isFlagged) {
    return <View />;
  } else {
    return (
      <View style={[styles.smallReplyBox]}>
        <ScrollView>
          <View style={styles.smallBottomPadding}>
            <View style={styles.flexrowed}>
              <Text style={[styles.grayText, styles.smallRightPadding]}>
                {`${new Date(timestamp).toLocaleString()}`}
              </Text>
              <View style={styles.verticalCentering}>
                <SmallDarkCircularButton
                  icon={require('./assets/flag.png')}
                  onPress={createFlagAlert}
                />
              </View>
            </View>
          </View>
          <Text style={styles.letterText}>{body}</Text>
        </ScrollView>
      </View>
    );
  }
}

const sortByTimestamp = (a: Letter | undefined, b: Letter | undefined) => {
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
};

const reverseSortByTimestamp = (
  a: Letter | undefined,
  b: Letter | undefined,
) => {
  if (!a || !b) {
    return 0;
  }
  if (a.timestamp > b.timestamp) {
    return 1;
  }
  if (a.timestamp === b.timestamp) {
    return 0;
  }
  return -1;
};

class Letter {
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

class Report {
  letterUuid: string;
  reporterUuid: string;
  explanation: string;

  constructor(obj: {
    letterUuid: string;
    reporterUuid: string;
    explanation: string;
  }) {
    this.letterUuid = obj.letterUuid;
    this.reporterUuid = obj.reporterUuid;
    this.explanation = obj.explanation;
  }
}

function LetterList({letters, onOpen}: LetterListProps): JSX.Element {
  let letterList: [LetterProps?] = [];
  let threadMap: Map<string, [Letter?]> = new Map();

  for (let i = 0; i < letters.length; ++i) {
    const letter = letters[i];
    if (!letter) {
      continue;
    }
    if (!letter.inResponseTo) {
      if (!threadMap.has(letter.uuid)) {
        threadMap.set(letter.uuid, [letter]);
      } else {
        threadMap.get(letter.uuid)?.push(letter);
      }
    } else {
      if (!threadMap.has(letter.inResponseTo)) {
        threadMap.set(letter.inResponseTo, [letter]);
      } else {
        threadMap.get(letter.inResponseTo)?.push(letter);
      }
    }
  }

  for (let i = 0; i < letters.length; ++i) {
    const letter = letters[i];
    if (letter) {
      if (!threadMap.has(letter.uuid)) {
        continue;
      }
      const letterJson = {
        key: i,
        uuid: letter.uuid,
        senderUuid: letter.senderUuid,
        body: letter.body,
        hue: letter.hue,
        timestamp: letter.timestamp,
        onPress: () => {},
        isFlaggable: false,
        onFlag: () => {},
      };
      const thread = threadMap.get(letter.uuid)?.sort(reverseSortByTimestamp);
      if (onOpen && thread) {
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

function LargeLetterList({
  letters,
  personalUuid,
}: LetterListProps): JSX.Element {
  let firstLetter: LetterProps | undefined;
  let letterList: [LetterProps?] = [];
  for (let i = 0; i < letters.length; ++i) {
    const letter = letters[i];
    if (letter && i === 0) {
      firstLetter = {
        key: i,
        uuid: letter.uuid,
        senderUuid: letter.senderUuid,
        body: letter.body,
        hue: letter.hue,
        timestamp: letter.timestamp,
        onPress: () => {},
        isFlaggable: false,
        onFlag: undefined,
      };
    } else if (letter) {
      letterList.push({
        key: i,
        uuid: letter.uuid,
        senderUuid: letter.senderUuid,
        body: letter.body,
        hue: letter.hue,
        timestamp: letter.timestamp,
        onPress: () => {},
        isFlaggable: true,
        onFlag: undefined,
      });
    }
  }
  return (
    <View>
      {firstLetter && LargeLetterSlot(firstLetter)}
      {letterList.map(letterProp => {
        if (letterProp) {
          return ReplySlot(letterProp, personalUuid);
        }
      })}
    </View>
  );
}

function App(): JSX.Element {
  const [writeBoxVisible, setwriteBoxVisible] = useState(false);
  const [mailboxVisible, setMailboxVisible] = useState(false);
  const [receiveLetterVisible, setReceiveLetterVisible] = useState(false);
  const [nextReceivedLetter, setNextReceivedLetter] = useState<Letter>();
  const [openedLetterVisible, setOpenedLetterVisible] = useState(false);
  const [mailbox, setMailbox] = useState<[Letter?]>([]);
  const [openedLetters, setOpenedLetters] = useState<[Letter?]>([]);
  const [color, setColor] = useState('#ffffff');
  const [body, setBody] = useState('');
  const [receivedLetters, setReceivedLetters] = useState<[Letter?]>([]);
  const [senderUuid, setSenderUuid] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastSendTime, setLastSendTime] = useState(0);
  const [sentBacklog, setSentBacklog] = useState(0);
  const [myReports, setMyReports] = useState<[Report?]>([]);
  const [guideVisible, setGuideVisibile] = useState(false);
  // const [isReceivingLetter, setIsReceivingLetter] = useState(false);

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
        setSenderUuid(value);
        return value;
      } else {
        const newUuid = uuid.v4();
        setSenderUuid(String(newUuid));
        storeUuid(String(newUuid));
        return String(newUuid);
      }
    } catch (e) {
      // error reading value
    }
  };

  const getReports = async (senderUuid: any) => {
    if (!senderUuid || senderUuid.length < 1) {
      senderUuid = await initializeUuid();
    }
    const response = await fetch(FLAG_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    const newReports: [Report?] = [];
    for (const report of data) {
      if (report.reporterUuid === senderUuid) {
        newReports.push(new Report(report));
      }
    }
    setMyReports(newReports);
  };

  const postLetter = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // console.log(response);
  };

  const getLetters = async (senderUuid: any) => {
    if (!senderUuid || senderUuid.length < 1) {
      senderUuid = await initializeUuid();
    }

    const response = await fetch(MESSAGE_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();

    const allLetters: [Letter?] = [];
    const newLetters: [Letter?] = [];
    const myLetters: Set<string> = new Set();
    const myReplies: Set<string> = new Set();

    for (const letter of data) {
      const isMyLetter = letter.senderUuid === senderUuid;
      const isMyReport = myReports.find(
        report => report?.letterUuid === letter.uuid,
      );
      if (!letter.senderUuid || !letter.uuid || isMyReport) {
        continue;
      }
      if (isMyLetter) {
        myLetters.add(letter.uuid);
        myReplies.add(letter.inResponseTo);
      }
      allLetters.push(new Letter(letter));
    }

    for (const letter of allLetters) {
      if (!letter) {
        continue;
      }
      const isMyLetter = letter.senderUuid === senderUuid;
      const isTheirReply = myLetters.has(letter.inResponseTo);
      const isRepliedLetter = myReplies.has(letter.uuid);
      if (
        (isMyLetter || isTheirReply || isRepliedLetter) &&
        letter.body.length > 0
      ) {
        newLetters.push(new Letter(letter));
        myLetters.add(letter.uuid);
        if (letter.inResponseTo) {
          myReplies.add(letter.inResponseTo);
        }
      }
    }

    newLetters.sort(sortByTimestamp);

    setMailbox(newLetters);

    // console.log(newLetters);

    // for (const letter of newLetters) {
    //   if (mailbox.find(mailboxLetter => mailboxLetter?.body === letter?.body)) {
    //     continue;
    //   }
    //   mailbox.push(letter);
    // }

    // mailbox.sort(sortByTimestamp);

    // setMailbox(mailbox);
    return mailbox;
  };

  const receiveLetter = async (senderUuid: string) => {
    const response = await fetch(MESSAGE_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    const letters: [Letter?] = [];

    if (!senderUuid || senderUuid.length < 1) {
      await initializeUuid();
    }

    for (const letter of data) {
      if (
        !receivedLetters.find(
          receivedLetter => receivedLetter?.body === letter.body,
        ) &&
        letter.body.length > 0 &&
        letter.hue &&
        letter.senderUuid !== senderUuid &&
        !letter.inResponseTo
      ) {
        letters.push(new Letter(letter));
      }
    }
    if (!letters.length) {
      return;
    }

    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    receivedLetters.push(randomLetter);
    // console.log(randomLetter);
    setNextReceivedLetter(randomLetter);
    setReceivedLetters([...receivedLetters]);
    setReceiveLetterVisible(true);
  };

  const openLetter = (letters: [Letter?]) => {
    setOpenedLetters([...letters]);
    setOpenedLetterVisible(true);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(async () => {
      await getReports(senderUuid);
      await getLetters(senderUuid);

      setRefreshing(false);
    }, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initializeUuid();
    // RNShake.addListener(() => {
    //   // Your code...
    //   receiveLetter(senderUuid);
    // });
    // getLetters(senderUuid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (senderUuid && senderUuid.length > 0) {
      RNShake.addListener(() => {
        // setIsReceivingLetter(true);
        setTimeout(async () => {
          await receiveLetter(senderUuid);
          // setIsReceivingLetter(false);
        }, 2000);
      });
      getLetters(senderUuid);
      getReports(senderUuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderUuid]);

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
            <View style={styles.slightRightHeader}>
              <Text style={styles.appTitle}> send a letter </Text>
            </View>
            <View style={styles.body}>
              <MoodInput input={color} onInputChange={onColorChange} />
              <LetterInput input={body} onInputChange={onBodyChange} />
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
                    if (new Date().getTime() / 1000 - lastSendTime < 300) {
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
                    setLastSendTime(new Date().getTime() / 1000);
                    setSentBacklog(sentBacklog + 1);
                    setColor('#FFF');
                    setBody('');
                    setwriteBoxVisible(false);
                  }}
                />
              )}
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
                    <LetterList
                      letters={mailbox}
                      onOpen={openLetter}
                      key="0"
                      personalUuid={senderUuid}
                    />
                  )}
                  {mailbox.length === 0 && <EmptyMailbox />}
                </ScrollView>
              </View>
              <View style={styles.leftHeader}>
                <DarkCircularButton
                  icon={require('./assets/close.png')}
                  onPress={() => setMailboxVisible(false)}
                />
              </View>
            </SafeAreaView>
          </View>
        ) : (
          <View style={styles.background}>
            <SafeAreaView style={styles.background}>
              <View style={styles.body}>
                <ScrollView style={styles.bodyBuffer}>
                  {openedLetters && (
                    <LargeLetterList
                      letters={openedLetters}
                      onOpen={() => {}}
                      personalUuid={senderUuid}
                    />
                  )}
                </ScrollView>
              </View>
              <View style={styles.leftHeader}>
                <DarkCircularButton
                  icon={require('./assets/back-arrow.png')}
                  onPress={async () => {
                    await getReports(senderUuid);
                    await getLetters(senderUuid);
                    setOpenedLetterVisible(false);
                  }}
                />
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
          setReceiveLetterVisible(false);
        }}>
        <View style={styles.background}>
          <SafeAreaView style={styles.background}>
            <View style={styles.someoneHeader}>
              <Text style={styles.appTitle}>reply to someone</Text>
            </View>
            <View style={styles.body}>
              {nextReceivedLetter && (
                <View>
                  <LargeLetterSlot
                    body={nextReceivedLetter.body}
                    hue={nextReceivedLetter.hue}
                    timestamp={nextReceivedLetter.timestamp}
                    onPress={() => {}}
                    key={0}
                    uuid={nextReceivedLetter.uuid}
                    senderUuid={nextReceivedLetter.senderUuid}
                    isFlaggable={true}
                    onFlag={async () => {
                      await postReport(
                        nextReceivedLetter.uuid,
                        nextReceivedLetter.senderUuid,
                        nextReceivedLetter.body,
                      );
                      setReceiveLetterVisible(false);
                    }}
                  />
                </View>
              )}
              {nextReceivedLetter && (
                <LetterInput input={body} onInputChange={onBodyChange} />
              )}
            </View>
            <View style={styles.leftHeader}>
              <DarkCircularButton
                icon={require('./assets/close.png')}
                onPress={() => setReceiveLetterVisible(false)}
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
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={false}
        visible={guideVisible}
        onRequestClose={() => {
          setGuideVisibile(false);
        }}>
        <SafeAreaView style={styles.background}>
          <View style={styles.leftHeader}>
            <DarkCircularButton
              icon={require('./assets/close.png')}
              onPress={() => setGuideVisibile(false)}
            />
          </View>
          <View style={styles.slightLeftHeader}>
            <Text style={styles.appTitle}>so, what is this app?</Text>
          </View>
          <View style={styles.body}>
            <View style={styles.bodyBuffer}>
              <View style={styles.guidanceBox}>
                <Text style={styles.guidanceText}>
                  tldr: get things off your chest, listen to others
                  {'\n'}
                </Text>
                <Text style={styles.guidanceText}>
                  you can do 2 things in this app
                  {'\n'}
                </Text>
                <Text style={styles.guidanceText}>
                  1. send an anonymous letter
                  {'\n'}
                </Text>
                <Text style={styles.guidanceText}>
                  2. reply to an anonymous letter
                  {'\n'}
                </Text>
                <Text style={styles.guidanceText}>
                  if you find bad content, please flag it.
                  {'\n'}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <View style={styles.centeredHeader}>
        <View style={styles.flexrowed}>
          <View style={styles.smallRightPadding}>
            <Text style={styles.appTitle}>dear someone</Text>
          </View>
          <View style={styles.verticalCentering}>
            <SmallDarkCircularButton
              icon={require('./assets/question.png')}
              onPress={() => {
                setGuideVisibile(true);
              }}
            />
          </View>
        </View>
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
          onPress={async () => {
            getReports(senderUuid);
            getLetters(senderUuid);
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
    left: 7 * vm,
    top: 7 * vh,
  },
  centeredHeader: {
    position: 'absolute',
    left: '31%',
    top: 7 * vh,
  },
  slightRightHeader: {
    position: 'absolute',
    left: '34%',
    top: 7 * vh,
  },
  slightLeftHeader: {
    position: 'absolute',
    left: '28%',
    top: 7 * vh,
  },
  someoneHeader: {
    position: 'absolute',
    left: '30%',
    top: 7 * vh,
  },
  mailboxHeader: {
    position: 'absolute',
    left: '40%',
    top: 7 * vh,
  },
  rightHeader: {
    position: 'absolute',
    right: 7 * vm,
    top: 7 * vh,
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
  guidanceBox: {
    padding: 20,
  },
  bottomSpacing: {
    flex: 1,
    paddingBottom: 20,
  },
  moodItem: {
    marginTop: 20,
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
    flexDirection: 'column',
    padding: 20,
  },
  stacked: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexrowed: {
    flexDirection: 'row',
  },
  bodyBuffer: {
    marginTop: 20,
  },
  listColumn: {
    padding: 10,
  },
  letterBox: {
    flex: 1.5,
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
  guidanceText: {
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
  smallIcon: {
    height: 10,
    width: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediumImage: {
    height: 30,
    width: 30,
  },
  smallImage: {
    height: 20,
    width: 20,
  },
  mediumRightPadding: {
    paddingRight: 20,
  },
  mediumLeftPadding: {
    paddingLeft: 20,
  },
  smallLeftPadding: {
    paddingLeft: 10,
  },
  smallRightPadding: {
    paddingRight: 10,
  },
  smallBottomPadding: {
    paddingBottom: 10,
  },
  verySmallLeftPadding: {
    paddingLeft: 5,
  },
  verySmallRightPadding: {
    paddingRight: 5,
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
