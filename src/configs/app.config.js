import fs from 'fs'
import dotenv from 'dotenv'
import convict from 'convict'

if (fs.existsSync('.env')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env'))

  for (const key in envConfig) {
    process.env[key] = envConfig[key]
  }
}

const config = convict({
  app: {
    name: {
      doc: 'Name of the service',
      format: String,
      default: 'logancasino-user-backend'
    },
    url: {
      doc: 'URL of the service',
      format: String,
      default: 'user-backend:8003',
      env: 'APP_URL'
    },
    appName: {
      doc: 'Name of the application',
      format: String,
      default: 'Logan Casino',
      env: 'APP_NAME'
    }
  },

  user_frontend_app_url: {
    format: String,
    default: '',
    env: 'APP_USER_FRONTEND_URL'
  },

  user_backend_app_url: {
    format: String,
    default: '',
    env: 'APP_USER_BACKEND_URL'
  },

  basic_auth: {
    username: {
      doc: 'Basic Auth User Name',
      format: String,
      default: 'username',
      env: 'BASIC_AUTH_USERNAME'
    },
    password: {
      doc: 'Basic Auth User Password',
      format: String,
      default: 'password',
      env: 'BASIC_AUTH_PASSWORD'
    }
  },

  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'staging', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },

  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8080,
    env: 'PORT'
  },

  db: {
    name: {
      doc: 'Database Name',
      format: String,
      default: 'api',
      env: 'DB_NAME'
    },
    username: {
      doc: 'Database user',
      format: String,
      default: 'postgres',
      env: 'DB_USERNAME'
    },
    password: {
      doc: 'Database password',
      format: '*',
      default: 'postgres',
      env: 'DB_PASSWORD'
    },
    host: {
      doc: 'DB host',
      format: String,
      default: '127.0.0.1',
      env: 'DB_HOST'
    },
    port: {
      doc: 'DB PORT',
      format: 'port',
      default: '5432',
      env: 'DB_PORT'
    }
  },

  slave_db: {
    name: {
      doc: 'Database Name',
      format: String,
      default: 'api',
      env: 'SLAVE_DB_NAME'
    },
    username: {
      doc: 'Database user',
      format: String,
      default: 'postgres',
      env: 'SLAVE_DB_USERNAME'
    },
    password: {
      doc: 'Database password',
      format: '*',
      default: 'postgres',
      env: 'SLAVE_DB_PASSWORD'
    },
    host: {
      doc: 'DB host',
      format: String,
      default: '127.0.0.1',
      env: 'SLAVE_DB_HOST'
    },
    port: {
      doc: 'DB PORT',
      format: 'port',
      default: '5432',
      env: 'SLAVE_DB_PORT'
    }
  },

  redis_db: {
    password: {
      doc: 'Redis Database password',
      format: '*',
      default: '',
      env: 'REDIS_DB_PASSWORD'
    },
    host: {
      doc: 'Redis DB host',
      format: String,
      default: '127.0.0.1',
      env: 'REDIS_DB_HOST'
    },
    port: {
      doc: 'Redis DB PORT',
      format: 'port',
      default: 6379,
      env: 'REDIS_DB_PORT'
    }
  },

  queue_worker_redis_db: {
    password: {
      doc: 'Redis Database password',
      format: '*',
      default: '',
      env: 'QUEUE_WORKER_REDIS_DB_PASSWORD'
    },
    host: {
      doc: 'Redis DB host',
      format: String,
      default: '127.0.0.1',
      env: 'QUEUE_WORKER_REDIS_DB_HOST'
    },
    port: {
      doc: 'Redis DB PORT',
      format: 'port',
      default: 6379,
      env: 'QUEUE_WORKER_REDIS_DB_PORT'
    }
  },

  log_level: {
    doc: 'level of logs to show',
    format: String,
    default: 'debug',
    env: 'LOG_LEVEL'
  },

  jwt: {
    loginTokenSecret: {
      doc: 'JWT Secret Key',
      format: String,
      default: 'secretkey',
      env: 'JWT_LOGIN_SECRET'
    },
    loginTokenExpiry: {
      doc: 'JWT Expiry time',
      format: String,
      default: '1d',
      env: 'JWT_LOGIN_TOKEN_EXPIRY'
    }
  },

  bcrypt: {
    hashingRounds: {
      doc: 'Bcrypt Hashing rounds',
      default: '',
      format: Number,
      env: 'HASHING_ROUNDS'
    }
  },

  webApp: {
    baseUrl: {
      default: '',
      env: 'WEB_APP_BASE_URL'
    },
    whitelist: {
      default: [],
      format: Array,
      env: 'WHITELIST'
    }
  },
  aws: {
    s3: {
      region: {
        doc: 'S3 region name',
        format: String,
        default: 'us-east-1',
        env: 'AWS_S3_REGION'
      },
      bucket_name: {
        doc: 'bucket name',
        format: String,
        default: '',
        env: 'AWS_S3_BUCKET_NAME'
      },
      access_key_id: {
        doc: 'access key id',
        format: String,
        default: '',
        env: 'AWS_S3_ACCESS_KEY_ID'
      },
      secret_access_key: {
        doc: 'secret access key',
        format: String,
        default: '',
        env: 'AWS_S3_SECRET_ACCESS_KEY'
      },
      static_asset_url: {
        doc: 'The s3 URL to fetch images and other static assets',
        format: String,
        default: 'http://localhost:8080',
        env: 'AWS_S3_STATIC_ASSET_URL'
      }
    }
  },

  meta_mask: {
    sign_message: {
      doc: 'Meta Mask Sign Message',
      default: '',
      format: String,
      env: 'USER_BACKEND_META_MASK_SIGN_MESSAGE'
    }
  },

  nux_game: {
    key: {
      format: String,
      default: '',
      env: 'NUX_GAME_KEY'
    },
    sports_betting_id: {
      format: String,
      default: '',
      env: 'NUX_GAME_SPORTS_BETTING_ID'
    },
    url: {
      default: '',
      env: 'NUX_GAME_URL'
    },
    token_expiry: {
      format: Number,
      default: '',
      env: 'NUX_GAME_TOKEN_EXPIRY'
    },
    exit_url: {
      format: String,
      default: '',
      env: 'NUX_GAME_EXIT_URL'
    }
  },

  game_engine_url: {
    format: String,
    default: 'http://game-engine-and-queue-workers-dashboard:8080',
    env: 'GAME_ENGINE_URL'
  },

  coin_payments: {
    public_key: {
      doc: 'Coin Payments public key',
      format: String,
      default: '',
      env: 'COIN_PAYMENTS_PUBLIC_KEY'
    },
    secret: {
      doc: 'coin payments secret key',
      format: String,
      default: '',
      env: 'COIN_PAYMENTS_SECRET'
    },
    ipn_secret: {
      doc: 'coin payments ipn secret key',
      format: String,
      default: '',
      env: 'COIN_PAYMENTS_IPN_SECRET'
    },
    merchant_id: {
      doc: 'coin payments merchant id',
      format: String,
      default: '',
      env: 'COIN_PAYMENTS_MERCHANT_ID'
    }
  },

  gogopay: {
    secret_key: {
      format: String,
      default: '',
      env: 'GOGOPAY_KEY'
    },
    app_id: {
      format: String,
      default: '',
      env: 'GOGOPAY_APP_ID'
    },
    url: {
      format: String,
      default: '',
      env: 'GOGOPAY_URL'
    }

  },

  smartsoft: {
    secret_key: {
      format: String,
      default: '',
      env: 'SMARTSOFT_KEY'
    },
    smartsoft_game_url: {
      format: String,
      default: '',
      env: 'SMARTSOFT_URL'
    },
    token_expiry: {
      format: Number,
      default: '',
      env: 'TOKEN_EXPIRY'
    }
  },

  evolution: {
    host: {
      format: String,
      default: '',
      env: 'EVOLUTION_HOST'
    },
    casino_key: {
      format: String,
      default: '',
      env: 'EVOLUTION_CASINO_KEY'
    },
    api_token: {
      format: Number,
      default: '',
      env: 'EVOLUTION_API_TOKEN'
    },
    merchant_id: {
      format: Number,
      default: '',
      env: 'EVOLUTION_MERCHANT_ID'
    }
  },

  betby: {
    operatorId: {
      format: String,
      default: '',
      env: 'BETBY_OPERATOR_ID'
    },
    brandId: {
      format: String,
      default: '',
      env: 'BETBY_BRAND_ID'
    },
    scriptUrl: {
      format: Number,
      default: '',
      env: 'BETBY_SCRIPT_URL'
    },
    privateKey: {
      format: String,
      default: '',
      env: 'BETBY_PRIVATE_KEY'
    },
    publicKey: {
      format: String,
      default: '',
      env: 'BETBY_PUBLIC_KEY'
    }
  },

  ear_casino: {
    host: {
      format: String,
      default: '',
      env: 'EAR_HOST'
    },
    client_id: {
      format: Number,
      default: '',
      env: 'EAR_CLIENT_ID'
    },
    client_secret: {
      format: String,
      default: '',
      env: 'EAR_CLIENT_SECRET'
    },
    lobby_url: {
      format: String,
      default: '',
      env: 'LOBBY_URL'
    }
  },

  kyc_verification: {
    base_api_url: {
      format: String,
      default: '',
      env: 'SUMSUB_BASE_URL'
    },
    sumsub_secret_key: {
      format: String,
      default: '',
      env: 'SUMSUB_SECRET_KEY'
    },
    sumsub_app_token: {
      format: String,
      default: '',
      env: 'SUMSUB_APP_TOKEN'
    }
  },

  google_login: {
    client_id: {
      format: String,
      default: '',
      env: 'GOOGLE_CLIENT_ID'
    },
    client_secret: {
      format: String,
      default: '',
      env: 'GOOGLE_CLIENT_SECRET'
    }
  },

  twitch_login: {
    client_id: {
      format: String,
      default: '',
      env: 'TWITCH_CLIENT_ID'
    },
    client_secret: {
      format: String,
      default: '',
      env: 'TWITCH_CLIENT_SECRET'
    }
  },

  conversion_api: {
    url: {
      format: String,
      default: '',
      env: 'CONVERSION_URL'
    }
  },

  twitch_linked_frontend_app_url: {
    format: String,
    default: '',
    env: 'TWITCH_LINKED_FRONTEND_URL'
  },

  twitter: {
    client_id: {
      format: String,
      default: '',
      env: 'TWITTER_CLIENT_ID'
    },
    client_secret: {
      format: String,
      default: '',
      env: 'TWITTER_CLIENT_SECRET'
    },
    api_key: {
      format: String,
      default: '',
      env: 'TWITTER_API_KEY'
    },
    api_key_secret: {
      format: String,
      default: '',
      env: 'TWITTER_API_KEY_SECRET'
    },
    oauth_callback: {
      format: String,
      default: '',
      env: 'TWITTER_OAUTH_CALLBACK'
    }
  },

  fireblocks: {
    api_key: {
      format: String,
      default: '',
      env: 'FIREBLOCKS_API_KEY'
    },
    api_secret: {
      format: String,
      default: '',
      env: 'FIREBLOCKS_SECRET_KEY'
    },
    base_url: {
      format: String,
      default: '',
      env: 'FIREBLOCKS_BASE_URL'
    },
    funding_account_id: {
      format: String,
      default: '1',
      env: 'FIREBLOCKS_FUNDING_ACCOUNT_ID'
    }
  },

  moonpay: {
    moonpay_api_url: {
      format: String,
      default: '',
      env: 'MOONPAY_API_URL'
    },
    moonpay_public_key: {
      format: String,
      default: '',
      env: 'MOONPAY_PUBLIC_KEY'
    },
    moonpay_secret_key: {
      format: String,
      default: '',
      env: 'MOONPAY_SECRET_KEY'
    },
    moonpay_webhook_key: {
      format: String,
      default: '',
      env: 'MOONPAY_WEEBHOOK_KEY'
    }
  }
})
config.validate({ allowed: 'strict' })

export default config
