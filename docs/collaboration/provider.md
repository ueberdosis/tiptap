# What is the Collaboration Provider

Together with the Collaboration backend, Providers act as the backbone for real-time collaborative editing. They establish and manage the communication channels between different users, ensuring that updates and changes to documents are synchronized across all participants.

Providers help handle the complexities of real-time data exchange, including conflict resolution, network reliability, and user presence awareness. The Hocuspocus provider, specifically designed for Tiptap Collaboration, brings advanced features tailored for collaborative environments, including WebSocket message authentication, debug modes, and flexible connection strategies.

## Setting up a basic configuration

First you need to install the provider package in your project with

```bash
npm install @hocuspocus/provider
```
For a basic setup, you need to connect to the Collaboration backend. This involves specifying the document's name, your app's ID (for cloud setups), or the base URL (for on-premises solutions), along with your JWT. Depending on your framework, register a callback to the Collaboration backend, such as `useEffect()` in React or `onMounted()` in Vue.

```typescript
  const doc = new Y.Doc()

  useEffect(() => {
    const provider = new TiptapCollabProvider({
      name: note.id, // Document identifier
      appId: 'YOUR_APP_ID', // replace with YOUR_APP_ID from Cloud dashboard
      token: 'YOUR_JWT', // Authentication token
      document: doc,
    })
```

## Configuring an advanced provider

Tiptap Collaboration's advanced provider settings offer deep customization for enhanced collaboration. Below, explore a comprehensive list of parameters, practical use cases, and key concepts like "awareness" explained in detail.

| Setting | Description | Default Value |
| --- | --- | --- |
| appId | App ID for Collaboration Cloud setups. | '' |
| baseUrl | URL for connecting to on-premises servers, used as an alternative to appId for on-prem setups. | '' |
| name | The name of the document. | '' |
| document | The Y.js document instance; defaults to creating a new one. | new Y.Doc() |
| token | Authentication token for secure connections. Works with strings, functions and Promises. | '' |
| awareness | Manages user presence information, by default attached to the passed Y.js document. | new Awareness() |
| connect | Whether to connect to the server after initialization. | true |
| preserveConnection | Whether to preserve the websocket connection after closing the provider. | true |
| broadcast | Enables syncing across browser tabs. | true |
| forceSyncInterval | Interval for forced server sync (in ms). | false |
| quiet | Suppresses warning outputs. | false |
| WebSocketPolyfill | WebSocket implementation for Node.js environments. For example ws. | WebSocket |

### Optimizing Reconnection Timings

The provider’s reconnection settings are preset for optimal performance in production settings, ensuring reliability and efficiency. If you need to tweak these settings for specific scenarios, our delay configurations offer flexibility.

Adjust initial delays, apply exponential backoff, or set maximum wait times to fine-tune your application's reconnection behavior, balancing responsiveness with server efficiency.

| Setting | Description | Default Value |
| --- | --- | --- |
| delay | Base delay between reconnection attempts, in milliseconds. | 1000 |
| factor | Multiplier for delay, increasing it exponentially after each attempt. | 2 |
| initialDelay | Time before the first reconnection attempt, in milliseconds. Ideally immediate. | 0 |
| maxAttempts | Maximum number of reconnection attempts. 0 means unlimited. | 0 |
| jitter | When jitter is enabled, it adds variability to the reconnection delay by selecting a random value within the range of minDelay and the delay calculated for the current attempt. | true |
| minDelay | Minimum delay when jitter is enabled, ensuring a random delay isn't too short. This property has no effect if jitter is disabled. | 1000 |
| maxDelay | The maxDelay setting caps the delay during reconnection attempts. When using the exponential backoff (factor), you can specify 0 for maxDelay to remove this upper limit, allowing the delay to increase indefinitely. | 30000 |
| timeout | Sets a limit, in milliseconds, for how long to wait for a reconnection attempt before giving up. If this timeout is reached, subsequent attempts are halted. | 0 |
| messageReconnectTimeout | Defines the duration in milliseconds to await a server message before terminating the connection. If no message is received within this period, the connection is automatically closed. | 30000 |
