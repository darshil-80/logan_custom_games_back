// SOCKET RELATED

export const SOCKET_NAMESPACES = {
  DEMO: '/demo',
  WALLET: '/wallet',
  CRASH_GAME: '/demo-crash-game',
  LIVE_WINS: '/live-wins',
  LIVE_CHATS: '/live-chats',
  ROLLER_COASTER_GAME: '/roller-coaster-game',
  ANNOUNCEMENT: '/announcement',
  CRYPTO_FUTURES: '/crypto-futures',
  MINE_GAME: '/mine-game',
  PLINKO_GAME: '/plinko-game',
  KYC_VERIFICATION: '/kyc-verification',
  BONUS: '/bonus',
  RANKING_LEVEL: '/ranking-level',
  WAGERING: '/wagering'
}

export const SOCKET_EMITTERS = {
  DEMO_HELLO_WORLD: SOCKET_NAMESPACES.DEMO + '/helloWorld',
  WALLET_USER_WALLET_BALANCE: SOCKET_NAMESPACES.WALLET + '/userWalletBalance',
  CRASH_GAME_PLACED_BETS: SOCKET_NAMESPACES.CRASH_GAME + '/placedBets',
  CRASH_GAME_WAITING_TIMER: SOCKET_NAMESPACES.CRASH_GAME + '/waitingTimer',
  CRASH_GAME_GRAPH_TIMER: SOCKET_NAMESPACES.CRASH_GAME + '/graphTimer',
  CRASH_GAME_ROUND_STARTED: SOCKET_NAMESPACES.CRASH_GAME + '/roundStarted',
  CRASH_GAME_ROUND_STOPPED: SOCKET_NAMESPACES.CRASH_GAME + '/roundStopped',
  CRASH_GAME_ROUND_BETTING_ON_HOLD: SOCKET_NAMESPACES.CRASH_GAME + '/roundBettingOnHold',
  LIVE_WINS_VIEW: SOCKET_NAMESPACES.LIVE_WINS + '/viewLiveWins',
  LIVE_CHATS_VIEW: SOCKET_NAMESPACES.LIVE_CHATS + '/viewLiveChats',
  ROLLER_COASTER_GAME_PLACED_BETS: SOCKET_NAMESPACES.ROLLER_COASTER_GAME + '/placedBets',
  ROLLER_COASTER_GAME_CLOSED_BETS: SOCKET_NAMESPACES.ROLLER_COASTER_GAME + '/closedBets',
  CRYPTO_FUTURES_CLOSED_BETS: SOCKET_NAMESPACES.CRYPTO_FUTURES + '/closedBets',
  LIVE_ANNOUNCEMENT: SOCKET_NAMESPACES.ANNOUNCEMENT + '/liveAnnouncement',
  MINE_GAME_LIVE_STATS: SOCKET_NAMESPACES.MINE_GAME + '/liveStats',
  PLINKO_GAME_LIGHTNING_BOARD: SOCKET_NAMESPACES.PLINKO_GAME + '/lightningBoard',
  KYC_VERIFICATION_STATUS: SOCKET_NAMESPACES.KYC_VERIFICATION + '/kycVerificationStatus',
  BONUS_AMOUNT: SOCKET_NAMESPACES.BONUS + '/bonusAmount',
  UPDATE_RANKING_LEVEL: SOCKET_NAMESPACES.RANKING_LEVEL + '/updateRankingLevel',
  WAGERING_COMPLETION: SOCKET_NAMESPACES.WAGERING + '/wageringComplete'
}

export const SOCKET_LISTENERS = {
  DEMO_HELLO_WORLD: SOCKET_NAMESPACES.DEMO + '/helloWorld'
}

export const SOCKET_ROOMS = {
  WALLET_USER: SOCKET_NAMESPACES.WALLET + '/user', // append id of the user like this /user:1 for one to one,
  DEMO_USER: SOCKET_NAMESPACES.DEMO + '/demo', // append id of the demo like this /demo:1 for one to one,
  BONUS_USER: SOCKET_NAMESPACES.BONUS + '/user',
  USER_RANKING_LEVEL: SOCKET_NAMESPACES.RANKING_LEVEL + '/userRank',
  USER_KYC_VERIFICATION: SOCKET_NAMESPACES.KYC_VERIFICATION + '/userKyc',
  WAGERING_USER: SOCKET_NAMESPACES.WAGERING + '/userWagering'
}
// SOCKET RELATED

