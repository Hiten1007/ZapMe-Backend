import { Router } from 'express'
import  { signUp, logIn } from '../Controllers/userControllers'
import profileRoutes from './ProfileRoutes'

const router = Router()

router.post('/registerUser', signUp)
router.post('/loginUser', logIn)

router.use('/profile', profileRoutes)


export default router