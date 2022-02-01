const { BloomFilter } = require("bloomfilter");
const fs = require('fs')
const bloom_uri = "../bloom_object.json";
const ESSerializer = require('esserializer');

const getBloomFilter = () => {
    try {
        const data = fs.readFileSync(bloom_uri, 'utf8')
        return ESSerializer.deserialize(data, [BloomFilter]);
    } catch (err) {
        if(err.code === 'ENOENT'){
            console.log("Not existing file")    
            const new_bloom = new BloomFilter(
                32 * 256, // number of bits to allocate.
                16        // number of hash functions.
            )
            return new_bloom;          
            
        }else{
            console.log(err)
            return null;
        }
    }
}
let runOnce = true;
let bloom_filter = null;
(() => {
    if(runOnce){
        console.log("Creating Bloom filter")
        bloom_filter = getBloomFilter();
        console.log("Create Bloom filter successfully")
    }else{
        runOnce = false;
        console.log("Bloom filter are already created!")
    }
    
})()
module.exports = bloom_filter;