import { segmentWriteKey } from '../env';
import Analytics from 'analytics-node';

export function identifyUserWithMetadata(email:string, traits:Record<string, any>) {
  if (typeof segmentWriteKey !== 'string') return;
  const analytics = new Analytics(segmentWriteKey, { flushAt: 1 });
  analytics.identify({
    userId: email,
    traits
  })
}

export default { identifyUserWithMetadata }

