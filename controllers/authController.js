const jwt = require("jwt-simple");
const config = require('../config');
const redisClient=require('../config/redis').getClient();
const User = require('../models/user');
const validationHandler = require("../validators/validationHandlar")
exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            const error = new Error("wrong Credentials");
            error.statusCode = 401;
            throw error;
        }

        const validPassword = await user.validPassword(password);
        if (!validPassword) {
            const error = new Error("wrong Credentials");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.encode({ id: user.id }, config.jwtSecret);
        return res.send({ user, token });
    } catch (err) {
        next(err);
    }
};

exports.signup = async (req, res, next) => {
    try {
        validationHandler(req);

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            const error = new Error("Email already used");
            error.statusCode = 403;
            throw error;
        }

        let user = new User();
        user.email = req.body.email;
        user.password = await user.encryptPassword(req.body.password);
        user.name = req.body.name;
        user = await user.save();

        const token = jwt.encode({ id: user.id }, config.jwtSecret);
        return res.send({ user, token });
    } catch (err) {
        next(err);
    }
};


exports.me = async (req, res, next) => {
    try {
        const cacheValues=await redisClient.hget("user",req.user.id);
        if(cacheValues){
            console.log("getting from redis");
            const doc=JSON.parse(cacheValues);
            const  cacheUser=new User(doc);
            return res.send(cacheUser);
        }
        console.log("getting from db");
        const user = await User.findById(req.user);
        redisClient.hset("user",req.user.id,JSON.stringify(user));
        return res.send(user);
    } catch (err) {
        next(err);
    }
};