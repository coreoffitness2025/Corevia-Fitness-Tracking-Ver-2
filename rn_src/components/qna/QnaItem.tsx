import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';

const QnaItem = ({ question, answer }) => (
  <Card style={styles.card}>
    <Text style={styles.question}>{question}</Text>
    <Text style={styles.answer}>{answer}</Text>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0, // Override default Card margin
    marginBottom: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  answer: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default QnaItem; 