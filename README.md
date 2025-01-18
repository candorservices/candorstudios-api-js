# Candor Studios API - Javascript/Typescript
JS Library for Candor Studios' Freelancer API. Please see https://candorstudios.notion.site/Freelancer-API-Docs-14c9e5d3cd0f809b9aa7cc4f251c8d3e?pvs=74 for more documentation on the API and how it works.

## Documentation
You can add the library to your project with:
```
npm install candorstudios-js
```
Then, initialize the `Candor` class using your API key found at https://candorstudios.net/app/freelancers/api-dashboard.

### Verifying a license
To verify a license key, first copy the relevant product ID from the dashboard. Then, you can use the following code. You should obtain the license key either via a config file or Candor's Remote configs.
License key validation is signed by the API to protect against them being tampered with during transit, but this function will handle verifying that signature for you.

```js
let valid = await candor.verifyLicense(LICENSE_KEY, PRODUCT_ID);
```

### Retrieving a remote config
Similar to license keys, you'll first need to copy the ID of the relevant config. Then, use the following:
```js
let obj = await candor.getConfig(CONFIG_ID);
```
to retrieve the remote config as a JS object. 

## Need support?
If you have any questions about how to use this library, please email `contact@candorstudios.net` or create a support ticket in Discord.