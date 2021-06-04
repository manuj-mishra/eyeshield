import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import Constants from "expo-constants";
import { Defs, LinearGradient, Stop } from "react-native-svg";
import { LineChart, Grid } from "react-native-svg-charts";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const [distances, setDistances] = useState([0]);
  const [averages, setAverages] = useState([0]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const Gradient = () => (
    <Defs key={"gradient"}>
      <LinearGradient id={"gradient"} x1={"0"} y={"0%"} x2={"100%"} y2={"0%"}>
        <Stop offset={"0%"} stopColor={"rgb(134, 65, 244)"} />
        <Stop offset={"100%"} stopColor={"rgb(66, 194, 244)"} />
      </LinearGradient>
    </Defs>
  );

  const changeValues = (distance) => {
    if (distances.length > 20) {
      setDistances(distances.shift());
      setDistances([...distances, distance]);
      setAverages(averages.shift());
      setAverages([
        ...averages,
        distances.reduce((a, b) => a + b, 0) / distances.length,
      ]);
    } else {
      setDistances([...distances, distance]);
      setAverages([
        ...averages,
        distances.reduce((a, b) => a + b, 0) / distances.length,
      ]);
    }
    setAverages([
      ...averages,
      distances.reduce((a, b) => a + b, 0) / distances.length,
    ]);
    console.log("Current Distance: " + distances[distances.length - 1]);
    console.log("Average Distance:" + averages[averages.length - 1]);
  };

  const handleFaces = (facesDict) => {
    if (facesDict.faces.length > 0) {
      changeValues(
        screenDistance(
          pythagoras(
            facesDict.faces[0].leftEyePosition,
            facesDict.faces[0].rightEyePosition
          )
        ),
        distances
      );
    }
  };

  const pythagoras = (leftEyePosition, rightEyePosition) => {
    return Math.pow(
      Math.pow(Math.abs(leftEyePosition.x - rightEyePosition.x), 2) +
        Math.pow(Math.abs(leftEyePosition.y - rightEyePosition.y), 2),
      1 / 2
    );
  };

  const screenDistance = (eyeDistance) => {
    return (58.8 / (25 * eyeDistance)) * 1000;
  };

  const colour = () => {
    var d = distances[distances.length - 1];
    //var b = 20;
    //var r = Math.max(255 - (d/60)*250, 0);
    //var g = Math.min((d/60)*255, 255);
    //return('rgba('+r+','+g+','+b+',1.0)');

    var m = 1.2;
    var mid = 35;
    var h = d < mid ? 0 : 120;
    var s = Math.min((Math.abs(mid - m * d) / mid) * 100, 100);
    var l = Math.max(100 - (Math.abs(mid - m * d) / mid) * 50, 0);
    return "hsl(" + h + "," + s + "%," + l + "%)";
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        ratio="16:9"
        type={type}
        onFacesDetected={handleFaces}
        faceDetectorSettings={{
          mode: FaceDetector.Constants.Mode.accurate,
          detectLandmarks: FaceDetector.Constants.Landmarks.all,
          runClassifications: FaceDetector.Constants.Classifications.all,
          minDetectionInterval: 250,
          tracking: true,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "white",
            flexDirection: "row",
          }}
        >
          <ScrollView>
            <View style={[styles.mainContainer, { backgroundColor: colour() }]}>
              <View style={styles.headerBar} />
              <View style={[styles.displayBox, styles.topBox]}>
                <Text style={styles.bHeadingText}>Current Distance</Text>
                <Text style={styles.bMainText}>
                  {Math.round(distances[distances.length - 1])}cm
                </Text>
              </View>
              <View style={styles.displayBox}>
                <Text style={styles.bHeadingText}>Average Distance</Text>
                <Text style={styles.bMainText}>
                  {Math.round(
                    distances.reduce((a, b) => a + b, 0) / distances.length
                  )}
                  cm
                </Text>
              </View>
              <View style={styles.displayBox}>
                <Text style={styles.bHeadingText}>Distance graph</Text>
                <LineChart
                  style={styles.graph}
                  data={distances}
                  contentInset={{ top: 20, bottom: 20 }}
                  svg={{
                    strokeWidth: 2,
                    stroke: "url(#gradient)",
                  }}
                >
                  <Grid />
                  <Gradient />
                </LineChart>
              </View>
              <View style={[styles.displayBox, styles.bottomBox]}>
                <Text style={styles.bHeadingText}>Average Distance Graph</Text>
                <LineChart
                  style={styles.graph}
                  data={averages}
                  contentInset={{ top: 20, bottom: 20 }}
                  svg={{
                    strokeWidth: 2,
                    stroke: "url(#gradient)",
                  }}
                >
                  <Grid />
                  <Gradient />
                </LineChart>
              </View>
            </View>
          </ScrollView>
        </View>
      </Camera>
    </View>
  );
}

const keyColor1 = "black";
const marg = 15;
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#F2FFE7",
    justifyContent: "space-around",
  },
  headerBar: {
    height: 50,
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "black",
    padding: 8,
  },
  displayBox: {
    height: 200,
    borderColor: keyColor1,
    backgroundColor: "#F9FFF4",
    borderWidth: 2,
    margin: marg,
    borderRadius: 20,
  },
  topBox: {
    marginTop: marg * 2,
  },
  bottomBox: {
    marginBottom: marg * 2,
  },
  bHeadingText: {
    flex: 1,
    textAlign: "center",
    color: keyColor1,
    paddingTop: 20,
    fontSize: 18,
    fontWeight: "normal",
  },
  bMainText: {
    flex: 4,
    textAlign: "center",
    color: keyColor1,
    paddingTop: 20,
    fontSize: 50,
    fontWeight: "bold",
  },
  graph: {
    flex: 4,
    marginHorizontal: 20,
  },
});
