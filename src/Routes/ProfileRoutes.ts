import { Router } from 'express'

import { showProfile, updateAbout, updateUserInfo  } from '../Controllers/profileControllers'
import { authenticateToken } from '../middleware/verifyToken'

const router = Router()

router.use(authenticateToken)
  
router.get('/', showProfile)
router.put('/user', updateUserInfo)
router.put('/about', updateAbout)

// router.put('/profilephoto', updatePhoto)

export default router