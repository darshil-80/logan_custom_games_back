class InMemoryDB {
    constructor() {
      this.gameSettings = {}; // Mimics the gameSettings table
      this.users = {}; // Mimics the User table
      this.wallets = {}; // Mimics the Wallet table
      this.currencies = {}; // Mimics the Currency table
      this.mineGameBets = {}; // Mimics the MineGameBet table
      this.mineGamePlayState = {}; // Mimics the mineGamePlayState table

    }
  
    // Set data for a given model
    set(modelName, id, data) {
      if (Array.isArray(data)) {
        // Store multiple data at once
        data.forEach(({ gameId, ...values }) => {
          this[modelName][gameId] = { ...(this[modelName][gameId] || {}), ...values };
        });
      } else {
        if (!this[modelName]) this[modelName] = {};
        this[modelName][id] = data;
      }
    }
  
    // Get data for a given model by ID
    get(modelName, id) {
      return this[modelName] ? this[modelName][id] : null;
    }
  
    getAll(modelName) {
      return Object.values(this[modelName] || {});
    }

    // Find a single record by a query (simple implementation)
    findOne(modelName, query) {
      const id = query.where.id;
      return this.get(modelName, id);
    }
  }
  
  // Singleton Instance
  const inMemoryDB = new InMemoryDB();
 
  inMemoryDB.set('gameSettings', '', [
    {
        "id": "4",
        "gameId": "4",
        "minBet": {
            "EUR": 1,
            "USD": 1
        },
        "maxBet": {
            "EUR": 20,
            "USD": 20
        },
        "maxProfit": {
            "EUR": 50,
            "USD": 50
        },
        "houseEdge": 4,
        "minOdds": 1,
        "maxOdds": 20,
        "minAutoRate": 0,
        "maxNumberOfAutoBets": 50,
        "createdAt": "2025-01-21T09:02:19.680Z",
        "updatedAt": "2025-01-21T09:02:19.680Z",
        "gameDetails": {
            "id": "4",
            "name": "coinflip",
            "status": false,
            "createdAt": "2025-01-21T09:02:19.638Z",
            "updatedAt": "2025-01-21T09:02:19.638Z"
        }
    },
    {
        "id": "6",
        "gameId": "6",
        "minBet": {
            "EUR": 1,
            "USD": 1
        },
        "maxBet": {
            "EUR": 20,
            "USD": 20
        },
        "maxProfit": {
            "EUR": 50,
            "USD": 50
        },
        "houseEdge": 4,
        "minOdds": 1,
        "maxOdds": 20,
        "minAutoRate": 0,
        "maxNumberOfAutoBets": 50,
        "createdAt": "2025-01-21T09:02:19.680Z",
        "updatedAt": "2025-01-21T09:02:19.680Z",
        "gameDetails": {
            "id": "6",
            "name": "rollercoaster",
            "status": true,
            "createdAt": "2025-01-21T09:02:19.638Z",
            "updatedAt": "2025-01-21T09:02:19.638Z"
        }
    },
    {
        "id": "7",
        "gameId": "7",
        "minBet": {
            "EUR": 1,
            "USD": 1
        },
        "maxBet": {
            "EUR": 20,
            "USD": 20
        },
        "maxProfit": {
            "EUR": 50,
            "USD": 50
        },
        "houseEdge": 4,
        "minOdds": 1,
        "maxOdds": 20,
        "minAutoRate": 0,
        "maxNumberOfAutoBets": 50,
        "createdAt": "2025-01-21T09:02:19.680Z",
        "updatedAt": "2025-01-21T09:02:19.680Z",
        "gameDetails": {
            "id": "7",
            "name": "crypto-futures",
            "status": true,
            "createdAt": "2025-01-21T09:02:19.638Z",
            "updatedAt": "2025-01-21T09:02:19.638Z"
        }
    },
    {
        "id": "1",
        "gameId": "1",
        "minBet": {
            "USD": "1"
        },
        "maxBet": {
            "USD": "20"
        },
        "maxProfit": {
            "USD": "50"
        },
        "houseEdge": 4,
        "minOdds": 1,
        "maxOdds": 20,
        "minAutoRate": 1.01,
        "maxNumberOfAutoBets": 50,
        "createdAt": "2025-01-21T09:02:19.680Z",
        "updatedAt": "2025-01-30T11:22:53.615Z",
        "gameDetails": {
            "id": "1",
            "name": "crash",
            "status": true,
            "createdAt": "2025-01-21T09:02:19.638Z",
            "updatedAt": "2025-01-21T09:02:19.638Z"
        }
    },
    {
        "id": "2",
        "gameId": "2",
        "minBet": {
            "USD": "1"
        },
        "maxBet": {
            "USD": "100"
        },
        "maxProfit": {
            "USD": "5000"
        },
        "houseEdge": 4,
        "minOdds": 0,
        "maxOdds": 100,
        "minAutoRate": 0,
        "maxNumberOfAutoBets": 50,
        "createdAt": "2025-01-21T09:02:19.680Z",
        "updatedAt": "2025-03-26T07:23:34.309Z",
        "gameDetails": {
            "id": "2",
            "name": "hilo",
            "status": true,
            "createdAt": "2025-01-21T09:02:19.638Z",
            "updatedAt": "2025-01-21T09:02:19.638Z"
        }
    },
    {
        "id": "5",
        "gameId": "5",
        "minBet": {
            "USD": "1"
        },
        "maxBet": {
            "USD": "200"
        },
        "maxProfit": {
            "USD": "5000"
        },
        "houseEdge": 4,
        "minOdds": 1,
        "maxOdds": 20,
        "minAutoRate": 0,
        "maxNumberOfAutoBets": 5,
        "createdAt": "2025-01-21T09:02:19.680Z",
        "updatedAt": "2025-03-31T09:44:40.920Z",
        "gameDetails": {
            "id": "5",
            "name": "plinko",
            "status": true,
            "createdAt": "2025-01-21T09:02:19.638Z",
            "updatedAt": "2025-01-21T09:02:19.638Z"
        }
    },
    {
        "id": "3",
        "gameId": "3",
        "minBet": {
            "USD": "2"
        },
        "maxBet": {
            "USD": "200"
        },
        "maxProfit": {
            "USD": "5000"
        },
        "houseEdge": 4,
        "minOdds": 1,
        "maxOdds": 20,
        "minAutoRate": 1,
        "maxNumberOfAutoBets": 50,
        "createdAt": "2025-01-21T09:02:19.680Z",
        "updatedAt": "2025-03-31T10:22:10.173Z",
        "gameDetails": {
            "id": "3",
            "name": "mine",
            "status": true,
            "createdAt": "2025-01-21T09:02:19.638Z",
            "updatedAt": "2025-01-21T09:02:19.638Z"
        }
    }
]
)
 
  export default inMemoryDB;
  