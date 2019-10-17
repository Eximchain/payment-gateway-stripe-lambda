import { segmentWriteKey } from '../env';
import Analytics from 'analytics-node';

export function identifyUserWithMetadata(email:string, traits:Record<string, any>) {
  if (typeof segmentWriteKey !== 'string') return;
  const analytics = new Analytics(segmentWriteKey, { flushAt: 1 });
  analytics.track({
    event: 'User Signup - Server Confirmation',
    userId: email
  })
  analytics.identify({
    userId: email,
    traits
  })
  analytics.flush();
}

export default { identifyUserWithMetadata }

