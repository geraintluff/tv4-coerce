var api = require('./main.js');

// Basic type-juggling
api.addFix(api.errorCodes.INVALID_TYPE, function (data, type, error) {
	if (type === 'number') {
		data = parseFloat(data);
		if (!isNaN(data)) return data;
	} else if (type === 'integer') {
		data = parseInt(data);
		if (!isNaN(data)) return data;
	} else if (type === 'string') {
		if (typeof data === 'number') {
			return "" + data;
		}
	}
});

api.addFix(api.errorCodes.OBJECT_REQUIRED, function (data, property, error, baseSchema) {
	var missingPath = error.dataPath + '/' + property.replace(/~/g, '~0').replace(/\//g, '~1'); // as JSON Pointer
	var possibleSchemas = api.possibleSchemas(baseSchema, missingPath);
	for (var i = 0; i < possibleSchemas.length; i++) {
		var schema = possibleSchemas[i];
		if ('default' in schema) {
			data[property] = schema['default'];
			return data;
		}
	}
});