export const SALT_ROUNDS = 15
export const MIN_WAGER_AMOUNT_FOR_CHAT = 1
export const MAX_CHAT_CHARACTERS = 200
export const CURRENCY_FOR_CASINO = '2'
export const CONVERT_CURRENCY_FROM = 'btc'
export const CONVERT_CURRENCY_TO = 'usd'
export const CURRENCY_CODE_FOR_CASINO = 'USD'

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  BONUS_DEPOSIT: 'bonusDeposit',
  REFERRAL_REWARDS: 'referralRewards',
  DAILY: 'daily',
  WITHDRAW: 'withdraw',
  REFUND: 'refund',
  BET: 'bet',
  WIN: 'win',
  ROLLBACK: 'rollback',
  EAR_WIN: 'casino-win',
  EAR_BET: 'casino-bet',
  SEND: 'send',
  RECEIVE: 'receive',
  FLAT_FEE: 'flat-fee',
  PNL_FEE: 'pnl-fee',
  FEE: 'fee',
  AFFILIATE: 'affiliate',
  BUY_CRYPTO: 'buy'
}

export const VENDORS = {
  MAILGUN: 'MAILGUN',
  SENDGRID: 'SENDGRID'
}

export const BONUS_TYPES = {
  REGISTRATION: 'registration',
  DAILY: 'daily',
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  DEPOSIT: 'deposit',
  FREESPINS: 'freespins',
  REFERRAL: 'referral',
  WEEKLY_SPLITTED: 'weeklysplitted',
  CASHBACK: 'cashback',
  OTHER: 'other'
}

export const BONUS_STATUS = {
  ACTIVE: 'active',
  CLAIMED: 'claimed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  FORFEIT: 'forfeit',
  READY_TO_CLAIM: 'readyToClaim'
}

export const WITHDRAW_REQUEST_STATUS = {
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  APPROVED: 'approved',
  AUTO_APPROVED: 'auto_approved'
}

export const DEPOSIT_BONUS_TRANSACTION_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending'
}

export const USER_TYPES = {
  BOT: 'BOT',
  USER: 'USER',
  ADMIN: 'ADMIN'
}

export const GAMES = {
  DICE: 'dice',
  CRASH: 'crash',
  MINE: 'mine',
  BLACKJACK: 'blackjack',
  HILO: 'hi-lo',
  FLIP_COIN: 'flip-coin'
}

export const BET_RESULT = {
  WON: 'won',
  LOST: 'lost',
  CANCELLED: 'cancelled'
}

export const BET_STATUS = {
  CASHED_OUT: 'cashedOut',
  PLACED: 'placed',
  BUSTED: 'busted'
}

export const CRASH_GAME_STATE = {
  STARTED: '1',
  ON_HOLD: '2',
  GRAPH_FINISHED: '3',
  STOPPED: '0'
}

export const ROLLER_COASTER_GAME_STATE = {
  STARTED: '1',
  STOPPED: '0'
}

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
}

export const PAYMENT_METHODS = {
  GAME: 'game',
  GOGOPAY: 'gogopayPayment',
  COINPAYMENT: 'coinPayment',
  BONUS: 'bonus',
  TIP: 'tipping',
  FIREBLOCKS: 'fireblock',
  AFFILIATE: 'affiliate',
  MOONPAY: 'moonpay'
}

export const EAR_TRANSACTION_TYPE = {
  DEBIT: 'debit',
  CREDIT: 'credit',
  REFUND: 'refund',
  FREE_GAME: 'free games'
}

export const EAR_ACTION_TYPE = {
  WIN: 'casino-win',
  BET: 'casino-bet',
  BONUS_WIN: 'casino-bonus-win',
  BONUS_BET: 'casino-bonus-bet',
  DEBIT: 'debit',
  CREDIT: 'credit'
}

export const AUTO_RATE = 1.01

export const ALLOWED_FILE_TYPES = ['png', 'tiff', 'tif', 'jpg', 'jpeg']

export const DEFAULT_GAME_ID = {
  CRASH: 1,
  HILO: 2,
  MINE: 3,
  FLIP_COIN: 4,
  PLINKO: 5,
  ROLLER_COASTER: 6,
  CRYPTO_FUTURES: 7
}

export const EMAIL_TEMPLATE = {
  VERIFY_URL: 'verify/'
}

export const AFFILIATE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
}

