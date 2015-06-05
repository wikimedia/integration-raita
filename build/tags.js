riot.tag('rt-build-features', '<div class="list-group { filterFlags }"> <rt-feature each="{ nonEmptyFeatures() }" class="list-group-item"></rt-feature> </div>', 'rt-step { transition: padding 0.5s; } /* When results are filtered, collapse steps until they are expanded */ rt-build-features > .list-group.status-failed rt-step:not(.status-failed):not(.expanded), rt-build-features > .list-group.status-skipped rt-step:not(.status-skipped):not(.expanded) { padding: 0 15px; } rt-build-features > .list-group.status-failed rt-step:not(.status-failed):not(.expanded) > :nth-child(1), rt-build-features > .list-group.status-skipped rt-step:not(.status-skipped):not(.expanded) > :nth-child(1) { cursor: pointer; } rt-build-features > .list-group.status-failed rt-step:not(.status-failed):not(.expanded) > :nth-child(1):before, rt-build-features > .list-group.status-skipped rt-step:not(.status-skipped):not(.expanded) > :nth-child(1):before { display: block; content: \'...\'; } rt-build-features > .list-group.status-failed rt-step:not(.status-failed):not(.expanded) > :nth-child(1) *, rt-build-features > .list-group.status-failed rt-step:not(.status-failed):not(.expanded) > :nth-child(n+2), rt-build-features > .list-group.status-skipped rt-step:not(.status-skipped):not(.expanded) > :nth-child(1) *, rt-build-features > .list-group.status-skipped rt-step:not(.status-skipped):not(.expanded) > :nth-child(n+2) { display: none; }', function(opts) {
		var self = this;

		self.filters = function () {
			var classes = [];

			if (self.filter) {
				for (var i = 0; i < self.filter.length; i++) {
					if ('status' in self.filter[i]) {
						classes.push(self.filter[i].status);
					}
				}
			}

			return classes;
		};

		self.nonEmptyFeatures = function () {
			return self.features.filter(function (feature) {
				return feature.elements.length > 0 &&
					(feature.elements.length > 1 || feature.elements[0].type !== 'background');
			});
		};

		self.on('update', function () {
			if (typeof self.filter !== 'undefined') {
				var flags = [];

				for (var i = 0; i < self.filter.length; i++) {
					for (var k in self.filter[i]) {
						flags.push(k + '-' + self.filter[i][k]);
					}
				}

				self.filterFlags = flags.join(' ');
			}
		});

		self.on('updated', function () {
			raita.bubble(self, 'rt-feature', 'rt:select-tag');
		});
	
});

riot.tag('rt-build-filter', '<form onsubmit="{ submit }"> <div class="filter input-group"> <span class="input-group-btn"> <button class="btn btn-default" type="button" onclick="{ clear }"><span class="octicon octicon-circle-slash"></span></button> </span> <input class="form-control" type="text" name="filterString" value="{ filterToString() }" placeholder="e.g. \'status:failed\', \'status:skipped\', \'@some-tag-name\'"> <span class="input-group-btn"> <button class="btn btn-info" type="submit">Update</button> </span> </div> </form>', function(opts) {
		var self = this;

		self.filter = [];

		function filterFromString(str) {
			return str.split(/\s+/).map(function (item) {
				var m, pair = {};

				if (m = item.match(/^(@.+)$/)) {
					pair.tag = m[1];
				} else if (m = item.match(/^(status):(.+)$/)) {
					pair[m[1]] = m[2];
				}

				return pair;
			});
		}

		self.clear = function () {
			self.filter = [];
			self.trigger('rt:filter', self.filter);
			self.filterString.focus();
		};

		self.filterToString = function () {
			return self.filter.map(function (pair) {
				for (var k in pair) {
					switch (k) {
						case 'tag':
							return pair[k];
						default:
							return k + ':' + pair[k];
					}
				}
			})
			.join(' ');
		};

		self.submit = function () {
			self.filter = filterFromString(self.filterString.value);
			self.trigger('rt:filter', self.filter);
		};
	
});

