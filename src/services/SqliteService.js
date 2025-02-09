import SQLite from 'react-native-sqlite-storage';
import { v4 as uuidv4 } from 'uuid';

class SqliteService {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = SQLite.openDatabase(
      {
        name: 'sqlite.db',
        createFromLocation: '~www/sqlite.db',
      },
      () => {
        console.log('Database opened successfully');
      },
      error => {
        setError(`Error opening database: ${error.message}`);
        setIsLoading(false);
      }
    );

    return this.db;
  }

  openDatabase(path) {
    return new Promise((resolve, reject) => {
      SQLite.openDatabase(
        {
          name: 'sqlite.db',
          location: 'default',
        },
        (db) => {
          resolve(db);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async getAllExercises() {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM Exercise',
          [],
          (_, results) => {
            const rows = results.rows;
            const exercises = [];
            for (let i = 0; i < rows.length; i++) {
              exercises.push(rows.item(i));
            }
            resolve(exercises);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }

  async getFilteredExercises({ searchQuery = '', equipment = null, bodyPart = null, skip = 0, limit = 20 }) {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        let query = 'SELECT id, name, bodyPart, equipment, target, mediaPath FROM Exercise WHERE 1=1';
        const params = [];

        if (equipment) {
          query += ' AND equipment = ?';
          params.push(equipment);
        }

        if (bodyPart) {
          query += ' AND bodyPart = ?';
          params.push(bodyPart);
        }

        if (searchQuery && searchQuery.trim() !== '') {
          query += ' AND name LIKE ?';
          params.push(`%${searchQuery.trim()}%`);
        }

        query += ' ORDER BY id LIMIT ? OFFSET ?';
        params.push(limit);
        params.push(skip);

        tx.executeSql(
          query,
          params,
          (_, results) => {
            const exercises = Array.from({ length: results.rows.length }, (_, i) => results.rows.item(i));
            resolve({
              exercises,
              hasMore: exercises.length === limit,
              totalCount: exercises.length
            });
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async createRoutine(routine) {
    // Generate a UUID on the JS side
    const routineId = uuidv4();
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO Routine (id, name, description) VALUES (?, ?, ?)`,
          [routineId, routine.name, routine.description],
          (_, result) => {
            // Resolve with the generated UUID
            resolve(routineId);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async addExercisesToRoutine(routineId, exercises) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        exercises.forEach((exercise, index) => {
          tx.executeSql(
            `INSERT OR REPLACE INTO Routine_Exercise 
                     (routine_id, exercise_id, exercise_order) 
                     VALUES (?, ?, ?)`,
            [routineId, exercise.id, index],
            () => { },
            (_, error) => reject(error)
          );
        });
        resolve();
      });
    });
  }

  closeDatabase() {
    if (this.db) {
      this.db.close(() => {
        console.log('Database closed');
      });
      this.db = null;
    }
  }
}

export default new SqliteService();