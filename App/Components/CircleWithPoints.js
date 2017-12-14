import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { noop, throttle } from 'lodash';
import {
    NOTES,
    NOTES_TO_INDEX,
    NUM_POINTS,
    DIATONIC_CHORDS,
} from '../Constants/notesAndChords';

const alwaysReturnTrue = () => true;
const alwaysReturnFalse = () => false;

export default class CircleWithPoints extends PureComponent {
    static defaultProps = {
        activeChordIndex: 0,
        size: 300,
        strokeWidth: 10,
        strokeColor: 'black',
        fillColor: 'black',
        fillOpacity: 0.2,
        pointsColor: 'white',
        onDrag: noop,
        onDragStartAndEnd: noop,
    }

    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
            lastDragPos: null,
        };
        this.computePointsOnCircle(props);
    }

    componentWillReceiveProps(nextProps, oldProps) {
        if (nextProps.size !== oldProps.size || nextProps.strokeWidth !== oldProps.strokeWidth) {
            this.computePointsOnCircle(nextProps);
        }
    }

    computePointsOnCircle(props) {
        const { size, strokeWidth } = props;
        this.points = [];
        const topLeft = size / 2;
        const radius = (size / 2) - strokeWidth;
        const radiusForLabels = (size + 20) / 2;
        const radiusForBigLabels = (size + 30) / 2;
        const theta = (Math.PI * 2) / NUM_POINTS;
        for (let i = 0; i < NUM_POINTS; i++) {
            const angle = theta * i;
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            this.points[i] = {
                note: NOTES[i],
                x: topLeft + (radius * sin),
                y: topLeft - (radius * cos),
                labelX: topLeft + (radiusForLabels * sin),
                labelY: topLeft - (radiusForLabels * cos),
                bigLabelX: topLeft + (radiusForBigLabels * sin),
                bigLabelY: topLeft - (radiusForBigLabels * cos),
            };
        }
    }

    handleRespondingToTouch = ({ nativeEvent: { locationX, locationY } }) => {
        this.setState({ isDragging: true });
        this.lastDragPos = { locationX, locationY };
        this.props.onDragStartAndEnd(true);
    }

    handleNotRespondingToTouch = () => {
        this.setState({ isDragging: false });
        this.props.onDragStartAndEnd(false);
    }

    throttledOnDrag = throttle((delta) => this.props.onDrag(delta), 100)

    handleDrag = ({ nativeEvent: { locationX, locationY } }) => {
        const { lastDragPos } = this;
        if (lastDragPos) {
            const deltaX = lastDragPos.locationX - locationX;
            const deltaY = lastDragPos.locationY - locationY;
            console.tron.log('locationX: ' + locationX + ', locationY: ' + locationY);
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // The swipe is more of a "sideways" swipe than a "lengthwise" one
                this.throttledOnDrag(deltaX);
            } else {
                this.throttledOnDrag(deltaY);
            }
        }
        this.lastDragPos = { locationX, locationY };
    }

    renderLabelsAtEachPoint() {
        const { size } = this.props;
        const mid = size / 2;
        return this.points.map((point) => {
            const { labelX, labelY, bigLabelX, bigLabelY, note } = point;
            const isBigLabel = note.indexOf('/') !== -1;
            const containerSize = 0;
            return (
                <View
                    key={note}
                    style={{
                        position: 'absolute',
                        top: isBigLabel ? bigLabelY : labelY,
                        left: isBigLabel ? bigLabelX : labelX,
                        width: 0,
                        height: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                    }}
                >
                    <Text
                        style={{
                            color: 'white',
                            textAlign: 'center',
                        }}
                    >
                        {note.replace('/', '\n')}
                    </Text>
                </View>
            );
        });
    }

    renderLinesBetweenPoints() {
        const { activeChordIndex, pointsColor, strokeWidth } = this.props;
        // There are 4 lines to visualize this chord
        const chord = DIATONIC_CHORDS[activeChordIndex];
        const { label, notes } = chord;
        // example notes: ['B', 'C', 'E', 'G'],
        console.tron.log('Rendering ' + label);
        const polygonPoints = notes.map((note) => {
            // We are making a line from this note to the next note,
            // but we need to figure out which actual indexes on the circle correspond to these
            // notes before we can draw the line
            const pointIndex = NOTES_TO_INDEX[note];
            const pt = this.points[pointIndex];
            return `${Math.round(pt.x)},${Math.round(pt.y)}`;
        });
        return (
            <Polygon
                points={polygonPoints.join(' ')}
                fill="lime"
                fillOpacity={0.5}
                stroke={pointsColor}
                strokeWidth={strokeWidth / 2}
            />
        );
    }

    render() {
        const {
            size,
            strokeSize,
            strokeColor,
            strokeWidth,
            fillColor,
            fillOpacity,
            pointsColor,
        } = this.props;
        const halfSize = (size / 2);
        const { isDragging } = this.state;
        return (
            <View
                onStartShouldSetResponder={alwaysReturnTrue}
                onStartShouldSetResponderCapture={alwaysReturnTrue}
                onMoveShouldSetResponder={alwaysReturnTrue}
                onResponderTerminationRequest={alwaysReturnFalse}
                onResponderGrant={this.handleRespondingToTouch}
                onResponderMove={this.handleDrag}
                onResponderRelease={this.handleNotRespondingToTouch}
                onResponderTerminate={this.handleNotRespondingToTouch}
            >
                <Svg
                    height={size}
                    width={size}
                >
                    <Circle
                        cx={halfSize}
                        cy={halfSize}
                        r={(halfSize - strokeWidth)}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill={isDragging ? 'red' : fillColor}
                        fillOpacity={fillOpacity}
                    />
                    {this.points.map((point, i) => (
                        <Circle
                            key={point.note}
                            cx={point.x}
                            cy={point.y}
                            r={(strokeWidth / 2) - 1} /* -1 is just to add a little padding */
                            fill={pointsColor}
                        />
                    ))}
                    {this.renderLinesBetweenPoints()}
                </Svg>
                {this.renderLabelsAtEachPoint()}
            </View>
        );
    }
}