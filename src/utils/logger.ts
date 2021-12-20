/** @format */

import logger from 'pino';
import dayjs from 'dayjs';

const log = logger({
  prettyPrint: true,

  timestamp: () => `"time": "${dayjs().format()}"`,
});

export default log;
