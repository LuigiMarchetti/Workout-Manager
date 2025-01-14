import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';

class SqliteService {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = SQLite.openDatabase(
      {
        name: 'prepopulated.db',
        createFromLocation: '~www/prepopulated.db',
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
          name: 'prepopulated.db',
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

  async getFilteredExercises({ searchQuery = '', equipment = 'All Equipment', bodyPart = 'All Body Parts', skip = 0, limit = 20 }) {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        let query = 'SELECT * FROM Exercise WHERE 1=1';
        const params = [];
  
        // Add name search filter if provided
        if (searchQuery && searchQuery.trim() !== '') {
          query += ' AND name LIKE ?';
          params.push(`%${searchQuery.trim()}%`);
        }
  
        // Add equipment filter if it's not "All Equipment"
        if (equipment && equipment !== 'All Equipment') {
          query += ' AND equipment = ?';
          params.push(equipment);
        }
  
        // Add bodyPart filter if it's not "All Body Parts"
        if (bodyPart && bodyPart !== 'All Body Parts') {
          query += ' AND bodyPart = ?';
          params.push(bodyPart);
        }
  
        // Add pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(limit + 1); // Get one extra to check if there's more
        params.push(skip);
  
        tx.executeSql(
          query,
          params,
          (_, results) => {
            const rows = results.rows;
            const exercises = [];
            
            // Only take up to the limit (exclude the extra one we requested)
            const maxRows = Math.min(rows.length, limit);
            
            for (let i = 0; i < maxRows; i++) {
              exercises.push(rows.item(i));
            }
  
            // Check if there are more results
            const hasMore = rows.length > limit;
  
            resolve({
              exercises,
              hasMore
            });
          },
          (_, error) => {
            reject(error);
          }
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