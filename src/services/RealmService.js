import Realm from 'realm';
import { v4 as uuidv4 } from 'uuid';
import RNFS from 'react-native-fs';
import {
    ExerciseSchema,
    SetSchema,
    ExerciseSessionSchema,
    TrainSchema,
    RoutineSchema
  } from '../schemas/structure';


class RealmService {
  constructor() {
    this.realm = null;
    this.schemas = [ExerciseSchema, SetSchema, ExerciseSessionSchema, TrainSchema, RoutineSchema];
  }

  // Initialize the Realm database
  async initialize() {
    try {
      const bundledDBPath = `${RNFS.MainBundlePath}/prepopulated.realm`;
      const destinationPath = `${RNFS.DocumentDirectoryPath}/prepopulated.realm`;

      // Check if database already exists in app's documents
      const dbExists = await RNFS.exists(destinationPath);

      if (!dbExists) {
        // Copy bundled database to documents directory
        if (await RNFS.exists(bundledDBPath)) {
          await RNFS.copyFile(bundledDBPath, destinationPath);
          console.log('Copied bundled database to documents directory');
        } else {
          console.log('No bundled database found, creating new database');
        }
      }

      // Configure and open Realm
      const config = {
        schema: this.schemas,
        schemaVersion: 1,
        path: destinationPath,
      };

      this.realm = await Realm.open(config);
      console.log('Number of exercises:', this.realm.objects('Exercise').length);
      console.log('Realm initialized successfully');
    } catch (error) {
      console.error('Error initializing Realm:', error);
      throw error;
    }
  }

  getFilteredExercises({ searchQuery = '', equipment = null, bodyPart = null, skip = 0, limit = 20 }) {
    try {
      if (!this.realm) throw new Error('Realm not initialized');

      // Start with all exercises
      let query = this.realm.objects('Exercise');

      // Build the filter conditions
      let conditions = [];
      
      if (searchQuery) {
        conditions.push(`name CONTAINS[c] "${searchQuery}"`);
      }
      
      if (equipment && equipment !== 'All Equipment') {
        conditions.push(`equipment == "${equipment}"`);
      }
      
      if (bodyPart && bodyPart !== 'All Body Parts') {
        conditions.push(`bodyPart == "${bodyPart}"`);
      }

      // Apply filters if any conditions exist
      if (conditions.length > 0) {
        const filterString = conditions.join(' AND ');
        query = query.filtered(filterString);
      }

      // Get total count before pagination
      const totalCount = query.length;

      // Apply pagination
      const paginatedResults = Array.from(query.slice(skip, skip + limit));

      // Return both the paginated results and metadata
      return {
        exercises: paginatedResults,
        totalCount,
        hasMore: totalCount > skip + limit
      };

    } catch (error) {
      console.error('Error getting filtered exercises:', error);
      return { exercises: [], totalCount: 0, hasMore: false };
    }
  }

  // Exercise Operations
  getAllExercises() {
    try {
      return this.realm.objects('Exercise');
    } catch (error) {
      console.error('Error getting exercises:', error);
      return [];
    }
  }

  getExerciseById(id) {
    try {
      return this.realm.objectForPrimaryKey('Exercise', id);
    } catch (error) {
      console.error('Error getting exercise:', error);
      return null;
    }
  }

  // Routine Operations
  createRoutine(name, description = '', exercises = []) {
    try {
      this.realm.write(() => {
        this.realm.create('Routine', {
          id: uuidv4(),
          name,
          description,
          exercises,
          createdAt: new Date(),
        });
      });
    } catch (error) {
      console.error('Error creating routine:', error);
    }
  }

  getAllRoutines() {
    try {
      return this.realm.objects('Routine');
    } catch (error) {
      console.error('Error getting routines:', error);
      return [];
    }
  }

  getRoutineById(id) {
    try {
      return this.realm.objectForPrimaryKey('Routine', id);
    } catch (error) {
      console.error('Error getting routine:', error);
      return null;
    }
  }

  updateRoutine(id, updates) {
    try {
      const routine = this.getRoutineById(id);
      if (routine) {
        this.realm.write(() => {
          Object.assign(routine, updates);
        });
      }
    } catch (error) {
      console.error('Error updating routine:', error);
    }
  }

  deleteRoutine(id) {
    try {
      const routine = this.getRoutineById(id);
      if (routine) {
        this.realm.write(() => {
          this.realm.delete(routine);
        });
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
    }
  }

  // Train Operations
  createTrain(routineId, date = new Date()) {
    try {
      const routine = this.getRoutineById(routineId);
      if (!routine) throw new Error('Routine not found');

      this.realm.write(() => {
        this.realm.create('Train', {
          id: uuidv4(),
          routine,
          exerciseSessions: [],
          date,
          duration: 0,
          volume: 0,
          notes: '',
        });
      });
    } catch (error) {
      console.error('Error creating train:', error);
    }
  }

  getAllTrains() {
    try {
      return this.realm.objects('Train').sorted('date', true);
    } catch (error) {
      console.error('Error getting trains:', error);
      return [];
    }
  }

  getTrainById(id) {
    try {
      return this.realm.objectForPrimaryKey('Train', id);
    } catch (error) {
      console.error('Error getting train:', error);
      return null;
    }
  }

  // Exercise Session Operations
  addExerciseSession(trainId, exerciseId) {
    try {
      const train = this.getTrainById(trainId);
      const exercise = this.getExerciseById(exerciseId);
      
      if (!train || !exercise) throw new Error('Train or Exercise not found');

      this.realm.write(() => {
        const exerciseSession = this.realm.create('ExerciseSession', {
          exercise,
          sets: [],
        });
        train.exerciseSessions.push(exerciseSession);
      });
    } catch (error) {
      console.error('Error adding exercise session:', error);
    }
  }

  // Set Operations
  addSet(trainId, exerciseSessionIndex, setData) {
    try {
      const train = this.getTrainById(trainId);
      if (!train) throw new Error('Train not found');

      const exerciseSession = train.exerciseSessions[exerciseSessionIndex];
      if (!exerciseSession) throw new Error('Exercise session not found');

      this.realm.write(() => {
        const set = this.realm.create('Set', {
          duration: setData.duration || null,
          weight: setData.weight || null,
          repetitions: setData.repetitions || null,
        });
        exerciseSession.sets.push(set);
        
        // Update train volume if weight and reps are provided
        if (setData.weight && setData.repetitions) {
          train.volume += setData.weight * setData.repetitions;
        }
      });
    } catch (error) {
      console.error('Error adding set:', error);
    }
  }

  // Cleanup
  closeRealm() {
    if (this.realm && !this.realm.isClosed) {
      this.realm.close();
    }
  }
}

export default new RealmService();