import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryAxis,
  VictoryLegend,
  VictoryTooltip,
  createContainer,
} from 'victory-native';
import { groupBy } from 'lodash';

// Victory의 컨테이너를 조합하여 Zoom과 Voronoi(툴팁 트리거) 기능을 함께 사용
const VictoryZoomVoronoiContainer = createContainer('zoom', 'voronoi');

// 세트 구성별 색상 맵
const COLOR_SCALE = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF", "#33FFA1"];

const ExerciseProgressGraph = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return <View style={styles.centered}><Text>표시할 기록이 없습니다.</Text></View>;
    }

    // 세트 구성(예: "5x5")을 기준으로 데이터 그룹핑
    const groupedData = groupBy(logs, log => `${log.sets.length}x${log.sets[0].reps}`);

    const chartData = Object.keys(groupedData).map((key, index) => ({
        name: key,
        color: COLOR_SCALE[index % COLOR_SCALE.length],
        data: groupedData[key].map(log => ({
            x: new Date(log.completedAt.seconds * 1000),
            y: log.sets[0].weight, // 대표값으로 첫 세트의 무게 사용
            label: `${new Date(log.completedAt.seconds * 1000).toLocaleDateString()}
${log.sets[0].weight}kg`,
        })),
    }));

    return (
        <View style={styles.container}>
            <VictoryChart
                width={Dimensions.get('window').width - 20}
                padding={{ top: 30, bottom: 50, left: 50, right: 30 }}
                scale={{ x: 'time' }}
                containerComponent={
                    <VictoryZoomVoronoiContainer
                        voronoiDimension="x"
                        labels={({ datum }) => datum.label}
                        labelComponent={<VictoryTooltip cornerRadius={5} flyoutStyle={{ fill: 'white' }} />}
                    />
                }
            >
                <VictoryLegend
                    x={50}
                    y={5}
                    orientation="horizontal"
                    gutter={20}
                    data={chartData.map(series => ({ name: series.name, symbol: { fill: series.color } }))}
                />
                
                <VictoryAxis
                    tickFormat={(t) => `${new Date(t).getMonth() + 1}/${new Date(t).getDate()}`}
                    style={{
                        tickLabels: { fontSize: 10, padding: 5 },
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    tickFormat={(y) => `${y}kg`}
                    style={{
                        tickLabels: { fontSize: 10, padding: 5 },
                    }}
                />

                {chartData.map((series, index) => (
                    <VictoryLine
                        key={index}
                        data={series.data}
                        style={{ data: { stroke: series.color, strokeWidth: 2 } }}
                    />
                ))}
                
                {chartData.map((series, index) => (
                     <VictoryScatter
                        key={index}
                        data={series.data}
                        size={5}
                        style={{ data: { fill: series.color } }}
                    />
                ))}
                
            </VictoryChart>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
    },
    centered: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ExerciseProgressGraph; 