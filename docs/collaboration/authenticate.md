---
tableOfContents: true
---

# Authentication and authorization in Collaboration

## Authentication in Collaboration

After setting up a collaborative editor in the installation guide, it's crucial to address authentication for longer-term use. The temporary JWT provided by Collaboration is only suitable for brief testing sessions.

### **Understanding JWT**

JWT, or JSON Web Token, is a compact, URL-safe means of representing claims to be transferred between two parties. The information in a JWT is digitally signed using a cryptographic algorithm to ensure that the claims cannot be altered after the token is issued. This digital signature makes the JWT a reliable vehicle for secure information exchange in web applications, providing a method to authenticate and exchange information.

### **Creating static JWT for testing**

For testing purposes, you might not want to set up a complete backend system to generate JWTs. In such cases, using online tools like http://jwtbuilder.jamiekurtz.com/ can be a quick workaround. These tools allow you to create a JWT by inputting the necessary payload and signing it with a secret key.

When using these tools, ensure that the "Key" field is replaced with the secret key from your [Collaboration settings](https://collab.tiptap.dev/apps/settings) page. You don’t need to change any other information.

Remember, this approach is only recommended for testing due to security risks associated with exposing your secret key.

### **Generating JWTs for production environments**

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

## **Authorization in Collaboration**

Setting up the right access controls is important for keeping your documents secure and workflows smooth in Tiptap Collaboration.

This part of the guide walks you through how to use JSON Web Tokens (JWTs) to fine-tune who gets to see and edit what. Whether you need to give someone full access, restrict them to certain documents, or block access entirely, we've got you covered with minimalistic examples.

### Allowing Full Access to Every Document

Omitting the `allowedDocumentNames` property from the JWT payload grants the user access to all documents. This is useful for users who need unrestricted access.

```typescript
import jsonwebtoken from 'jsonwebtoken';

const data = {};

const jwt = jsonwebtoken.sign(data, 'your_secret');
```

### **Limiting Access to Specific Documents**

To restrict a user's access to specific documents, include those document names in the `allowedDocumentNames` array within the JWT payload. This ensures the user can only access the listed documents.

```typescript
import jsonwebtoken from 'jsonwebtoken';

const data = {
  allowedDocumentNames: ['user-specific-document-1', 'user-specific-document-2'],
};

const jwt = jsonwebtoken.sign(data, 'your_secret');

```

### Blocking Access to All Documents

To prohibit a user from accessing any documents, provide an empty array for `allowedDocumentNames` in the JWT payload. This effectively blocks access to all documents.

```typescript
import jsonwebtoken from 'jsonwebtoken';

const data = {
  allowedDocumentNames: [],
};

const jwt = jsonwebtoken.sign(data, 'your_secret');
```

## Setting Read-Only Access

The `readonlyDocumentNames` property in your JWT setup plays a crucial role when you need to allow users to view documents without the ability to edit them. This feature is particularly useful in scenarios where you want to share information with team members for review or reference purposes but need to maintain the integrity of the original document.

By specifying document names in the `readonlyDocumentNames` array, you grant users read-only access to those documents. Users can open and read the documents, but any attempts to modify the content will be restricted. This ensures that sensitive or critical information remains unchanged while still being accessible for necessary personnel.

In this example, we grant read-only access to two documents, `annual-report-2024` and `policy-document-v3`. Users with this JWT can view these documents but cannot make any edits.

```typescript
import jsonwebtoken from 'jsonwebtoken';

const data = {
  readonlyDocumentNames: ['annual-report-2024', 'policy-document-v3'],
};

const jwt = jsonwebtoken.sign(data, 'your_secret');
```

Incorporating the `readonlyDocumentNames` property into your JWT strategy enhances document security by ensuring that only authorized edits are made, preserving the integrity of your critical documents.

## Utilizing Wildcards for Flexible Document Access

Wildcards in JWTs offer a dynamic way to manage document access, allowing for broader permissions within specific criteria without listing each document individually. This method is particularly useful in scenarios where documents are grouped by certain attributes, such as projects, teams, or roles.

### Managing Project-Specific Documents

For teams working on multiple projects, it's essential to ensure that members have access only to the documents relevant to their current projects. By using project identifiers with wildcards, you can streamline access management.

```typescript
import jsonwebtoken from 'jsonwebtoken';

const data = {
  allowedDocumentNames: ['project-alpha/*', 'project-beta/*'],
};

const jwt = jsonwebtoken.sign(data, 'your_secret');
```

In this example, users will have access to all documents under 'project-alpha' and 'project-beta', making it easier to manage permissions as new documents are added to these projects.

### Facilitating Role-Based Access Control

Role-based access control (RBAC) is a common requirement in many systems, where access needs to be granted based on the user's role within the organization. Wildcards allow for easy mapping of roles to document access patterns.

```typescript
import jsonwebtoken from 'jsonwebtoken';

const data = {
  allowedDocumentNames: ['editors/*', 'contributors/*'],
};

const jwt = jsonwebtoken.sign(data, 'your_secret');
```

Here, users assigned as 'editors' or 'contributors' can access documents prefixed with their respective roles. This setup simplifies the process of updating access rights as roles change or new roles are added.
