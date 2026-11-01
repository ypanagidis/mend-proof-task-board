# Task board (Mend proof-artifact test app)

A throwaway web app for checking Mend's recorded proof artifacts. No dependencies; Node 20 or later.

```sh
PORT=3000 node server.mjs
```

Sign in with the test account `demo@example.com` / `demo-password`. This is fixed test data, not a
secret. Tasks are stored in `data/tasks.json` beside the app, so each copy of the app has its own data.
