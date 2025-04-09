// import Redis from 'ioredis'
// import config from '../configs/app.config'

// const connection = {
//   host: config.get('queue_worker_redis_db.host'),
//   port: config.get('queue_worker_redis_db.port'),
//   password: config.get('queue_worker_redis_db.password'),
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false
// }

// export default {
//   connection,
//   publisherClient: new Redis(connection),
//   subscriberClient: new Redis(connection),
//   client: new Redis(connection)
// }

import Redis from 'ioredis';
import config from '../configs/app.config';

// const connection = {
//   host: config.get('queue_worker_redis_db.host'),
//   port: config.get('queue_worker_redis_db.port'),
//   username: config.get('queue_worker_redis_db.user'),
//   password: config.get('queue_worker_redis_db.password'),
//   tls: {}, // important for rediss://
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false
// }

const connection = "redis://red-cvr488uuk2gs73c83180:6379"

let redisClientInstance = null;
let publisherClientInstance = null;
let subscriberClientInstance = null;

function createRedisClient() {
  return new Redis(connection);
}

if (!redisClientInstance) redisClientInstance = createRedisClient();
if (!publisherClientInstance) publisherClientInstance = createRedisClient();
if (!subscriberClientInstance) subscriberClientInstance = createRedisClient();

export default {
  connection,
  publisherClient: publisherClientInstance,
  subscriberClient: subscriberClientInstance,
  client: redisClientInstance
}

