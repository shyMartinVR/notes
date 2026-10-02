import express from "express";
import path from "node:path";

const PORT = Number(process.env.PORT ?? 3000);
const STATIC_DIR = process.env.STATIC_DIR ?? path.resolve(import.meta.dir, "../../frontend/dist");

const app = express();

app.disable("x-powered-by");
app.use(express.static(STATIC_DIR));

app.listen(PORT, () => {
    console.log(`Serving ${STATIC_DIR} on port ${PORT}`);
});
