import React, { Component } from 'react';
import { ScrollView, Text, Image, View, StyleSheet } from 'react-native';
import RoundedButton from '../Components/RoundedButton';

import { Images } from '../Themes'
import ChordsCricle from '../Components/ChordsCricle';
import {
  DIATONIC_CHORDS,
  NUM_CHORDS,
} from '../Constants/notesAndChords';

// Styles
import styles from './Styles/LaunchScreenStyles';

// TODO move this to redux saga
import Sound from 'react-native-sound';
// Enable playback in silence mode
Sound.setCategory('Playback');

const noteSounds = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].reduce((all, note) => {
  const sound = new Sound(`piano-${note}.wav`, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    // loaded successfully
    console.log('duration in seconds: ' + sound.getDuration() + 'number of channels: ' + sound.getNumberOfChannels());
  });
  all[note] = sound;
  return all;
}, {});
// 2d array
const chordSounds = DIATONIC_CHORDS.map(chord => chord.notes.map(note => noteSounds[note.toLocaleLowerCase()]));

export default class LaunchScreen extends Component {
  state = {
    activeChordIndex: 0,
  }

  updateChord(index) {
    this.setState({
      activeChordIndex: index,
    });
    // Play the sound
    const soundsForChord = chordSounds[index];
    soundsForChord.forEach(sound => {
      sound.setCurrentTime(0);
      sound.play();
    });
  }

  rotateRight = () => {
    const { activeChordIndex } = this.state;
    console.log("Setting to " + (activeChordIndex + 1) % NUM_CHORDS);
    this.updateChord(
      (activeChordIndex + 1) % NUM_CHORDS,
    );
  }

  rotateLeft = () => {
    const { activeChordIndex } = this.state;
    this.updateChord(activeChordIndex === 0 ?
      NUM_CHORDS - 1 :
      activeChordIndex - 1,
    );
  }

  handleCircleDrag = delta => {
    const threshold = 2;
    if (delta > threshold) {
      this.rotateLeft();
    } else if (delta < -threshold) {
      this.rotateRight();
    }
  }

  handleIsCircleDragging = isDragging => {
    this.setState({ scrollEnabled: !isDragging });
  }

  render() {
    const { activeChordIndex, scrollEnabled } = this.state;
    return (
      <View style={styles.mainContainer}>
        <Image source={Images.background} style={styles.backgroundImage} resizeMode="stretch" />
        <ScrollView style={styles.container} scrollEnabled={scrollEnabled}>
          <View style={styles.centered}>
            <ChordsCricle
              activeChordIndex={activeChordIndex}
              onDrag={this.handleCircleDrag}
              onDragStartAndEnd={this.handleIsCircleDragging}
            />
          </View>

          <View style={styles.section} >
            <Text style={styles.sectionText}>
              {DIATONIC_CHORDS[activeChordIndex].label}
            </Text>
          </View>

          <View style={myStyles.rotateButtonsContainer}>
            <RoundedButton onPress={this.rotateLeft}>
              Left
            </RoundedButton>
            <RoundedButton onPress={this.rotateRight}>
              Right
            </RoundedButton>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const myStyles = StyleSheet.create({
  rotateButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 25,
  },
});
