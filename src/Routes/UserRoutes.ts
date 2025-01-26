import { Router } from 'express'
import  { signUp } from '../Controllers/userControllers'

const router = Router()

router.post('/registerUser', signUp)

export default router