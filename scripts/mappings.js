/*!
 * Imports Elasticsearch document type mappings from db/mappings/*.json files.
 */

var fs = require('fs'),
		http = require('http'),
		path = require('path'),
		url = require('url');

if (process.argv.length < 4 || [ 'check', 'import' ].indexOf(process.argv[2]) < 0) {
	console.error('Usage: mappings check|import <elasticsearch index url>');
	process.exit(1);
}

var operation = process.argv[2],
		esURL = process.argv[3],
		mappingsDir = path.normalize(path.join(__dirname, '../db/mappings'));

function pathToMapping(type) {
	return url.resolve(esURL + '/', path.join(type, '_mapping'));
}

/**
 * Simplified request function. Reads all data from the response and passes it
 * to the callback function.
 */
function request(method, reqURL, cb, data) {
	var opts = url.parse(reqURL),
			req;

	opts.method = method;

	if (typeof data !== 'undefined') {
		opts.headers = {
			'Content-Type': 'application/json',
			'Content-Length': data.length,
		};
	}

	req = http.request(opts, function (res) {
		var json = '';

		res.on('data', function (d) { json += d.toString(); });
		res.on('end', function () {
			if (json.length > 0) {
				cb(res, res.statusCode, JSON.parse(json));
			} else {
				cb(res, res.statusCode);
			}
		});
	});

	req.on('error', function (err) {
		throw 'request to `' + reqURL + '` failed: ' + err.message;
	});

	req.end(data);

	return req;
}

function main() {
	fs.readdir(mappingsDir, function (err, files) {
		files.forEach(function (file) {
			var type;

			if (path.extname(file) === '.json') {
				type = path.basename(file, '.json');

				request('GET', pathToMapping(type), function (res, status, mapping) {
					if ((status === 200 && Object.keys(mapping).length === 0) || status === 404) {
						if (operation === 'check') {
							throw 'check failed. mapping for `' + type + '` is missing';
						} else {
							console.log('importing mapping for `' + type + '`');

							// Mapping doesn't exist yet. Let's import it.
							fs.readFile(path.join(mappingsDir, file), function (err, mapping) {
								if (err) throw err;

								request('PUT', pathToMapping(type), function (res, status) {
									if (status !== 200) {
										throw 'failed to import mapping for `' + type + '`';
									}
								}, mapping);
							});

						}
					} else if (operation === 'import') {
						console.log('mapping for `' + type + '` already exists')
					}
				});
			}
		});
	});
}

request('HEAD', esURL, function (res, status) {
	// If the index doesn't exist, try to create it before continuing
	if (operation === 'import' && status === 404) {
		console.log('creating index');
		request('PUT', esURL, main, '{}');
	} else {
		main();
	}
});
