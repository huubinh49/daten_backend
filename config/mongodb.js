const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config()

const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}

const atlas_url = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(
        atlas_url,
      {
        useNewUrlParser: true
      }
    );

    console.log('MongoDB is Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;