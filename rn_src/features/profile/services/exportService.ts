import { firestore, auth } from '../../../lib/firebase';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Alert } from 'react-native';

const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = ['date', 'workoutName', 'setIndex', 'weight', 'reps'];
    const csvRows = [headers.join(',')];

    data.forEach(log => {
        const date = log.createdAt?.toDate().toISOString().split('T')[0] || log.date;
        log.sets.forEach((set, index) => {
            const row = [date, log.name, index + 1, set.weight, set.reps];
            csvRows.push(row.join(','));
        });
    });

    return csvRows.join('\n');
};

export const exportWorkoutHistory = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
        Alert.alert('Error', 'You must be logged in to export data.');
        return;
    }

    try {
        const snapshot = await firestore()
            .collection('users')
            .doc(userId)
            .collection('workouts')
            .orderBy('createdAt', 'desc')
            .get();

        const workouts = snapshot.docs.map(doc => doc.data());
        const csvString = convertToCSV(workouts);

        if (!csvString) {
            Alert.alert('No Data', 'There is no workout history to export.');
            return;
        }

        const path = `${RNFS.DocumentDirectoryPath}/workout_history.csv`;
        await RNFS.writeFile(path, csvString, 'utf8');

        await Share.open({
            url: `file://${path}`,
            title: 'Share Workout History',
            type: 'text/csv',
        });

    } catch (error) {
        console.error('Export failed:', error);
        Alert.alert('Export Failed', 'Could not export your workout history.');
    }
}; 