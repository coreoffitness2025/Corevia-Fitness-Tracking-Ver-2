import { openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';

let db: SQLiteDatabase;

export const initDB = async (): Promise<SQLiteDatabase> => {
  if (db) {
    return db;
  }
  
  const promise = new Promise<SQLiteDatabase>((resolve, reject) => {
    openDatabase(
      { name: 'corevia-fitness.db', location: 'default' },
      (database) => {
        console.log('Database OPENED');
        db = database;
        // Create tables
        db.transaction(tx => {
          // Table for unsynced workout logs
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS unsynced_workouts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              workout_data TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );`,
            [],
            () => console.log('Unsynced workouts table created successfully'),
            error => reject(error)
          );
          // We can add more tables for food logs etc. here
        });
        resolve(db);
      },
      (error) => {
        console.error('Error opening database', error);
        reject(error);
      }
    );
  });
  return promise;
};

// Example function to add an unsynced workout
export const addUnsyncedWorkout = async (workoutData: any) => {
  const database = await initDB();
  const dataString = JSON.stringify(workoutData);
  
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'INSERT INTO unsynced_workouts (workout_data) VALUES (?);',
        [dataString],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

// Example function to get all unsynced workouts
export const getUnsyncedWorkouts = async () => {
  const database = await initDB();
  
  return new Promise<any[]>((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM unsynced_workouts;',
        [],
        (_, result) => {
          const items = [];
          for (let i = 0; i < result.rows.length; i++) {
            items.push(result.rows.item(i));
          }
          resolve(items);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Example function to delete a synced workout from local DB
export const deleteUnsyncedWorkout = async (id: number) => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'DELETE FROM unsynced_workouts WHERE id = ?;',
        [id],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
}; 