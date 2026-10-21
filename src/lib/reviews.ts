import AsyncStorage from '@react-native-async-storage/async-storage';

import { createReviewStorage } from '@/lib/review-storage';

export const reviews = createReviewStorage(AsyncStorage);
