
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

let redisClientInstance = null;
let publisherClientInstance = null;
let subscriberClientInstance = null;

function createRedisClient() {
  return new Redis({
    host: config.get('redis_db.host'),
    port: config.get('redis_db.port'),
    password: config.get('redis_db.password'),
  });
}

if (!redisClientInstance) redisClientInstance = createRedisClient();
if (!publisherClientInstance) publisherClientInstance = createRedisClient();
if (!subscriberClientInstance) subscriberClientInstance = createRedisClient();

export default {
  // connection,
  publisherClient: publisherClientInstance,
  subscriberClient: subscriberClientInstance,
  client: redisClientInstance
}

