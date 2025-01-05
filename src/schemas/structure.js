const ExerciseSchema = {
  name: 'Exercise',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', indexed: true },  // id is required and indexed for faster queries
    bodyPart: { type: 'string' },  // Default value if not provided
    equipment: { type: 'string', indexed: true },  // Default to 'None' if not specified
    mediaPath: { type: 'string', optional: true },  // Optional, so it's nullable (can be null or undefined)
    name: { type: 'string', indexed: true },  // Name is required and indexed
    target: { type: 'string', indexed: true },  // Default target muscle group
    instructions: { type: 'list', objectType: 'string' },  // Correctly defines instructions as a list of strings
  },
};

const SetSchema = {
  name: 'Set',
  properties: {
    duration: { type: 'int', optional: true, default: null },  // Nullable, using optional: true
    weight: { type: 'float', optional: true, default: null },  // Nullable, using optional: true
    repetitions: { type: 'int', optional: true, default: null },  // Nullable, using optional: true
  },
};

const ExerciseSessionSchema = {
  name: 'ExerciseSession',
  properties: {
    exercise: 'Exercise',  // Required, a reference to an Exercise object
    sets: { type: 'list', objectType: 'Set', default: [] },  // Correctly defines sets as a list of Set objects
  },
};

const TrainSchema = {
  name: 'Train',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', indexed: true },  // Required and indexed
    routine: 'Routine',  // Required, a reference to a Routine object
    exerciseSessions: { type: 'list', objectType: 'ExerciseSession', default: [] },  // Correctly defines exerciseSessions as a list of ExerciseSession objects
    date: { type: 'date', default: () => new Date() },  // Default to current date if not provided
    duration: { type: 'int', default: 0 },  // Default to 0 if not specified
    volume: { type: 'int', default: 0 },
    notes: { type: 'string', optional: true, default: '' },  // Nullable, using optional: true
  },
};

const RoutineSchema = {
  name: 'Routine',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', indexed: true },  // Required and indexed
    name: { type: 'string' },  // Required
    description: { type: 'string', optional: true, default: '' },  // Optional, using optional: true
    exercises: { type: 'list', objectType: 'Exercise', default: [] },  // Correctly defines exercises as a list of Exercise objects
    createdAt: { type: 'date', default: () => new Date() },  // Default to current date
  },
};

export { ExerciseSchema, SetSchema, ExerciseSessionSchema, TrainSchema, RoutineSchema };
