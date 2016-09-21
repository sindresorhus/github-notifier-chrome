'use strict';

import Option from './src/option';
import PermissionsService from './src/permissions-service';
import PersistenceService from './src/persistence-service';

document.addEventListener('DOMContentLoaded', () => {
	const ghSettingsUrl = document.getElementById('gh_link');
	const showDesktopNotif = document.getElementById('show_desktop_notif');

	const RootUrlOption = new Option({
		id: 'root_url',
		storageKey: 'rootUrl',
		valueType: 'value',
		onChange: option => {
			let url = normalizeRoot(option.element.value);

			const urlSettings = `${normalizeRoot(option.element.value)}settings/tokens/new?scopes=notifications`;

			// case of url is empty: set to default
			if (url === normalizeRoot('')) {
				PersistenceService.remove('rootUrl');
				url = PersistenceService.get('rootUrl');
			}

			option.writeValue(url);
			ghSettingsUrl.href = urlSettings;
			updateBadge();
			reloadSettings();
		}
	});

	const OauthTokenOption = new Option({
		id: 'oauth_token',
		storageKey: 'oauthToken',
		valueType: 'value',
		onChange(option) {
			option.writeValue();
			updateBadge();
		}
	});

	const UseParticipatingCountOption = new Option({
		id: 'use_participating',
		storageKey: 'useParticipatingCount',
		valueType: 'checked',
		onChange(option) {
			option.writeValue();
			updateBadge();
		}
	});

	const ShowDesktopNotificationsOption = new Option({
		id: 'show_desktop_notif',
		storageKey: 'showDesktopNotif',
		valueType: 'checked',
		onChange(option) {
			if (showDesktopNotif.checked) {
				PermissionsService.requestPermission('notifications').then(granted => {
					if (granted) {
						updateBadge();
					}
					option.writeValue(granted);
				});
			} else {
				option.writeValue();
			}
		}
	});

	function normalizeRoot(url) {
		if (!/^https?:\/\//.test(url)) {
			// assume it is https
			url = `https://${url}`;
		}

		if (!/\/$/.test(url)) {
			url += '/';
		}

		return url;
	}

	function updateBadge() {
		chrome.runtime.sendMessage('update');
	}

	function reloadSettings() {
		RootUrlOption.readValue();
		OauthTokenOption.readValue();
		UseParticipatingCountOption.readValue();
		ShowDesktopNotificationsOption.readValue();
	}
});
