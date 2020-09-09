const path = require("path");
const express = require('express');
const rateLimit = require("express-rate-limit");
const mongoose = require('mongoose');
const config=require("./config");
const app = express();
const cors = require('cors');
const bodyparser = require('body-parser');
const passportJWT = require('./middleware/passportJWT')();
const errorHandler = require('./middleware/errorHandler');

const limiter = rateLimit({
    windowMs: 15 * 1000, // 15 minutes
    max: 20 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURI, { useNewUrlParser: true });



const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');
const followRoutes = require('./routes/follow');


app.use(cors());
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(passportJWT.initialize());



app.use('/api/auth', authRoutes);
app.use('/api/post', passportJWT.authenticate(), postRoutes);
app.use('/api/follow', passportJWT.authenticate(), followRoutes);
app.use(errorHandler);
app.listen(config.port, () => {
    console.log("Listening");
});