import 'dotenv/config';
import { env } from './shared/config/env.js';
import { app } from './app.js';
import { startSweepJob } from './shared/jobs.js';

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});

startSweepJob();
