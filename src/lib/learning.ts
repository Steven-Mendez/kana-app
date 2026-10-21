import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';

import { learningDb } from '@/lib/learning-db';
import { createLearningRepository } from '@/lib/learning-repository';

export const learning = createLearningRepository(
  learningDb,
  randomUUID,
  AsyncStorage,
);
