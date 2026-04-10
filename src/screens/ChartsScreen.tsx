import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChartsScreen = () => (
    <View style={styles.container}>
        <Text style={styles.text}>Gráficos Mock</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
    text: { fontSize: 20, fontWeight: 'bold' },
});

export default ChartsScreen;