riot.tag('rt-build-info', '<div class="build-details panel panel-default"> <div class="panel-heading"> <h3 if="{ !buildId }">Loading build...</h3> <h3 if="{ buildId }">Build { build.number } <a href="{ build.url }" class="glyphicon glyphicon-new-window"></a></h3> <h4><span class="label label-{ raita.statuses[build.result.status] }">{ build.result.status }</span></h4> </div> <table class="table"> <tr data-toggle="tooltip" title="Repository"> <th><span class="octicon octicon-repo"></span></th> <td><a href="{ build.repoURL() }">{ build.project.repo }</a></td></tr> <tr data-toggle="tooltip" title="Branch"> <th><span class="octicon octicon-git-branch"></span></th> <td>{ build.project.branch }</td></tr> <tr data-toggle="tooltip" title="Commit"> <th><span class="octicon octicon-git-commit"></span></th> <td><a href="{ build.commitURL() }">{ build.project.commit }</a></td></tr> <tr data-toggle="tooltip" title="Environment URL"> <th><span class="octicon octicon-cloud-upload"></span></th> <td><a hef="{ build.environment.url }">{ build.environment.url }</a></td></tr> <tr data-toggle="tooltip" title="Browser"> <th><span class="octicon octicon-browser"></span></th> <td>{ build.browser.name }</td></tr> <tr data-toggle="tooltip" title="Browser version"> <th><span class="octicon octicon-versions"></span></th> <td>{ build.browser.version || \'(latest)\' }</td></tr> <tr data-toggle="tooltip" title="Platform"> <th><span class="octicon octicon-terminal"></span></th> <td>{ build.browser.platform }</td></tr> </table> </div> <div class="progress"> <a class="progress-bar progress-bar-striped progress-bar-danger" riot-style="width: { stats.fail_rate }%" onclick="{ failedClicked }"> <span class="label label-default" if="{ stats.failed > 0 }">{ stats.failed } failed</span> </a> <a class="progress-bar progress-bar-striped progress-bar-warning" riot-style="width: { stats.skip_rate }%" onclick="{ skippedClicked }"> <span class="label label-default" if="{ stats.skipped > 0 }">{ stats.skipped } skipped</span> </a> <a class="progress-bar progress-bar-striped progress-bar-success" riot-style="width: { stats.pass_rate }%" onclick="{ passedClicked }"> <span class="label label-default" if="{ stats.passed > 0 }">{ stats.passed } passed</span> </a> </div>', 'rt-build-info .build-details { margin-top: 20px; } rt-build-info .build-details th { width: 1%; } rt-build-info .build-details td { width: 99%; } rt-build-info .progress { margin-top: 20px; } rt-build-info .progress .label { font-size: 100%; background-color: rgba(119, 119, 119, 0.75); } rt-build-info a { cursor: pointer; }', function(opts) {
		var self = this;

		function recalculate() {
			self.stats = { failed: 0, skipped: 0, passed: 0, fail_rate: 0, skip_rate: 0, passed_rate: 0 };

			if (self.features) {
				var total = 0;

				self.features.forEach(function (feature) {
					if (typeof feature.elements !== 'undefined') {
						feature.elements.forEach(function (element) {
							if (element.type == 'scenario') {
								if (typeof self.stats[element.result.status] !== 'undefined') {
									self.stats[element.result.status]++;
								}

								total++;
							}
						});
					}
				});

				self.stats.fail_rate = self.stats.failed / total * 100;
				self.stats.skip_rate = self.stats.skipped / total * 100;
				self.stats.pass_rate = self.stats.passed / total * 100;
			}
		}

		recalculate();

		['failed', 'skipped', 'passed'].forEach(function (status) {
			self[status + 'Clicked'] = function () {
				self.trigger('rt:status-click', status);
			};
		});

		self.on('update', recalculate);

		self.on('updated', function () {
			$('[data-toggle="tooltip"]', self.root).tooltip({ placement: 'left' });
		});
	
});

