
// import Redis from 'ioredis'
// import config from '../configs/app.config'

// const connection = {
//   host: config.get('redis_db.host'),
//   port: config.get('redis_db.port'),
//   password: config.get('redis_db.password')
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
//   host: config.get('redis_db.host'),
//   port: config.get('redis_db.port'),
//   password: config.get('redis_db.password'),
//   tls: {}, // important for rediss://
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

