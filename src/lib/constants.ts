'use strict';

import * as path from 'path';

export const TRACKING_LIST_DIR_NAME = path.join(
  process.env.HOME as string,
  '.prbroker/tracking_list'
);
