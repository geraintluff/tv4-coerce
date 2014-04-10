var tv4 = require('tv4'), jsonPointer = require('json-pointer');

var api = module.exports = {
	tv4: tv4,
	errorCodes: tv4.errorCodes,
	fixes: {},
	addFix: function (code, fixFunction) {
		if (typeof tv4.errorCodes[code] !== 'undefined') {
			code = tv4.errorCodes[code];
		}
		this.fixes[code] = this.fixes[code] || [];
		this.fixes[code].push(fixFunction);
		return this;
	},
	schemaFromPath: function(schema, path) {
		var parts = path.split('/').slice(1);
		while (parts.length) {
			if (typeof schema['$ref'] == 'string') {
				schema = tv4.getSchema(schema['$ref']);
			}
			var part = parts.shift();
			schema = schema[part];
		}
		return schema;
	},
	coerce: function (data, schema) {
		var seenErrors = {};
		var changes = 1;
		var result;
		while (changes) {
			changes = 0;
			result = tv4.validateMultiple(data, schema);
			result.data = data;
			result.schema = schema;
			for (var i = 0; i < result.errors.length; i++) {
				var error = result.errors[i];
				var signature = JSON.stringify([error.code, error.dataPath, error.schemaPath]);
				if (seenErrors[signature]) continue;
				
				changes++;
				seenErrors[signature] = true;
				var subData = jsonPointer.get(data, error.dataPath);
				var schemaValue = this.schemaFromPath(schema, error.schemaPath);
				var fixes = this.fixes[error.code] || [];
				for (var j = 0; j < fixes.length; j++) {
					var fixFunction = fixes[j];
					var fixedValue = fixFunction(subData, schemaValue, error);
					if (typeof fixedValue !== 'undefined') {
						jsonPointer.set(data, error.dataPath, fixedValue);
						break;
					}
				}
			}
		}
		return result;
	}
};

require('./coerce-standard.js');