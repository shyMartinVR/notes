import { Router } from "express";
import categoriesRouter from "./categories";
import notesRouter from "./notes";

const router = Router();

router.use("/notes", notesRouter);
router.use("/categories", categoriesRouter);

export default router;
