import gracefulShutDown from './gracefulShutDown'

process.on('SIGINT', gracefulShutDown)
process.on('SIGTERM', gracefulShutDown)
process.on('SIGUSR2', gracefulShutDown)
