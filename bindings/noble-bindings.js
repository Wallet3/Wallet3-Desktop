const events = require('events');
const util = require('util');

const NobleMac = require('@abandonware/noble/lib/mac/native/binding.node').NobleMac;

util.inherits(NobleMac, events.EventEmitter);

module.exports = NobleMac;
