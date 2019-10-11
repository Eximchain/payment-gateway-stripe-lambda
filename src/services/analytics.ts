import { segmentWriteKey } from '../env';
import Analytics from 'analytics-node';

export const analytics = new Analytics(segmentWriteKey, { flushAt: 1 });