// class InMemoryDB {
//     constructor() {
//         if (!await inMemoryDB.instance) {
//             this.gameSettings = {};
//             this.users = {};
//             this.wallets = {};
//             this.currencies = {};
//             this.mineGameBets = {};
//             this.crashGameBets = {};
//             this.crashGameRounddetails = {};
//             await inMemoryDB.instance = this;
//         }

//         return await inMemoryDB.instance;
//     }

//     // Set data for a given model
//     set(modelName, id, data) {
//         if (Array.isArray(data)) {
//             // Store multiple data at once
//             data.forEach(({ gameId, ...values }) => {
//                 values.gameId = gameId;
//                 this[modelName][gameId] = {
//                     ...(this[modelName][gameId] || {}),
//                     ...values,
//                 };
//             });
//         } else {
//             if (!this[modelName]) this[modelName] = {};
//             this[modelName][id] = data;
//         }
//     }

//     // Get data for a given model by ID
//     get(modelName, id) {
//         return this[modelName] ? this[modelName][id] : null;
//     }

//     getAll(modelName) {
//         return Object.values(this[modelName] || {});
//     }

//     findByField(modelName, fieldName, value) {
//         const records = this[modelName] || {};
//         const crashGameRound = await inMemoryDB.getAll(modelName);

//         console.log(
//             "findByFieldfindByField",
//             modelName,
//             records,
//             crashGameRound
//         );
//         return (
//             Object.values(records).find(
//                 (record) => record[fieldName] === value
//             ) || null
//         );
//     }

//     findAllByField(modelName, fieldName, value) {
//         const records = this[modelName] || {};
//         return Object.values(records).filter(
//             (record) => record[fieldName] === value
//         );
//     }

//     // Find a single record by a query (simple implementation)
//     findOne(modelName, query) {
//         const id = query.where.id;
//         return this.get(modelName, id);
//     }
// }

// // Singleton Instance
// // Export a single shared instance
// const inMemoryDB = new InMemoryDB();

// Object.freeze(inMemoryDB); // Optional: Prevent modifications

