const { BloomFilter } = require("bloomfilter");
const fs = require('fs')
const bloom_uri = "./bloom_object.json";
const ESSerializer = require('esserializer');

const getBloomFilter =  ()  => {
    try{
        const data = fs.readFileSync(bloom_uri,{encoding:'utf8', flag:'r'});
        if(data){
            console.log("Get existing Bloom filter")
            return ESSerializer.deserialize(data, [BloomFilter]);
        }
        else{
            console.log("New Bloom filter")
            const newBloomFilter =  new BloomFilter(
                32 * 256, // number of bits to allocate.
                16        // number of hash functions.
            )
            return newBloomFilter
        }
    }catch(err){
        if(err){
            console.log("Error when get Bloom filter: ", err)
            const newBloomFilter =  new BloomFilter(
                32 * 256, // number of bits to allocate.
                16        // number of hash functions.
            )
            return newBloomFilter
        }
    }
}
let runOnce = true;
let bloom_filter = null;
 ( () => {
    if(runOnce){
        bloom_filter = getBloomFilter();
        console.log("Get Bloom filter successfully: ", bloom_filter)

    }else{
        runOnce = false;
        console.log("Bloom filter are already created!")
    }
 
})()
module.exports = bloom_filter;