export const SETTLEMENT_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending'
}

export const TOP_BET_TYPE = {
  BIGGEST_WIN: 'BIGGEST_WIN',
  HUGE_WIN: 'HUGE_WIN',
  MULTIPLIER: 'MULTIPLIER'
}

export const EMAIL_TEMPLATE_CATEGORY = {
  WELCOME_ONBOARD: 'WELCOME_ONBOARD',
  WELCOME_AND_VERIFY_EMAIL: 'WELCOME_AND_VERIFY_EMAIL',
  RESET_PASSWORD: 'RESET_PASSWORD',
  UPDATE_EMAIL: 'UPDATE_EMAIL'
}

export const DEPOSIT_BONUS_STATUS = {
  TRUE: true,
  FALSE: false
}

export const REGISTRATION_BONUS_STATUS = {
  TRUE: true,
  FALSE: false
}

export const NO_OF_DEPOSITS = {
  DEPOSIT_1: 'deposit1',
  DEPOSIT_2: 'deposit2',
  DEPOSIT_3: 'deposit3'
}

// Mine Game Constants
export const MAX_MINE_COUNT = 24

export const MIN_MINE_COUNT = 1

export const MIN_TILE_COUNT = 1

export const MAX_TILE_COUNT = 25

// Dice Game Constant

export const TOTAL_CARDS = 312

export const BLACKJACK = 21

export const BLACKJACK_RESULT = {
  PLAYER_BUST: 'player_bust',
  DEALER_BUST: 'dealer_bust',
  PLAYER_WIN: 'player_win',
  DEALER_WIN: 'dealer_win',
  PUSH: 'push',
  PLAYERS_BLACKJACK: 'players_blackjack',
  DEALERS_BLACKJACK: 'dealers_blackjack'
}

export const WAGERING_STATUS = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  REQUESTED: 'REQUESTED',
  RE_REQUESTED: 'RE-REQUESTED',
  ACTIVE: 'ACTIVE',
  COMPLETE: 'COMPLETE'
}

export const LOGIN_METHODS = {
  GOOGLE: 'google',
  TWITCH: 'twitch',
  METAMASK: 'metamask',
  SYSTEM: 'system',
  PHANTOM: 'phantom'
}

export const LINKED_METHODS = {
  TWITCH: 'twitch',
  TWITTER: 'twitter',
  STEAM: 'steam'
}

export const BLACKJACK_ODDS = {
  BLACKJACK: 2.5,
  WIN: 2
}

export const BLACK_JACK_DOUBLE_POINTS = [9, 10, 11]

export const CARD_DECK = {
  1: [1, 'spade', 'Ace of spade'],
  2: [2, 'spade', '2 of spade'],
  3: [3, 'spade', '3 of spade'],
  4: [4, 'spade', '4 of spade'],
  5: [5, 'spade', '5 of spade'],
  6: [6, 'spade', '6 of spade'],
  7: [7, 'spade', '7 of spade'],
  8: [8, 'spade', '8 of spade'],
  9: [9, 'spade', '9 of spade'],
  10: [10, 'spade', '10 of spade'],
  11: [10, 'spade', 'Jack of spade'],
  12: [10, 'spade', 'Queen of spade'],
  13: [10, 'spade', 'King of spade'],
  14: [1, 'club', 'Ace of club'],
  15: [2, 'club', '2 of club'],
  16: [3, 'club', '3 of club'],
  17: [4, 'club', '4 of club'],
  18: [5, 'club', '5 of club'],
  19: [6, 'club', '6 of club'],
  20: [7, 'club', '7 of club'],
  21: [8, 'club', '8 of club'],
  22: [9, 'club', '9 of club'],
  23: [10, 'club', '10 of club'],
  24: [10, 'club', 'Jack of club'],
  25: [10, 'club', 'Queen of club'],
  26: [10, 'club', 'King of club'],
  27: [1, 'heart', 'Ace of heart'],
  28: [2, 'heart', '2 of heart'],
  29: [3, 'heart', '3 of heart'],
  30: [4, 'heart', '4 of heart'],
  31: [5, 'heart', '5 of heart'],
  32: [6, 'heart', '6 of heart'],
  33: [7, 'heart', '7 of heart'],
  34: [8, 'heart', '8 of heart'],
  35: [9, 'heart', '9 of heart'],
  36: [10, 'heart', '10 of heart'],
  37: [10, 'heart', 'Jack of heart'],
  38: [10, 'heart', 'Queen of heart'],
  39: [10, 'heart', 'King of heart'],
  40: [1, 'diamond', 'Ace of diamond'],
  41: [2, 'diamond', '2 of diamond'],
  42: [3, 'diamond', '3 of diamond'],
  43: [4, 'diamond', '4 of diamond'],
  44: [5, 'diamond', '5 of diamond'],
  45: [6, 'diamond', '6 of diamond'],
  46: [7, 'diamond', '7 of diamond'],
  47: [8, 'diamond', '8 of diamond'],
  48: [9, 'diamond', '9 of diamond'],
  49: [10, 'diamond', '10 of diamond'],
  50: [10, 'diamond', 'Jack of diamond'],
  51: [10, 'diamond', 'Queen of diamond'],
  52: [10, 'diamond', 'King of diamond']
}

