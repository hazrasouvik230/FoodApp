const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./Routes/User.Route")

dotenv.config();

// const corsOptions = {
//     origin: ['http://localhost:5173']
// };

const corsOptions = {
    origin: ['http://localhost:5173', 'https://foodapp-priqlfh9o-souvik-hazras-projects.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.options('*', cors(corsOptions));  // Handle preflight requests

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
    res.json("Hello")
})

app.use("/api/user", userRouter);

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
    })
})
.catch(error => console.log(error));
