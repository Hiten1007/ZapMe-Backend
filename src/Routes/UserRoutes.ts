import { Router } from 'express'
import  { signUp, logIn, logOut } from '../Controllers/userControllers'
import profileRoutes from './ProfileRoutes'

const router = Router()

router.post('/registerUser', signUp)
router.post('/loginUser', logIn)

router.post('/logOut', logOut)

router.use('/profile', profileRoutes)


export default router