export const HILO_CARD_DECK = {
  1: [1, 'spade', 'Ace of spade'],
  2: [2, 'spade', '2 of spade'],
  3: [3, 'spade', '3 of spade'],
  4: [4, 'spade', '4 of spade'],
  5: [5, 'spade', '5 of spade'],
  6: [6, 'spade', '6 of spade'],
  7: [7, 'spade', '7 of spade'],
  8: [8, 'spade', '8 of spade'],
  9: [9, 'spade', '9 of spade'],
  10: [10, 'spade', '10 of spade'],
  11: [11, 'spade', 'Jack of spade'],
  12: [12, 'spade', 'Queen of spade'],
  13: [13, 'spade', 'King of spade'],
  14: [1, 'club', 'Ace of club'],
  15: [2, 'club', '2 of club'],
  16: [3, 'club', '3 of club'],
  17: [4, 'club', '4 of club'],
  18: [5, 'club', '5 of club'],
  19: [6, 'club', '6 of club'],
  20: [7, 'club', '7 of club'],
  21: [8, 'club', '8 of club'],
  22: [9, 'club', '9 of club'],
  23: [10, 'club', '10 of club'],
  24: [11, 'club', 'Jack of club'],
  25: [12, 'club', 'Queen of club'],
  26: [13, 'club', 'King of club'],
  27: [1, 'heart', 'Ace of heart'],
  28: [2, 'heart', '2 of heart'],
  29: [3, 'heart', '3 of heart'],
  30: [4, 'heart', '4 of heart'],
  31: [5, 'heart', '5 of heart'],
  32: [6, 'heart', '6 of heart'],
  33: [7, 'heart', '7 of heart'],
  34: [8, 'heart', '8 of heart'],
  35: [9, 'heart', '9 of heart'],
  36: [10, 'heart', '10 of heart'],
  37: [11, 'heart', 'Jack of heart'],
  38: [12, 'heart', 'Queen of heart'],
  39: [13, 'heart', 'King of heart'],
  40: [1, 'diamond', 'Ace of diamond'],
  41: [2, 'diamond', '2 of diamond'],
  42: [3, 'diamond', '3 of diamond'],
  43: [4, 'diamond', '4 of diamond'],
  44: [5, 'diamond', '5 of diamond'],
  45: [6, 'diamond', '6 of diamond'],
  46: [7, 'diamond', '7 of diamond'],
  47: [8, 'diamond', '8 of diamond'],
  48: [9, 'diamond', '9 of diamond'],
  49: [10, 'diamond', '10 of diamond'],
  50: [11, 'diamond', 'Jack of diamond'],
  51: [12, 'diamond', 'Queen of diamond'],
  52: [13, 'diamond', 'King of diamond']
}

export const GAME_ROUTE_ENDPOINTS = [
  'dice-game/place-bet'
]

export const CRASH_GAME = {
  CLIENT_SEED: '0000000000000000004d6ec16dafe9d8370958664c1dc422f452892264c59526'
}

export const AUTO_WITHDRAW_REQUEST_SETTING_STATUS = {
  TRUE: true,
  FALSE: false
}

export const DATE_OPTION = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month'
}

export const BREAK_TYPE = {
  TAKE_A_BREAK: 'TAKE_A_BREAK',
  SELF_EXCLUSION: 'SELF_EXCLUSION'
}

export const LIMIT_OPTION = {
  WAGER: 'wager',
  LOSS: 'loss',
  DEPOSIT: 'deposit',
  SESSION: 'session'
}

