import { Router } from "express";
import userRouter from "./UserRoute.js"
import accountRouter from "./AccountRoute.js"

const router = Router();

router.use("/account", accountRouter)
router.use("/user", userRouter)

export default router