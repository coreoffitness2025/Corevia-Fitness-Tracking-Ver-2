import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import Layout from '../components/common/Layout';
import QnaItem from '../components/qna/QnaItem'; // Assuming QnaItem is moved

const QnaScreen = () => {
  const faqData = [
    {
      question: 'How do I track my workouts?',
      answer: 'Navigate to the "Workout" tab, select a date, and press the "+" button to add a new workout log.'
    },
    {
      question: 'Where can I see my nutrition summary?',
      answer: 'The "Food" tab shows your daily nutrition summary at the top. Log your meals to see it update.'
    },
    {
      question: 'What is 1RM?',
      answer: '1RM (One-Repetition Maximum) is the maximum amount of weight you can lift for a single repetition of a given exercise. You can find the calculator in the Workout section.'
    }
  ];

  return (
    <Layout title="Q&A">
      <ScrollView style={styles.container}>
        {faqData.map((item, index) => (
          <QnaItem key={index} question={item.question} answer={item.answer} />
        ))}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  // ... other styles can be moved to QnaItem
});

export default QnaScreen; 