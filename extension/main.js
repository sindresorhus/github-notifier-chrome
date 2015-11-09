(function () {
	'use strict';

	function render(badge, color, title) {
		chrome.browserAction.setBadgeText({
			text: badge
		});

		chrome.browserAction.setBadgeBackgroundColor({
			color: color
		});

		chrome.browserAction.setTitle({
			title: title
		});
	}

	function update() {
		window.gitHubNotifCount(function (err, count, interval) {
			var intervalSetting = parseInt(window.GitHubNotify.settings.get('interval'), 10);
			var period = 1;
			var text;

			if (typeof intervalSetting !== 'number') {
				intervalSetting = 60;
			}

			if (interval !== null && interval !== intervalSetting) {
				window.GitHubNotify.settings.set('interval', interval);
				period = Math.ceil(interval / 60);
			}

			// unconditionally schedule alarm
			chrome.alarms.create({when: Date.now() + 2000 + (period * 60 * 1000)});

			if (err) {
				switch (err.message) {
					case 'missing token':
						text = 'Missing access token, please create one and enter it in Options';
						break;
					case 'server error':
						text = 'You have to be connected to the internet';
						break;
					case 'data format error':
					case 'parse error':
						text = 'Unable to find count';
						break;
					default:
						text = 'Unknown error';
						break;
				}

				render('?', [166, 41, 41, 255], text);
				return;
			}

			window.GitHubNotify.settings.set('count', count);

			if (count === 'cached') {
				return;
			}

			if (count === 0) {
				count = '';
			} else if (count > 9999) {
				count = '∞';
			}

			render(String(count), [65, 131, 196, 255], 'GitHub Notifier');
		});
	}

	chrome.alarms.create({when: Date.now() + 2000});
	chrome.alarms.onAlarm.addListener(update);
	chrome.runtime.onMessage.addListener(update);
	
	// launch options page on first run

	chrome.runtime.onInstalled.addListener(function(details) {
		if (details.reason == "install") {
			chrome.runtime.openOptionsPage();
		}
	});

	chrome.browserAction.onClicked.addListener(function (tab) {
		var url = window.GitHubNotify.settings.get('rootUrl');
		if (/api.github.com\/$/.test(url)) {
			url = 'https://github.com/';
		}

		var ghTab = {
			url: url
		};
		if (window.GitHubNotify.settings.get('count') > 0) {
			ghTab.url = url + 'notifications';
		}

		if (window.GitHubNotify.settings.get('useParticipatingCount')) {
			ghTab.url += '/participating';
		}

		if (typeof tab !== 'undefined' && (tab.url === '' || tab.url === 'chrome://newtab/' || tab.url === ghTab.url)) {
			chrome.tabs.update(null, ghTab);
		} else {
			chrome.tabs.create(ghTab);
		}
	});

	update();
})();
