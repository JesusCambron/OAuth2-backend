import { Router } from "express";
import { UserController } from '../controllers/Controller.js'

const userRouter = Router();

userRouter.get('/signup', UserController.signUp)

export default userRouter