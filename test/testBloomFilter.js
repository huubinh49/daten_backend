const { BloomFilter } = require("bloomfilter");
const fs = require('fs')
const bloom_uri = "bloom_object.json";
const ESSerializer = require('esserializer');

const getBloomFilter = async ()  => {
    try {
        const data = await fs.promises.readFile(bloom_uri, 'utf8')
        if(data)
        return ESSerializer.deserialize(data, [BloomFilter]);
        else{
            const new_bloom = new BloomFilter(
                32 * 256, // number of bits to allocate.
                16        // number of hash functions.
            )
            return new_bloom;
        }
    } catch (err) {
        console.log("Error: ", err)
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
(async () => {
    if(runOnce){
        console.log("Creating Bloom filter")
        bloom_filter = await getBloomFilter();
        console.log("Create Bloom filter successfully")
        console.log(bloom_filter.test('B'))
        console.log(bloom_filter.add('B'))
        console.log(bloom_filter.test('B'))
        // ReferenceError: ESSerializer is not defined
        await fs.promises.writeFile( "bloom_object.json", ESSerializer.serialize(bloom_filter), 'utf-8', function(err) {
            if(err){
                console.log("Error when save bloom filter: ", err)
            process.exit()  
            }
        })  

        bloom_filter = await getBloomFilter();
        console.log(bloom_filter.test('B'))
        console.log(bloom_filter.add('B'))
        console.log(bloom_filter.test('B'))
    }else{
        runOnce = false;
        console.log("Bloom filter are already created!")
    }
    
})()

