var assert = require('chai').assert;

var api = require('../../coerce.js');
require('../../coerce-datatypes.js');

describe('Type coercion', function () {
	it('string -> number', function () {
		var schema = {
			"type": "object",
			"properties": {
				"foo": {"type": "number"}
			}
		};
		var data = {
			"foo": "123"
		};
		var result = api.coerce(data, schema);
		
		assert.isTrue(result.valid);
		assert.deepEqual(result.data, {foo:123});
	});
});