var api = require('./coerce.js');

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

