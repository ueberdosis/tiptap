# Tiptap Pro Extensions

Tiptap Pro extensions add advanced capabilities to the Tiptap Editor such as versioning and AI-assisted content generation. To use Pro Extensions, you must have an active Tiptap subscription. Some Pro Extensions also require a Tiptap Cloud instance. You access Pro Extensions through the Tiptap private registry.

To install Pro Extensions you must authenticate to the Tiptap private registry with a Tiptap Pro authentication token. You can configure credentials for your package manager on a per-project basis, or set them globally for CI/CD environments. 

:::warning Treat your authentication tokens like passwords to prevent unauthorized use. For more information, see [Best practices for managing authentication tokens](#best-practices-for-managing-authentication-tokens).

## Configure per-project authentication

1. Get your Tiptap Pro authentication token from https://cloud.tiptap.dev/pro-extensions.
2. Add the Tiptap private registry to the package manager configuration file in the root directory of your project.

   For **npm**, **pnpm**, or **Yarn Classic**, add the registry to `.npmrc`. 
 
   ```  
   @tiptap-pro:registry=https://registry.tiptap.dev/
   //registry.tiptap.dev/:_authToken=${TIPTAP_PRO_TOKEN}
   ```

   If you are using **Yarn Modern**, add the registry to `.yarnrc.yml`.

   ```  
   npmScopes:
     tiptap-pro:
       npmAlwaysAuth: true
       npmRegistryServer: "https://registry.tiptap.dev/"
       npmAuthToken: ${TIPTAP_PRO_TOKEN}
   ```

   :::note You can specify the authentication token directly or using an environment variable as shown (recommended).
   
4. Add the configuration file to the project's `.gitignore` file to prevent it from being checked into your source code repository. 

   :::warning This is essential to avoid leaking your credentials if you specify the authentication token directly in the configuration file.

Once you've configured authentication for a project, you can install Pro Extensions like any other Editor extension.

If you use environment variables, pass the authentication token during installation:

```
TIPTAP_PRO_TOKEN=actual-auth-token npm install --save @tiptap-pro/extension-unique-id   
```

## Configure global authentication

You can set up authentication once for __all__ of your projects by updating the package manager configuration file at the user or global level. This is useful for CI/CD environments.

1. Get your Tiptap Pro authentication token from https://cloud.tiptap.dev/pro-extensions.
2. Add the Tiptap private registry to the package manager configuration. 

   ```
   npm config set "@tiptap-pro:registry" https://registry.tiptap.dev/
   ```

3. Add your authentication token to the package manager configuration. 

   ```
   npm config set "//registry.tiptap.dev/:_authToken" actual-auth-token
   ```

Once you've configured authentication, you can install Tiptap Pro extensions like any other extension:

```
npm install --save @tiptap-pro/extension-unique-id

```

## Best practices for managing authentication tokens
