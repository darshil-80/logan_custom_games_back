import express from 'express'
import apiRouter from './api'
import onHealthCheck from '../../libs/onHealthCheck'
import path from 'path';

const router = express.Router()

router.use("/", express.static(path.join(process.cwd(), "public")));
router.use('/api', apiRouter)
router.get('/health-check', async (_, res) => {
  try {
    const response = await onHealthCheck()
    res.json(response)
  } catch (error) {
    res.status(503)
    res.send()
  }
})

export default router
