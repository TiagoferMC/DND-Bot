import express from "express";
import { json } from "body-parser";
import cors from "cors";

const app = express();
// Middleware
app.use(json());
app.use(cors());

// Characters API
import characters from "./routes/api/characters";
app.use("/api/characters", characters);

// Classes API
import classes from "./routes/api/classes";
app.use("/api/classes", classes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
