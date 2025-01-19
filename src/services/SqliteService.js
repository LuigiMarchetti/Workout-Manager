import SQLite from 'react-native-sqlite-storage';

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
        // Base query with indexed columns first for better performance
        let query = 'SELECT id, name, bodyPart, equipment, target, mediaPath FROM Exercise WHERE 1=1';
        const params = [];
  
        // Optimize filters by checking null values instead of specific strings
        if (equipment) {
          query += ' AND equipment = ?';
          params.push(equipment);
        }
  
        if (bodyPart) {
          query += ' AND bodyPart = ?';
          params.push(bodyPart);
        }
  
        // Add name search filter if provided - use INDEX if available
        if (searchQuery && searchQuery.trim() !== '') {
          query += ' AND name LIKE ?';
          params.push(`%${searchQuery.trim()}%`);
        }
  
        // Add ORDER BY for consistent pagination
        query += ' ORDER BY id';
  
        // Add pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(limit);
        params.push(skip);
  
        // Get total count for better pagination handling
        const countQuery = query.replace('SELECT id, name, bodyPart, equipment, target, mediaPath', 'SELECT COUNT(*) as total')
                               .replace(' LIMIT ? OFFSET ?', '');
        const countParams = params.slice(0, -2);
        
        // Execute count query first
        tx.executeSql(
          countQuery,
          countParams,
          (_, countResult) => {
            const totalCount = countResult.rows.item(0).total;
            
            // Then execute main query
            tx.executeSql(
              query,
              params,
              (_, results) => {
                const exercises = Array.from({ length: results.rows.length }, 
                  (_, i) => results.rows.item(i)
                );
                
                resolve({
                  exercises,
                  hasMore: totalCount > (skip + limit),
                  totalCount
                });
              },
              (_, error) => reject(error)
            );
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