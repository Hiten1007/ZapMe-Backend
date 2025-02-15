import { Router } from 'express'
import { authenticateToken } from '../middleware/verifyToken'
import { displayZaps, displayZapplets, displayarch, displaysearch, displayImg } from '../Controllers/chatControllers'

const router = Router()

router.use(authenticateToken)

router.get('/img',displayImg)
router.get('/zaps', displayZaps)
router.get('/zapplets', displayZapplets)
// router.get('/archived', displayarch)
router.get('/search', displaysearch)

export default router
