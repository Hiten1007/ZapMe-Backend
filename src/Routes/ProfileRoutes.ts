import { Router } from 'express'
import { upload } from '../middleware/upload';
import { showProfile, updateAbout, updateUserInfo, updatePhoto, showOtherProfile  } from '../Controllers/profileControllers'
import { authenticateToken } from '../middleware/verifyToken'

const router = Router()

router.use(authenticateToken)
  
router.get('/', showProfile)
router.get('/:userid',showOtherProfile)
router.put('/user', updateUserInfo)
router.put('/about', updateAbout)
router.put('/profilephoto', upload.single('photo'), updatePhoto)

export default router