import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircleTimerProps {
  duration: number;
  isRecording: boolean;
  onFinish: () => onFinish;
}

const CircleTimer: React.FC<CircleTimerProps> = ({duration, isRecording, onFinish}) => { 
  const [timerVisible, setTimerVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [percentage, setPercentage] = useState(100);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const radius = 50; // radius of the circle
  const strokeWidth = 10; // stroke width of the circle
  const circleLength = 2 * Math.PI * radius; // circumference of the circle

   useEffect(() => {
    setTimerVisible(isRecording);

    if (isRecording) {
      setTimeLeft(duration);
      setPercentage(100);

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timerIntervalRef.current!);
            setPercentage(0);
            if (onFinish) onFinish();
            return 0;
          }
          setPercentage((newTime / duration) * 100);
          return newTime;
        });
      }, 1000);
      
    } else if (!isRecording || timeLeft <= 0) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  
  const strokeOffset = circleLength - (percentage / 100) * circleLength;
  
  return (
    <View style={styles.timerContainer}>
      <Svg width="120" height="120" viewBox="0 0 120 120">
        {/* Background Circle */}
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e6e6e6" // Light gray for background circle
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Active Circle (Change stroke color to see the effect) */}
        <Circle
          cx="60"
          cy="60"
          r={radius}
          stroke="orange" // Green for active circle
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circleLength}
          strokeDashoffset={strokeOffset} // Change this value dynamically for countdown effect
          strokeLinecap="round"
          transform="rotate(-90 60 60)" // Rotate to start at the top
        />
      </Svg>
      
      {/* Countdown Timer Text */}     
      <Text style={styles.text}>{timeLeft}</Text>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  timerContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'orange',
  },
});

export default CircleTimer;

