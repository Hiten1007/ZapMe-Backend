import { Router } from 'express'
import { authenticateToken } from '../middleware/verifyToken'
import { displayZaps, displayZapplets, displayarch } from '../Controllers/chatControllers'

const router = Router()

router.use(authenticateToken)

router.get('/zaps', displayZaps )
router.get('/zapplets', displayZapplets)
router.get('/archived', displayarch)

export default router
