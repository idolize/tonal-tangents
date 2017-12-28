// Example originally from https://github.com/ethantran/react-native-examples

// TODO eventually add fill color animation?
// https://github.com/ethantran/react-native-examples/blob/master/src/components/AnimatedSvgBrushFix.js

import React, { Component } from 'react';
import { Animated, Easing } from 'react-native';
import { Polygon } from 'react-native-svg';
import { isEqual, flatten } from 'lodash';
import { listen, removeListeners } from './animatedListener';

const animationConfig = {
  duration: 100,
  easing: Easing.ease,
};

// https://github.com/react-native-community/react-native-svg/blob/master/lib/extract/extractPolyPoints.js
function extractPolyPoints(polyPoints) {
  return polyPoints.replace(/[^e]-/, ' -').split(/(?:\s+|\s*,\s*)/g).join(' ');
}

function pointsToString(points) {
  return points.reduce((acc, point, i) => acc + point[0] + ',' + point[1] + ' ', '');
}

// https://github.com/react-native-community/react-native-svg/blob/master/elements/Polygon.js
function getPath(points) {
  return `M${extractPolyPoints(pointsToString(points))}z`;
}

class AnimatedPolygon extends Component {
  constructor(props) {
    super(props);
    this.points = listen(props.points, _ => this.setNativeProps({ _listener: true }));
  }
  cacheRef = (component) => {
    this._component = component;
  }
  setNativeProps = (props) => {
    if (props._listener) {
      props.d = getPath(this.points.values);
    }
    // BUG: getNativeElement() is not a function https://github.com/react-native-community/react-native-svg/issues/180
    this._component && this._component.root && this._component.root.setNativeProps(props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.points !== this.props.points) {
      removeListeners(this.points);
      this.points = listen(nextProps.points, _ => this.setNativeProps({ _listener: true }));
    }
  }
  componentWillUnmount() {
    removeListeners(this.points);
  }
  render() {
    const d = getPath(this.points.values);
    return (
      <Polygon
        ref={this.cacheRef}
        {...this.props}
        d={d}
      />
    );
  }
}

AnimatedPolygon = Animated.createAnimatedComponent(AnimatedPolygon);

export default class EasingAnimatedPolygon extends Component {
  constructor(props) {
    super(props);
    this.animatedPoints = props.points.map(pt => [
      new Animated.Value(pt[0]),
      new Animated.Value(pt[1]),
    ]);
  }

  componentDidMount() {
    this.animate(this.props.points);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.points.length !== this.props.points.length) {
      throw new Error('Can\'t animate a polygon with changing number of points');
    }
    if (!isEqual(newProps.points, this.props.points)) {
      this.animate(newProps.points);
    }
  }

  animate = (newPoints) => {
    const { animatedPoints } = this;
    Animated.parallel(flatten(animatedPoints.map((pt, i) => [
      Animated.timing(pt[0], {
        toValue: newPoints[i][0],
        ...animationConfig,
      }),
      Animated.timing(pt[1], {
        toValue: newPoints[i][1],
        ...animationConfig,
      }),
    ]))).start();
  };

  render() {
    return (
      <AnimatedPolygon
        {...this.props}
        points={this.animatedPoints}
      />
    );
  }
}