// await inMemoryDB.set("gameSettings", "", [
//     {
//         id: 4,
//         gameId: "4",
//         minBet: {
//             EUR: 1,
//             USD: 1,
//         },
//         maxBet: {
//             EUR: 20,
//             USD: 20,
//         },
//         maxProfit: {
//             EUR: 50,
//             USD: 50,
//         },
//         houseEdge: 4,
//         minOdds: 1,
//         maxOdds: 20,
//         minAutoRate: 0,
//         maxNumberOfAutoBets: 50,
//         createdAt: "2025-01-21T09:02:19.680Z",
//         updatedAt: "2025-01-21T09:02:19.680Z",
//         gameDetails: {
//             id: "4",
//             name: "coinflip",
//             status: false,
//             createdAt: "2025-01-21T09:02:19.638Z",
//             updatedAt: "2025-01-21T09:02:19.638Z",
//         },
//     },
//     {
//         id: 6,
//         gameId: "6",
//         minBet: {
//             EUR: 1,
//             USD: 1,
//         },
//         maxBet: {
//             EUR: 20,
//             USD: 20,
//         },
//         maxProfit: {
//             EUR: 50,
//             USD: 50,
//         },
//         houseEdge: 4,
//         minOdds: 1,
//         maxOdds: 20,
//         minAutoRate: 0,
//         maxNumberOfAutoBets: 50,
//         createdAt: "2025-01-21T09:02:19.680Z",
//         updatedAt: "2025-01-21T09:02:19.680Z",
//         gameDetails: {
//             id: "6",
//             name: "rollercoaster",
//             status: true,
//             createdAt: "2025-01-21T09:02:19.638Z",
//             updatedAt: "2025-01-21T09:02:19.638Z",
//         },
//     },
//     {
//         id: 7,
//         gameId: "7",
//         minBet: {
//             EUR: 1,
//             USD: 1,
//         },
//         maxBet: {
//             EUR: 20,
//             USD: 20,
//         },
//         maxProfit: {
//             EUR: 50,
//             USD: 50,
//         },
//         houseEdge: 4,
//         minOdds: 1,
//         maxOdds: 20,
//         minAutoRate: 0,
//         maxNumberOfAutoBets: 50,
//         createdAt: "2025-01-21T09:02:19.680Z",
//         updatedAt: "2025-01-21T09:02:19.680Z",
//         gameDetails: {
//             id: "7",
//             name: "crypto-futures",
//             status: true,
//             createdAt: "2025-01-21T09:02:19.638Z",
//             updatedAt: "2025-01-21T09:02:19.638Z",
//         },
//     },
//     {
//         id: 1,
//         gameId: "1",
//         minBet: {
//             USD: "1",
//         },
//         maxBet: {
//             USD: "20",
//         },
//         maxProfit: {
//             USD: "50",
//         },
//         houseEdge: 4,
//         minOdds: 1,
//         maxOdds: 20,
//         minAutoRate: 1.01,
//         maxNumberOfAutoBets: 50,
//         createdAt: "2025-01-21T09:02:19.680Z",
//         updatedAt: "2025-01-30T11:22:53.615Z",
//         gameDetails: {
//             id: "1",
//             name: "crash",
//             status: true,
//             createdAt: "2025-01-21T09:02:19.638Z",
//             updatedAt: "2025-01-21T09:02:19.638Z",
//         },
//     },
//     {
//         id: 2,
//         gameId: "2",
//         minBet: {
//             USD: "1",
//         },
//         maxBet: {
//             USD: "100",
//         },
//         maxProfit: {
//             USD: "5000",
//         },
//         houseEdge: 4,
//         minOdds: 0,
//         maxOdds: 100,
//         minAutoRate: 0,
//         maxNumberOfAutoBets: 50,
//         createdAt: "2025-01-21T09:02:19.680Z",
//         updatedAt: "2025-03-26T07:23:34.309Z",
//         gameDetails: {
//             id: "2",
//             name: "hilo",
//             status: true,
//             createdAt: "2025-01-21T09:02:19.638Z",
//             updatedAt: "2025-01-21T09:02:19.638Z",
//         },
//     },
//     {
//         id: 5,
//         gameId: "5",
//         minBet: {
//             USD: "1",
//         },
//         maxBet: {
//             USD: "200",
//         },
//         maxProfit: {
//             USD: "5000",
//         },
//         houseEdge: 4,
//         minOdds: 1,
//         maxOdds: 20,
//         minAutoRate: 0,
//         maxNumberOfAutoBets: 5,
//         createdAt: "2025-01-21T09:02:19.680Z",
//         updatedAt: "2025-03-31T09:44:40.920Z",
//         gameDetails: {
//             id: "5",
//             name: "plinko",
//             status: true,
//             createdAt: "2025-01-21T09:02:19.638Z",
//             updatedAt: "2025-01-21T09:02:19.638Z",
//         },
//     },
//     {
//         id: 3,
//         gameId: "3",
//         minBet: {
//             USD: "2",
//         },
//         maxBet: {
//             USD: "200",
//         },
//         maxProfit: {
//             USD: "5000",
//         },
//         houseEdge: 4,
//         minOdds: 1,
//         maxOdds: 20,
//         minAutoRate: 1,
//         maxNumberOfAutoBets: 50,
//         createdAt: "2025-01-21T09:02:19.680Z",
//         updatedAt: "2025-03-31T10:22:10.173Z",
//         gameDetails: {
//             id: "3",
//             name: "mine",
//             status: true,
//             createdAt: "2025-01-21T09:02:19.638Z",
//             updatedAt: "2025-01-21T09:02:19.638Z",
//         },
//     },
// ]);

// export default inMemoryDB;


// libs/redisDB.js
import redisClient from './redisClient'; // Your Redis setup instance

const PREFIX = 'gameDB:';

class RedisDB {
  async set(modelName, id, data) {
    const key = `${PREFIX}${modelName}:${id}`;
    await redisClient.client.set(key, JSON.stringify(data));
  }

  async setMany(modelName, dataArray) {
    const pipeline = redisClient.client.multi();
    dataArray.forEach(data => {
      const id = data.gameId || data.id;
      const key = `${PREFIX}${modelName}:${id}`;
      pipeline.set(key, JSON.stringify(data));
    });
    await pipeline.exec();
  }

