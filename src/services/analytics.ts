import { segmentWriteKey } from '../env';
import Analytics from 'analytics-node';

const analytics = new Analytics(segmentWriteKey, { flushAt: 1 });

export function identifyUserWithMetadata(email:string, traits:Record<string, any>) {
  analytics.identify({
    userId: email,
    traits
  })
}

export default { identifyUserWithMetadata }

