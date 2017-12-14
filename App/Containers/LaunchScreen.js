import React, { Component } from 'react';
import { ScrollView, Text, Image, View, StyleSheet } from 'react-native';
import RoundedButton from '../Components/RoundedButton';

import { Images } from '../Themes'
import CircleWithPoints from '../Components/CircleWithPoints';
import {
  DIATONIC_CHORDS,
  NUM_CHORDS,
} from '../Constants/notesAndChords';

// Styles
import styles from './Styles/LaunchScreenStyles'

export default class LaunchScreen extends Component {
  state = {
    activeChordIndex: 0,
  }

  rotateRight = () => {
    const { activeChordIndex } = this.state;
    console.tron.log("Setting to " + (activeChordIndex + 1) % NUM_CHORDS);
    this.setState({
      activeChordIndex: (activeChordIndex + 1) % NUM_CHORDS,
    });
  }

  rotateLeft = () => {
    const { activeChordIndex } = this.state;
    this.setState({
      activeChordIndex: activeChordIndex === 0 ?
        NUM_CHORDS - 1 :
        activeChordIndex - 1,
    });
  }

  handleCircleDrag = delta => {
    console.tron.log('delta: ' + delta);
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
        <Image source={Images.background} style={styles.backgroundImage} resizeMode='stretch' />
        <ScrollView style={styles.container} scrollEnabled={scrollEnabled}>
          <View style={styles.centered}>
            <CircleWithPoints
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
