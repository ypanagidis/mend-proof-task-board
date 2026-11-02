# Verify

Start the app with the `web` Service recipe (`mend service run web`), or from another directory with
`mend service run --port <port> --name <name> --http -- sh -c 'cd <dir> && node server.mjs'`.
Each copy keeps its tasks in its own `data/tasks.json`, created on first write.

## Sign in

1. Open `http://127.0.0.1:<port>/login`.
2. Sign in with the test account `demo@example.com` / `demo-password` (fixed test data).
3. Observe the Planning task board heading and three tasks.

## Complete a task

1. Signed in, press Done on "Write the release notes".
2. Reload the board.
3. Observe the task row after reload.
