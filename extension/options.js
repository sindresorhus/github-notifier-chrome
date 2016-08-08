(() => {
	'use strict';

	document.addEventListener('DOMContentLoaded', () => {
		const persistence = new PersistenceService(new DefaultsService());
		const permissions = new PermissionsService(persistence);

		const ghSettingsUrl = document.getElementById('gh_link');
		const showDesktopNotif = document.getElementById('show_desktop_notif');

		const RootUrlOption = new Option(persistence, {
			id: 'root_url',
			storageKey: 'rootUrl',
			valueType: 'value',
			onChange: () => {
				let url = normalizeRoot(this.element.value);

				const urlSettings = `${normalizeRoot(this.element.value)}settings/tokens/new?scopes=notifications`;

				// case of url is empty: set to default
				if (url === normalizeRoot('')) {
					persistence.remove('rootUrl');
					url = persistence.get('rootUrl');
				}

				this.writeValue(url);
				ghSettingsUrl.href = urlSettings;
				updateBadge();
				reloadSettings();
			}
		});

		const OauthTokenOption = new Option(persistence, {
			id: 'oauth_token',
			storageKey: 'oauthToken',
			valueType: 'value',
			onChange() {
				this.writeValue();
				updateBadge();
			}
		});

		const UseParticipatingCountOption = new Option(persistence, {
			id: 'use_participating',
			storageKey: 'useParticipatingCount',
			valueType: 'checked',
			onChange() {
				this.writeValue();
				updateBadge();
			}
		});

		const ShowDesktopNotificationsOption = new Option(persistence, {
			id: 'show_desktop_notif',
			storageKey: 'showDesktopNotif',
			valueType: 'checked',
			onChange() {
				if (showDesktopNotif.checked) {
					permissions.requestPermission('notifications').then(granted => {
						if (granted) {
							updateBadge();
						}
						this.writeValue(granted);
					});
				} else {
					this.writeValue();
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
})();
