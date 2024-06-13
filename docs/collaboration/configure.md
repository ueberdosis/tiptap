# Runtime Configuration for Collaboration

This documentation provides a comprehensive guide to configuring collaboration settings at runtime in your application. These settings allow for flexible management of your collaboration environment without the need to restart your application.

## Collaboration Settings Overview**

Several `key` settings can be adjusted dynamically:

- **secret**: The secret key for JWT tokens, auto-generated upon first launch.
- **api_secret**: The secret for API calls, used in the Authorization header and auto-generated at first boot.
- **webhook_url**: Optional webhook URL for receiving callbacks.
- **authentication_disabled**: Toggle for enabling/disabling authentication (1 for disabled, 0 for enabled, with the default being 0).
- **name**: Optional instance name.
- **webhook_version**: The webhook version
- **default_auto_versioning**: Turn auto versioning on or off by default (1 for enabled, 0 for off).
- **default_auto_versioning_interval**: Default versioning interval (default is 30 seconds)

## Managing Settings via API

The collaboration platform offers a straightforward API for managing these settings:

### Creating or Overwriting Settings

To add or update settings, utilize the following API call:

```bash
curl --location --request PUT 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings/:key' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
```

*Replace `:key` with the setting key you wish to update.*

### Listing Current Settings

Retrieve a list of all current settings with this API request:

```bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
```

### Retrieving a Specific Setting

To fetch the value of a particular setting, use:

```bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings/:key' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'

```

### Updating a Specific Setting

Similar to creating settings, updating is done via:

```bash
curl --location --request PUT 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings/:key' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'

```

### Deleting a Setting

To remove a setting, the following API call is used:

```bash
curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings/:key' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'

```

## Server Performance Metrics

Gain insights into server performance and document statistics through the `/api/statistics` endpoint, providing data on total documents, peak concurrent connections, total connections over the last 30 days, and lifetime connection counts.

```bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/statistics' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
```

*Note: The total number of connections of the last 30 days and the lifetime connection count are presented as strings due to their representation as BIGINT internally.*

This dedicated documentation page aims to clarify the process of adjusting runtime settings for collaboration, ensuring developers can effectively manage their collaborative environments.
