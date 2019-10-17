import { segmentWriteKey } from '../env';
import Analytics from 'analytics-node';

export function identifyUserWithMetadata(email:string, traits:Record<string, any>) {
  if (typeof segmentWriteKey !== 'string') return;
  console.log(`Segment key is present, attempting to track ${email} with ${JSON.stringify(traits, null, 2)}`)
  const userId = email;
  const analytics = new Analytics(segmentWriteKey, { flushAt: 1 });
  analytics
    .track({
      userId, 
      event: 'User Signup - Server Confirmation',
      properties: { ...traits }
  })
    .identify({
      userId, traits
  })
  analytics.flush();
  console.log('Tracking allegedly complete');
}

export default { identifyUserWithMetadata }

