# Scheduled Publishing

Payload stores scheduled publish operations in PostgreSQL. A separate non-interactive scheduler process must run alongside every production web service:

```sh
npm run jobs:scheduler
```

Each cycle discovers due schedules with `payload jobs:handle-schedules`, runs queued jobs with `payload jobs:run`, logs cycle start/completion or failure, then waits for `SCHEDULER_INTERVAL_MS` (default 60 seconds). `SIGINT` and `SIGTERM` stop the process after the active cycle. Compose runs this command with `restart: unless-stopped` and production configuration.

For deployment smoke testing, execute exactly one cycle:

```sh
SCHEDULER_ONCE=1 npm run jobs:scheduler
```

A failed one-shot exits non-zero. The continuous process logs failures and retries on the next interval so a transient job failure does not permanently stop discovery. Monitor container logs and Payload job records; alert on repeated cycle failures or jobs remaining in failed/retrying states.

Run only one scheduler replica unless your job concurrency and locking policy has been deliberately reviewed. Apply database migrations before starting it. The integration suite creates a controlled scheduled Page publication and verifies that the resulting page becomes indexable.
