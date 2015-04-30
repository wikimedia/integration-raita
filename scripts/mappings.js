/*!
 * Imports all Elasticsearch document type mappings.
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

fs.readdir(mappingsDir, function (err, files) {
	files.forEach(function (file) {
		var type;

		if (path.extname(file) === '.json') {
			type = path.basename(file, '.json');

			http.get(pathToMapping(type), function (res) {
				var json = '';

				res.on('data', function (d) { json += d.toString(); }).on('end', function () {
					if (res.statusCode === 200 && Object.keys(JSON.parse(json)).length === 0) {
						if (operation === 'check') {
							throw 'check failed. mapping for `' + type + '` is missing';
						} else {
							console.log('importing mapping for `' + type + '`');

							// Mapping doesn't exist yet. Let's import it.
							fs.readFile(path.join(mappingsDir, file), function (err, mapping) {
								if (err) throw err;

								var options = url.parse(pathToMapping(type));
								options.method = 'PUT';
								options.headers = {
									'Content-Type': 'application/json',
									'Content-Length': mapping.length
								};

								http.request(options).end(mapping);
							});

						}
					} else if (operation === 'import') {
						console.log('mapping for `' + type + '` already exists')
					}
				});
			});
		}
	});
});
