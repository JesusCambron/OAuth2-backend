import { Router } from "express";
import accountRouter from "./AccountRoute.js"

const router = Router();

router.use("/account", accountRouter);

export default router