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

const PointSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
});

  
const ProfileSchema = new mongoose.Schema({
    dateOfBirth: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    location: {
        type: PointSchema
    }
})
Point = mongoose.model("Point", PointSchema)
Profile = mongoose.model('Profile', ProfileSchema);
async function test(){
    try{
        await connectDB();
        const date = "2021-01-30"
        const point = await Point.create({
            coordinates: [1, 1]
        })
        const profile = await Profile.create({
            dateOfBirth: date,
            location: point
        })
        
        console.log(profile)
    }catch(err){
        console.log(err)
    }
    
}

test()