riot.tag('rt-builds', '<ul class="builds nav nav-pills"> <li each="{ builds }" role="presentation" class="{ selected: parent.currentBuildId == _id }"> <a href="{ parent.pathTo(this) }" class="label label-{ raita.statuses[result.status] }">Build { number }</a> </li> </ul>', 'rt-builds .builds > li { font-size: larger; } rt-builds .builds > li.selected > a { padding-bottom: 5px; border-bottom: 5px solid rgba(119, 119, 119, 0.75); }', function(opts) {
		var self = this;

		self.builds = [];

		self.pathTo = function (build) {
			var path = 'builds/' + build._id;

			if (typeof self.currentProject !== 'undefined' && build.project.repo == self.currentProject) {
				return '#projects/' + encodeURIComponent(self.currentProject) + '/' + path;
			} else {
				return '#' + path;
			}
		};
	
});

riot.tag('rt-dashboard', '<rt-projects></rt-projects> <rt-builds></rt-builds> <rt-build-info></rt-build-info> <rt-build-filter></rt-build-filter> <rt-build-features></rt-build-features>', function(opts) {
		var self = this,
				dash = opts,
				currentBuildId,
				currentFeatures,
				currentFilter = [],
				currentProject;

		self.on('mount', function () {
			dash.loadProjects();


			self.tags['rt-build-info'].on('rt:status-click', function (status) {
				self.tags['rt-build-filter'].update({ filter: [ { status: status } ] });
			});

			self.tags['rt-build-features'].on('rt:select-tag', function (tag) {
				self.tags['rt-build-filter'].update({ filter: [ { tag: tag.name } ] });
			});

			self.tags['rt-build-filter'].on('update', function () {
				if (currentBuildId && self.tags['rt-build-filter'].filter) {
					currentFilter = self.tags['rt-build-filter'].filter;
					dash.loadFeatures(currentBuildId, currentFilter);
				}
			});
		});


		dash.subscribe(self, {
			'load-projects': function (projects) {
				self.tags['rt-projects'].update({ projects: projects });
			},

			'load-build': function (id, build) {
				currentBuildId = id;

				self.tags['rt-build-filter'].update({ filter: [] });

				self.tags['rt-build-info'].update({ buildId: id, build: build });
				self.tags['rt-builds'].update({ currentBuildId: id });
			},

			'load-builds': function (builds, project) {
				currentProject = project;

				self.tags['rt-builds'].update({ builds: builds, currentProject: currentProject });
				self.tags['rt-projects'].update({ currentProject: project });
			},

			'load-build-features': function (buildId, features) {
				currentFeatures = features;

				dash.loadElements(
					features.map(function (f) { return f._id; }),
					self.tags['rt-build-filter'].filter
				);
			},

			'load-build-features-elements': function (elements) {
				for (var i = 0; i < currentFeatures.length; i++) {
					for (var fid in elements) {
						if (currentFeatures[i]._id === fid) {
							currentFeatures[i].elements = elements[fid];
						}
					}

					if (typeof currentFeatures[i].elements === 'undefined') {
						currentFeatures[i].elements = [];
					}
				}

				self.tags['rt-build-info'].update({ features: currentFeatures });
				self.tags['rt-build-features'].update({ features: currentFeatures, filter: currentFilter });
			},
		});
	
});

riot.tag('rt-element', '<p if="{ tags && tags.length > 0 }"><rt-tag each="{ tags }"></rt-tag></p> <h4 class="list-group-item-heading"> <span class="keyword">{ keyword }</span>: { name } </h4> <p> <span class="label label-{ raita.statuses[result.status] }">{ result.status }</span> <span each="{ links() }"><a target="_blank" href="{ data }" class="octicon octicon-device-desktop"></a></span> </p> <div class="steps list-group"> <rt-step each="{ nonBackgroundSteps() }" class="list-group-item list-group-item-{ raita.statuses[result.status] } status-{ result.status }"></rt-step> </div>', function(opts) {
		var self = this;

		self.background = opts.background;

		self.embeddings = function () {
			if (self.steps.length > 0) {
				return self.steps[self.steps.length - 1].embeddings || [];
			} else {
				return [];
			}
		};

		self.links = function () {
			return self.embeddings().filter(function (embed) { return embed.mime_type === 'text/url'; });
		};

		self.nonBackgroundSteps = function () {
			if (self.type === 'background' || !self.background) {
				return self.steps;
			} else {
				return self.steps.slice(self.background.steps.length);
			}
		};

		self.expandSteps = function (selector) {
			self.tags['rt-step'].filter(selector).forEach(function (step) {
				$(step.root).addClass('expanded');
			});
		};

		self.on('updated', function () {
			if (typeof self.tags['rt-step'] !== 'undefined') {
				for (var i = 0; i < self.tags['rt-step'].length; i++) {
					self.tags['rt-step'][i].on('rt:select-step', function (step) {
						self.expandSteps(function (s) {

							return s.result.status == step.result.status;
						});
					});
				}
			}
		});
	
});

