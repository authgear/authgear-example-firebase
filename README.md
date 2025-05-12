# Example Code for Authgear Firebase Integration
This repo contains code for a React app that demonstrate how to use Authgear as an authentication provider in an app that uses Firebase services like Firestore, Cloud File storage, etc.

For a full detailed guide on Authgear x Firebase integration see the companion guide for the repo [here](https://docs.authgear.com/how-to-guide/integration/integrate-authgear-with-firebase).

## How to run the code
### Set up repo
1. Create a `.env` file on the root directory of your project then copy and paste the content of `.env.template` to it. Then, add the values for your own Authgear client application's Client ID and Endpoint in the corresponding key. Also add your Firebase credentials to their corresponding keys in the `.env` file.

2. Add `http://localhost:4000/auth-redirect` as a redirect URI for your application in [Authgear Portal](https://portal.authgear.com/).

3. Run `npm install` to install project dependencies.

4. Run `npm run dev` to run the React app in dev mode.

### Set up Firebase function
1. Run `cd cloud_functions` to change your working directory to the `cloud_functions` directory.
2. Install Firebase CLI using the `npm install -g firebase-tools` command.
3. Run `npm install` to install dependencies.
4. Login to your project in Firebase console using the `firebase login` command.
5. Run `firebase deploy` to deploy your function and copy the cloud function endpoint from the terminal output. Add the cloud function endpoint to `const firebaseFunctionEndpoint = "";` in `/src/Todo.tsx`.