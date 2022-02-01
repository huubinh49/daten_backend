const bloom_filter = require('./testBloomFilter');
const ESSerializer = require('esserializer');
const fs = require('fs');
console.log(bloom_filter)
console.log(bloom_filter.test('A'))
console.log(bloom_filter.add('A'))
console.log(bloom_filter.test('A'))
