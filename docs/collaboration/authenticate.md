# Authentication in Collaboration

After setting up a collaborative editor in the installation guide, it's crucial to address authentication for longer-term use. The temporary JWT provided by Collaboration is only suitable for brief testing sessions.

### **Understanding JWT**

JWT, or JSON Web Token, is a compact, URL-safe means of representing claims to be transferred between two parties. The information in a JWT is digitally signed using a cryptographic algorithm to ensure that the claims cannot be altered after the token is issued. This digital signature makes the JWT a reliable vehicle for secure information exchange in web applications, providing a method to authenticate and exchange information.

### **Creating static JWT for testing**

For testing purposes, you might not want to set up a complete backend system to generate JWTs. In such cases, using online tools like http://jwtbuilder.jamiekurtz.com/ can be a quick workaround. These tools allow you to create a JWT by inputting the necessary payload and signing it with a secret key.

When using these tools, ensure that the "Key" field is replaced with the secret key from your [Collaboration settings](https://collab.tiptap.dev/apps/settings) page. You don’t need to change any other information.

Remember, this approach is only recommended for testing due to security risks associated with exposing your secret key.

## **Generating JWTs for production environments**

For production-level applications, generating JWTs on the server side is a necessity to maintain security. Exposing your secret key in client-side code would compromise the security of your application. Here’s an enhanced example using NodeJS for creating JWTs server-side:

```bash
npm install jsonwebtoken
```

```typescript
import jsonwebtoken from 'jsonwebtoken'

const payload = {
  // The payload contains claims like the user ID, which can be used to identify the user and their permissions.
  userId: 'user123'
}

// The 'sign' method creates the JWT, with the payload and your secret key as inputs.
const jwt = jsonwebtoken.sign(payload, 'your_secret_key_here')
// The resulting JWT is used for authentication in API requests, ensuring secure access.
// Important: Never expose your secret key in client-side code!
```

This JWT should be incorporated into API requests within the **`token`** field of your authentication provider, safeguarding user sessions and data access.

To fully integrate JWT into your application, consider setting up a dedicated server or API endpoint, such as **`GET /getCollabToken`**. This endpoint would dynamically generate JWTs based on a secret stored securely on the server and user-specific information, like document access permissions.

This setup not only enhances security but also provides a scalable solution for managing user sessions and permissions in your collaborative application.

Ensure the secret key is stored as an environment variable on the server, or define it directly in the server code. Avoid sending it from the client side.

A full server / API example is available [here](https://github.com/ueberdosis/tiptap-collab-replit/tree/main/src).
