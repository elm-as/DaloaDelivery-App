import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './adminStyles';

interface Props {
  icon: React.ReactNode;
  title: string;
  text: string;
}

export const EmptyRow: React.FC<Props> = ({ icon, title, text }) => {
  return (
    <View style={styles.empty}>
      {icon}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
};