riot.tag('rt-feature', '<p><rt-tag each="{ tags }"></rt-tag></p> <h4 class="list-group-item-heading"><span class="keyword">{ keyword }</span>: { name }</h4> <div class="scenarios list-group"> <rt-element each="{ elements }" background="{ parent.background }" class="list-group-item"></rt-element> </div>', '.tag { margin-right: 0.25em; cursor: pointer; }', function(opts) {
		var self = this;

		self.elements = [];

		self.on('update', function () {
			if (self.elements.length > 0 && self.elements[0].type === 'background') {
				self.background = self.elements[0];
			}
		});

		self.on('updated', function () {
			raita.bubble(self, 'rt-tag', 'rt:select-tag');
		});
	
});

riot.tag('rt-projects', '<ul class="projects nav nav-pills"> <li role="presentation" class="{ active: !currentProject }"> <a href="#builds/latest">All</a> </li> <li each="{ projects }" role="presentation" class="{ active: parent.currentProject === repo }"> <a href="#projects/{ encodeURIComponent(repo) }/builds/latest">{ label }</a> </li> </ul>', 'rt-projects > ul.projects.nav { margin-bottom: 10px; }', function(opts) {
		var self = this;

		self.projects = [];

		self.labelFromName = function (name) {
			return name.replace(/^r\/(mediawiki\/extensions\/)?/, '');
		};

		self.on('update', function () {
			for (var i = 0; i < self.projects.length; i++) {
				self.projects[i].label = self.labelFromName(self.projects[i].name);
			}

			self.projects.sort(function (a, b) {
				var x = a.label.toLowerCase(),
						y = b.label.toLowerCase();

				return x.localeCompare(y);
			});
		});
	
});

riot.tag('rt-step', '<p class="list-group-item-text" onclick="{ select }"> <span class="keyword">{ keyword }</span> <span each="{ nameFragments }" class="{ argument: isArgument }">{ value }</span> </p> <p if="{ match.location }" class="list-group-item-text"> <small>{ match.location }</small> </p> <pre if="{ result.error_message }" onclick="{ showErrorMessage }" class="list-group-item-text error-message collapsed">{ result.error_message }</pre>', 'rt-step > .error-message { transition: max-height 0.6s ease; max-height: 500em; } rt-step > .error-message.collapsed { cursor: pointer; max-height: 3em; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; } rt-step .argument { font-weight: bold; }', function(opts) {
		var self = this;

		
		function fragmentize(name, match) {
			var frags = [],
					pos = 0;

			if (typeof match === 'undefined' || typeof match.arguments === 'undefined') {
				return [ { isArgument: false, value: name } ];
			}

			for (var i = 0; i < match.arguments.length; i++) {
				var arg = match.arguments[i];

				if (typeof arg.offset !== 'undefined') {

					if (pos < arg.offset) {
						frags.push({ isArgument: false, value: name.substr(pos, arg.offset - pos) });
					}

					frags.push({ isArgument: true, value: arg.val });

					pos = arg.offset + arg.val.length;
				}
			}

			if (pos < name.length) {
				frags.push({ isArgument: false, value: name.substr(pos) });
			}

			return frags;
		}

		self.select = function () {
			self.trigger('rt:select-step', self);
		};

		self.showErrorMessage = function (e) {
			$(e.target).removeClass('collapsed');
		};

		self.on('update', function () {
			if (self.name) {
				self.nameFragments = fragmentize(self.name, self.match);
			}
		});
	
});

riot.tag('rt-tag', '<span class="tag label label-default" onclick="{ click }">{ name }</span>', function(opts) {
		var self = this;

		self.click = function () {
			self.trigger('rt:select-tag', { name: self.name, line: self.line });
		};
	
});
