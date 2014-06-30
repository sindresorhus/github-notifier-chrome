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
		gitHubNotifCount(function (count) {
			if (count < 0) {
				var text;
				if (count === -1) {
					text = 'You have to be connected to the internet and logged into GitHub';
				} else if (count === -2) {
					text = 'Unable to find count on page';
				}
				render('?', [166, 41, 41, 255], text);
			} else {
				if (count > 9999) {
					count = '∞';
				}
				render(count, [65, 131, 196, 255], 'GitHub Notifier');
			}
		});
	}

	chrome.alarms.create({periodInMinutes: 1});
	chrome.alarms.onAlarm.addListener(update);
	chrome.runtime.onMessage.addListener(update);

	chrome.browserAction.onClicked.addListener(function (tab) {
		if (tab.url === '' || tab.url === 'chrome://newtab/' || tab.url === GitHubNotify.settings.get('notificationUrl')) {
			chrome.tabs.update(null, {
				url: GitHubNotify.settings.get('notificationUrl')
			});
		} else {
			chrome.tabs.create({
				url: GitHubNotify.settings.get('notificationUrl')
			});
		}
	});

	update();
})();
