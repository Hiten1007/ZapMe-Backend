import { Router } from 'express'
import  { signUp, logIn } from '../Controllers/userControllers'

const router = Router()

router.post('/registerUser', signUp)
router.post('/loginUser', logIn)

export default router