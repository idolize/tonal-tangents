import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { capitalize } from 'lodash';
import {
    NOTES,
    NOTES_TO_INDEX,
    NUM_POINTS,
    DIATONIC_CHORDS,
} from '../Constants/notesAndChords';

export default class CircleWithPoints extends PureComponent {
    static defaultProps = {
        activeChordIndex: 0,
        size: 300,
        strokeWidth: 10,
        strokeColor: 'black',
        fillColor: 'black',
        fillOpacity: 0.2,
        pointsColor: 'white',
    }

    constructor(props) {
        super(props);
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
        const lineStroke = {
            stroke: pointsColor,
            strokeWidth: strokeWidth / 2,
        };
        // There are 4 lines to visualize this chord
        const chord = DIATONIC_CHORDS[activeChordIndex];
        const { label, notes } = chord;
        // example notes: ['B', 'C', 'E', 'G'],
        console.tron.log('Rendering ' + label);
        return notes.map((note, i) => {
            // We are making a line from this note to the next note,
            // but we need to figure out which actual indexes on the circle correspond to these
            // notes before we can draw the line
            const pointIndex1 = NOTES_TO_INDEX[note];
            const nextNote = notes[(i + 1) % notes.length];
            const pointIndex2 = NOTES_TO_INDEX[nextNote];
            const pt1 = this.points[pointIndex1];
            const pt2 = this.points[pointIndex2];
            return (
                <Line
                    key={`${note}-${nextNote}`}
                    x1={pt1.x}
                    y1={pt1.y}
                    x2={pt2.x}
                    y2={pt2.y}
                    {...lineStroke}
                />
            );
        });
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
        return (
            <View>
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
                        fill={fillColor}
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