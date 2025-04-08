import express from 'express'
import demoRoutes from './demo.routes'
import userRoutes from './user.routes'
import walletRoutes from './wallet.routes'
import mineGameRoutes from './mineGame.routes'
import diceGameRoutes from './diceGame.routes'
import crashGameRoutes from './crashGame.routes'
import blackJackGameRoutes from './blackJackGame.routes'
import plinkoGameRoutes from './plinkoGame.routes'
import hiLoGameRoutes from './hiLoGame.routes'
import flipCoinGameRoutes from './flipCoinGame.routes'
import systemRoutes from './system.routes'

const v1Router = express.Router()

// v1Router.use('/black-jack-game', blackJackGameRoutes)
// v1Router.use('/common-game', commonGameRoutes)
v1Router.use('/crash-game', crashGameRoutes)
// v1Router.use('/hi-lo-game', hiLoGameRoutes)
v1Router.use('/mine-game', mineGameRoutes)
// v1Router.use('/plinko-game', plinkoGameRoutes)
// v1Router.use('/dice-game', diceGameRoutes)
// v1Router.use('/flip-coin-game', flipCoinGameRoutes)
// v1Router.use('/wallet', walletRoutes)
v1Router.use('/user', userRoutes)
v1Router.use('/system', systemRoutes)
// v1Router.use('/demo', demoRoutes)

export default v1Router
