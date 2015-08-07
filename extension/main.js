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

		if (badge && window.GitHubNotify.settings.get('showDesktopNotif')) {
			chrome.notifications.create('github-notifier', {
				title: 'GitHub',
				iconUrl: 'icon-128.png',
				type: 'basic',
				message: 'You have new unread notifications'
			}, function () { });
		}
	}

	function update() {
		window.gitHubNotifCount(function (err, count, interval) {
			var period = 1;
			var text;

			if (interval !== null && interval !== parseInt(window.GitHubNotify.settings.get('interval'), 10)) {
				window.GitHubNotify.settings.set('interval', interval);
				period = Math.ceil(interval / 60);

				if (period < 1) {
					period = 1;
				}
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

	function openNotifPage(tab) {
		var url = GitHubNotify.settings.get('rootUrl');

		if (/api.github.com\/$/.test(url)) {
			url = 'https://github.com/';
		}

		var notifTab = {
			url: url + 'notifications'
		};

		if (tab && (tab.url === '' || tab.url === 'chrome://newtab/' || tab.url === notifTab.url)) {
			chrome.tabs.update(null, notifTab);
		} else {
			chrome.tabs.create(notifTab);
		}
	}

	chrome.alarms.create({when: Date.now() + 2000});
	chrome.alarms.onAlarm.addListener(update);
	chrome.runtime.onMessage.addListener(update);
	chrome.browserAction.onClicked.addListener(openNotifPage);
	chrome.notifications.onClicked.addListener(function () {
		openNotifPage(null);
	});

	update();
})();
