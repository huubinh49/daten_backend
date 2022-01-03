const Redis = require("ioredis");
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});
redis.on("connect", (err) => {
    console.log("Connected to redis cloud!")
})
redis.on("error", (err)=>{
    console.log("Something went wrong with redis");
})
redis.on("ready", (err)=>{
    console.log("Redis is already to serve");
})

module.exports = redis;