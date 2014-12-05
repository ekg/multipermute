#!/usr/bin/env node

var multipermute = require('multipermute')

if (process.argv.length < 3) {
  console.log('usage:', process.argv[1], '[item_1, ..., item_n]')
  console.log('output the multiset permutations of the items using an efficient loopless algorithm')
  process.exit(1)
}

var objects = process.argv.slice(2, process.argv.length)

multipermute(objects, function(x) {
  console.log(x.join(' '))
})