  async get(modelName, id) {
    const key = `${PREFIX}${modelName}:${id}`;
    const data = await redisClient.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async getAll(modelName) {
    const pattern = `${PREFIX}${modelName}:*`;
    let cursor = '0';
    const keys = [];

    // Use SCAN for safety and performance
    do {
      const [newCursor, scannedKeys] = await redisClient.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;
      keys.push(...scannedKeys);
    } while (cursor !== '0');

    if (keys.length === 0) return [];

    const values = await redisClient.client.mget(keys);
    return values.map(d => JSON.parse(d));
  }

  async findByField(modelName, fieldName, value) {
    const all = await this.getAll(modelName);
    return all.find(item => item[fieldName] === value) || null;
  }

  async findAllByField(modelName, fieldName, value) {
    const all = await this.getAll(modelName);
    return all.filter(item => item[fieldName] === value);
  }
}

const inMemoryDB = new RedisDB();


inMemoryDB.setMany("gameSettings", [
    {
        id: 4,
        gameId: "4",
        minBet: {
            EUR: 1,
            USD: 1,
        },
        maxBet: {
            EUR: 20,
            USD: 20,
        },
        maxProfit: {
            EUR: 50,
            USD: 50,
        },
        houseEdge: 4,
        minOdds: 1,
        maxOdds: 20,
        minAutoRate: 0,
        maxNumberOfAutoBets: 50,
        createdAt: "2025-01-21T09:02:19.680Z",
        updatedAt: "2025-01-21T09:02:19.680Z",
        gameDetails: {
            id: "4",
            name: "coinflip",
            status: false,
            createdAt: "2025-01-21T09:02:19.638Z",
            updatedAt: "2025-01-21T09:02:19.638Z",
        },
    },
    {
        id: 6,
        gameId: "6",
        minBet: {
            EUR: 1,
            USD: 1,
        },
        maxBet: {
            EUR: 20,
            USD: 20,
        },
        maxProfit: {
            EUR: 50,
            USD: 50,
        },
        houseEdge: 4,
        minOdds: 1,
        maxOdds: 20,
        minAutoRate: 0,
        maxNumberOfAutoBets: 50,
        createdAt: "2025-01-21T09:02:19.680Z",
        updatedAt: "2025-01-21T09:02:19.680Z",
        gameDetails: {
            id: "6",
            name: "rollercoaster",
            status: true,
            createdAt: "2025-01-21T09:02:19.638Z",
            updatedAt: "2025-01-21T09:02:19.638Z",
        },
    },
    {
        id: 7,
        gameId: "7",
        minBet: {
            EUR: 1,
            USD: 1,
        },
        maxBet: {
            EUR: 20,
            USD: 20,
        },
        maxProfit: {
            EUR: 50,
            USD: 50,
        },
        houseEdge: 4,
        minOdds: 1,
        maxOdds: 20,
        minAutoRate: 0,
        maxNumberOfAutoBets: 50,
        createdAt: "2025-01-21T09:02:19.680Z",
        updatedAt: "2025-01-21T09:02:19.680Z",
        gameDetails: {
            id: "7",
            name: "crypto-futures",
            status: true,
            createdAt: "2025-01-21T09:02:19.638Z",
            updatedAt: "2025-01-21T09:02:19.638Z",
        },
    },
    {
        id: 1,
        gameId: "1",
        minBet: {
            USD: "1",
        },
        maxBet: {
            USD: "20",
        },
        maxProfit: {
            USD: "50",
        },
        houseEdge: 4,
        minOdds: 1,
        maxOdds: 20,
        minAutoRate: 1.01,
        maxNumberOfAutoBets: 50,
        createdAt: "2025-01-21T09:02:19.680Z",
        updatedAt: "2025-01-30T11:22:53.615Z",
        gameDetails: {
            id: "1",
            name: "crash",
            status: true,
            createdAt: "2025-01-21T09:02:19.638Z",
            updatedAt: "2025-01-21T09:02:19.638Z",
        },
    },
    {
        id: 2,
        gameId: "2",
        minBet: {
            USD: "1",
        },
        maxBet: {
            USD: "100",
        },
        maxProfit: {
            USD: "5000",
        },
        houseEdge: 4,
        minOdds: 0,
        maxOdds: 100,
        minAutoRate: 0,
        maxNumberOfAutoBets: 50,
        createdAt: "2025-01-21T09:02:19.680Z",
        updatedAt: "2025-03-26T07:23:34.309Z",
        gameDetails: {
            id: "2",
            name: "hilo",
            status: true,
            createdAt: "2025-01-21T09:02:19.638Z",
            updatedAt: "2025-01-21T09:02:19.638Z",
        },
    },
    {
        id: 5,
        gameId: "5",
        minBet: {
            USD: "1",
        },
        maxBet: {
            USD: "200",
        },
        maxProfit: {
            USD: "5000",
        },
        houseEdge: 4,
        minOdds: 1,
        maxOdds: 20,
        minAutoRate: 0,
        maxNumberOfAutoBets: 5,
        createdAt: "2025-01-21T09:02:19.680Z",
        updatedAt: "2025-03-31T09:44:40.920Z",
        gameDetails: {
            id: "5",
            name: "plinko",
            status: true,
            createdAt: "2025-01-21T09:02:19.638Z",
            updatedAt: "2025-01-21T09:02:19.638Z",
        },
    },
    {
        id: 3,
        gameId: "3",
        minBet: {
            USD: "2",
        },
        maxBet: {
            USD: "200",
        },
        maxProfit: {
            USD: "5000",
        },
        houseEdge: 4,
        minOdds: 1,
        maxOdds: 20,
        minAutoRate: 1,
        maxNumberOfAutoBets: 50,
        createdAt: "2025-01-21T09:02:19.680Z",
        updatedAt: "2025-03-31T10:22:10.173Z",
        gameDetails: {
            id: "3",
            name: "mine",
            status: true,
            createdAt: "2025-01-21T09:02:19.638Z",
            updatedAt: "2025-01-21T09:02:19.638Z",
        },
    },
]);

export default inMemoryDB;
