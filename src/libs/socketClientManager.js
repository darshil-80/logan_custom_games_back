import { Manager } from 'socket.io-client'
import { SOCKET_NAMESPACES } from '../libs/constants'

const socketClientManager = () => {
  const gameEngineClient = new Manager('ws://game-engine-listeners:8080').socket(SOCKET_NAMESPACES.DEMO)
  return gameEngineClient
}

export default socketClientManager
