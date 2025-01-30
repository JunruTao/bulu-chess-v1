# Bulu Chess App

This is a simple chess game(new type of rules invented by Bruce Wang). In this project, I am aiming to test a full-stack interactive workflow, building game front end with react, typescript, three.js, vite. backend using AWS's Amplify. Testing a full `CI/CD` workflow.

## Setting up environment
Following [Tutorials](https://aws.amazon.com/getting-started/hands-on/build-react-app-amplify-graphql/module-one/?e=gs2020&p=build-a-react-app-intro) from AWS.
1. `> npm create vite@latest`
   - set as react, typescript. test it if works as front end
2. `> npm create amplify@latest -y`
   - adding aws amplify
3. push everything onto repo
4. create deploy a new app on amplify, link github and repo. Deploy, then every time there's a commit to main, the code will start to deploy again.
5. modify amplify structures, define authentication, data and storage structures. 
   > Create sandbox to test all the database, logins etc locally. 
   > `npx ampx sandbox` to create sandbox; `npx ampx sandbox delete` to clear all the data.
6. install amplify ready-made ui libraries for user authentications logins etc.