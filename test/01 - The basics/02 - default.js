var assert = require('chai').assert;

var api = require('../../coerce.js');
require('../../coerce-defaults.js');

describe('Use defaults', function() {
    it('when required', function() {
        var schema = {
            "type": "object",
            "properties": {
                "foo": { "default": "hello" }
            },
            "required": ["foo"]
        };
        var data = {};
        var result = api.coerce(data, schema);

        assert.isTrue(result.valid);
        assert.deepEqual(result.data, { foo: "hello" });
    });
});
