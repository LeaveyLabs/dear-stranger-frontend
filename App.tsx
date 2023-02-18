/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {PropsWithChildren, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Image,
  TouchableOpacity,
  Modal,
  GestureResponderEvent,
  Button,
  SectionList,
  ScrollView,
} from 'react-native';

import ColorPicker from 'react-native-wheel-color-picker';
import uuid from 'react-native-uuid';

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
  hue: string;
  body: string;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
}>;

function MoodInput({input, onInputChange}: InputProps): JSX.Element {
  return (
    <View style={styles.flexstacked}>
      <View style={styles.moodItem}>
        <Text style={styles.smallText}>
          pick a color that describes how you feel
        </Text>
      </View>
      <ColorPicker
        color={input}
        onColorChange={onInputChange}
        thumbSize={30}
        noSnap={true}
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
        placeholder="things to get off your chest, crazy life stories, etc."
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
            <Text style={styles.letterText}>{body.substring(0, 200)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function LetterList(): JSX.Element {
  let letterList: [LetterProps?] = [];
  for (let i = 0; i < 10; ++i) {
    letterList.push({
      body: 'hello',
      hue: '#FFF',
      onPress: () => {},
    });
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

function App(): JSX.Element {
  const [writeBoxVisible, setwriteBoxVisible] = useState(false);
  const [mailboxVisible, setMailboxVisible] = useState(false);
  const [color, setColor] = useState('#FFF');
  const [body, setBody] = useState('');

  const senderUuid = uuid.v4();

  const onColorChange = (color: React.SetStateAction<string>) => {
    setColor(color);
  };

  const onBodyChange = (body: React.SetStateAction<string>) => {
    setBody(body);
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
      }),
    });
    console.log(response);
  };

  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.background}>
        <View style={styles.centeredBox}>
          <Introduction />
          <Button
            title="check your mailbox"
            onPress={() => setMailboxVisible(true)}
          />
        </View>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent={false}
        visible={writeBoxVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
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
              <DarkCircularButton
                icon={require('./assets/arrow.png')}
                onPress={async () => {
                  await postLetter();
                  setColor('#FFF');
                  setBody('');
                  setwriteBoxVisible(false);
                }}
              />
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
              <ScrollView style={styles.bodyBuffer}>
                <LetterList />
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <View style={styles.centeredHeader}>
        <Text style={styles.appTitle}>dear stranger</Text>
      </View>

      <View style={styles.footer}>
        <WhiteCircularButton
          icon={require('./assets/pencil.png')}
          onPress={() => setwriteBoxVisible(true)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  leftHeader: {
    position: 'absolute',
    left: 0,
    top: 20,
    padding: 30,
  },
  centeredHeader: {
    position: 'absolute',
    left: '34%',
    top: 50,
  },
  mailboxHeader: {
    position: 'absolute',
    left: '40%',
    top: 50,
  },
  rightHeader: {
    position: 'absolute',
    right: 0,
    top: 20,
    padding: 30,
  },
  body: {
    flex: 1,
    top: 20,
  },
  moodBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
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
  },
  flexrowed: {
    flex: 1,
    flexDirection: 'row',
  },
  bodyBuffer: {
    marginTop: 20,
  },
  listColumn: {
    padding: 20,
  },
  letterBox: {
    flex: 2,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderColor: 'white',
    borderTopWidth: 1,
  },
  letterText: {
    color: 'white',
  },
  listItem: {
    borderColor: 'white',
    borderBottomWidth: 1,
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
  footer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 20,
  },
});

export default App;
