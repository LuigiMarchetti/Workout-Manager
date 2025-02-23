import SQLite from 'react-native-sqlite-storage';
import 'react-native-get-random-values';
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
    console.log('Creating routine with data:', routine);
    const routineId = uuidv4();
    console.log('Generated UUID:', routineId);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.transaction(
        tx => {
          console.log('Starting transaction');
          tx.executeSql(
            `INSERT INTO Routine (id, name, description) VALUES (?, ?, ?)`,
            [routineId, routine.name, routine.description],
            (_, result) => {
              console.log('Insert result:', result);

              // Optional: Verify within the transaction (pre-commit)
              tx.executeSql(
                'SELECT * FROM Routine WHERE id = ?',
                [routineId],
                (_, verifyResult) => {
                  console.log('Verify result (pre-commit):', verifyResult.rows.raw());
                },
                (_, verifyError) => {
                  console.error('Verify error:', verifyError);
                  reject(verifyError); // Reject if verification fails
                }
              );
            },
            (_, error) => {
              console.error('Insert error:', error);
              reject(error);
            }
          );
        },
        (transactionError) => {
          console.error('Transaction error:', transactionError);
          reject(transactionError);
        },
        () => { // ✅ Transaction success callback (post-commit)
          console.log('Transaction completed successfully');
          resolve(routineId); // Resolve HERE after commit
        }
      );
    });
  }

  async addExercisesToRoutine(routineId, exercises) {
    console.log('Adding exercises to routine:', { routineId, exercises });

    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => {
          exercises.forEach((exercise, index) => {
            console.log(`Adding exercise ${index + 1}/${exercises.length}:`, exercise);
            tx.executeSql(
              `INSERT OR REPLACE INTO Routine_Exercise 
               (routine_id, exercise_id, exercise_order) 
               VALUES (?, ?, ?)`,
              [routineId, exercise.id, index],
              (_, result) => {
                console.log(`Exercise ${index + 1} inserted successfully:`, result);
              },
              (_, error) => {
                console.error(`Error inserting exercise ${index + 1}:`, error);
                reject(error);
              }
            );
          });
        },
        (transactionError) => {
          console.error('Exercise transaction error:', transactionError);
          reject(transactionError);
        },
        () => { // ✅ Transaction success callback
          console.log('All exercises added successfully');
          resolve(); // Resolve HERE, after commit
        }
      );
    });
  }

  async getAllRoutines() {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        // Query to get routines with exercise count and first exercise image
        const query = `
          SELECT 
            r.id,
            r.name as title,
            COUNT(DISTINCT re.exercise_id) as exercisesNumber,
            (
              SELECT e.id
              FROM Routine_Exercise re2
              JOIN Exercise e ON e.id = re2.exercise_id
              WHERE re2.routine_id = r.id
              ORDER BY re2.exercise_order ASC
              LIMIT 1
            ) as idExercise
          FROM Routine r
          LEFT JOIN Routine_Exercise re ON r.id = re.routine_id
          GROUP BY r.id, r.name
          ORDER BY r.name
        `;

        tx.executeSql(
          query,
          [],
          (_, results) => {
            const routines = [];
            console.log(results.rows)
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              routines.push({
                id: row.id,
                title: row.title,
                exercisesNumber: row.exercisesNumber.toString(),
                idExercise: { uri: row.idExercise }
              });
            }
            resolve(routines);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });
  }

  async getRoutineExercises(routineId) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        const query = `
                SELECT e.* 
                FROM Routine_Exercise re
                JOIN Exercise e ON re.exercise_id = e.id
                WHERE re.routine_id = ?
                ORDER BY re.exercise_order
            `;

        tx.executeSql(
          query,
          [routineId],
          (_, results) => {
            const exercises = [];
            for (let i = 0; i < results.rows.length; i++) {
              exercises.push(results.rows.item(i));
            }
            resolve(exercises);
          },
          (_, error) => reject(error)
        );
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