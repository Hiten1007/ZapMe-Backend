import { Router } from 'express'
import { authenticateToken } from '../middleware/verifyToken'
import { displayZaps, displaysearch, displayImg, getMessages } from '../Controllers/chatControllers'

const router = Router()

router.use(authenticateToken)

router.get('/img',displayImg)
router.get('/zaps', displayZaps)
router.get('/search', displaysearch)
router.get('/zapmessages/:chatId', getMessages)

export default router
