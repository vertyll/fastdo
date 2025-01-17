import { NgxsModuleOptions, NoopNgxsExecutionStrategy } from '@ngxs/store';

import { environment } from '../environments/environment';

export const ngxsConfig: NgxsModuleOptions = {
  developmentMode: !environment.production,
  selectorOptions: {
    suppressErrors: false,
  },
  compatibility: {
    strictContentSecurityPolicy: true,
  },
  // Execution strategy overridden for illustrative purposes
  // (only do this if you know what you are doing)
  executionStrategy: NoopNgxsExecutionStrategy,
};
