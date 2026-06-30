import 'dotenv/config';
import { env } from './shared/config/env.js';
import { app } from './app.js';

app.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});
