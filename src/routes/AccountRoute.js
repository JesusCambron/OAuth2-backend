import { Router } from "express";
import { AccountController } from '../controllers/Controller.js'

const accountRouter = Router();

accountRouter.post('/login/google', AccountController.logInGoogle);
accountRouter.post('/signup/google', AccountController.signUpGoogle);
accountRouter.post('/login', AccountController.logIn);
accountRouter.post('/signup', AccountController.signUp);
accountRouter.get('/verify/:id_account/:token', AccountController.verifyAccount);
accountRouter.post('/resend-token', AccountController.resendToken);

export default accountRouter