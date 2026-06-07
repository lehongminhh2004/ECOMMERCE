import * as migration_20260603_124920_init from './20260603_124920_init';

export const migrations = [
  {
    up: migration_20260603_124920_init.up,
    down: migration_20260603_124920_init.down,
    name: '20260603_124920_init'
  },
];