export const LIMIT_EXCEED_MESSAGE = {
  DAILY_BET: 'Daily Bet Limit Exceed',
  WEEKLY_BET: 'Weekly Bet Limit Exceed',
  MONTHLY_BET: 'Monthly Bet Limit Exceed',
  DAILY_LOSS: 'Daily loss Limit Exceed',
  WEEKLY_LOSS: 'Weekly loss Limit Exceed',
  MONTHLY_LOSS: 'Monthly loss Limit Exceed',
  DAILY_DEPOSIT: 'Daily Deposit Limit Exceed',
  WEEKLY_DEPOSIT: 'Weekly Deposit Limit Exceed',
  MONTHLY_DEPOSIT: 'Monthly Deposit Limit Exceed'
}

/* ==========================================================================
  PLINKO GAME CONSTANTS
========================================================================== */
export const PLINKO_MIN_ROWS = 8
export const PLINKO_MAX_ROWS = 16

export const DEFAULT_PLINKO_LIGHTNING_MODE_BET_MUTLIPLIERS = [10, 20, 30]

export const DEFAULT_PLINKO_LIGHTNING_MODE_BOARD = {
  betMultipliers: [{ position: [7, 8], multiplier: '2x' }, { position: [13, 10], multiplier: '15x' }, { position: [2, 2], multiplier: '40x' }],
  payouts: [1000, 155, 6.28, 1.09, 0.35, 0.16, 0, 0.02, 0, 0.01, 0, 0.07, 0.3, 1.4, 29.3, 157, 1000]
}

export const PLINKO_LIGHTNING_MODE_VARIABLE_ODDS = {
  1: [500, 125, 30, 5, 0.9, 0.3, 0, 0.1, 0, 0.1, 0, 0.3, 0.9, 5, 30, 125, 500],
  2: [1000, 155, 15, 3.59, 1.4, 0.69, 0, 0.07, 0, 0.04, 0, 0.17, 0.25, 0.46, 1.27, 8.43, 1000],
  3: [1000, 155, 6.28, 1.09, 0.35, 0.16, 0, 0.02, 0, 0.01, 0, 0.07, 0.3, 1.4, 29.3, 157, 1000],
  4: [1000, 6.39, 0.96, 0.32, 0.16, 0.09, 0, 0.02, 0, 0.03, 0, 0.61, 2.03, 7.42, 28.7, 152, 1000]
}

export const DELETED_MESSAGE = 'Deleted because of offensive content.'
export const URL_CHAT_MESSAGE = 'Heads up! This message was removed due to external link.'
export const GLOBAL_GROUP_ID = 1

/* ==========================================================================
  HI-LO GAME CONSTANTS
========================================================================== */
export const HI_LO_GAME_BET_TYPE = {
  SAME_OR_ABOVE: 1,
  SAME: 2,
  SAME_OR_BELOW: 3,
  ABOVE: 4,
  BELOW: 5
}

/* ==========================================================================
  CRYPTO FUTURES AND ROLLERCOASTER GAME CONSTANTS
========================================================================== */
export const CRYPTO_FUTURES_ROLLERCOASTER_FEE_TYPE = {
  PNL: 'pnl',
  FLAT: 'flat'
}

export const VERIFICATION_LEVEL = {
  SYSTEM_LEVEL: 'systemLevel',
  SUM_SUB_LEVEL1: 'basic-kyc-level',
  SUM_SUB_LEVEL2: 'liveness-test',
  SUM_SUB_LEVEL3: 'Proof-of-Address',
  SUM_SUB_LEVEL4: 'SOF'
}

export const SYSTEM_KYC_STATUS = {
  PENDING: 'pending',
  ON_HOLD: 'onHold',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  RE_REQUESTED: 're-requested'
}

export const PLINKO_GAME_FIXED_ODDS = {
  8: [[5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6], [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13], [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29]],
  9: [[5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6], [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18], [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43]],
  10: [[8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9], [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22], [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76]],
  11: [[8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4], [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24], [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120]],
  12: [[10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10], [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33], [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170]],
  13: [[8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1], [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43], [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260]],
  14: [[7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1], [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58], [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420]],
  15: [[15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15], [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88], [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620]],
  16: [[16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16], [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110], [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]]
}

export const FIREBLOCKS_ACCOUNT_TYPE = {
  VAULT_ACCOUNT: 'VAULT_ACCOUNT',
  ONE_TIME_ADDRESS: 'ONE_TIME_ADDRESS'
}
