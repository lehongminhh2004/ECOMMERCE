import * as migration_20260603_124920_init from './20260603_124920_init';
import * as migration_20260607_104322_add_locales from './20260607_104322_add_locales';

export const migrations = [
  {
    up: migration_20260603_124920_init.up,
    down: migration_20260603_124920_init.down,
    name: '20260603_124920_init',
  },
  {
    up: migration_20260607_104322_add_locales.up,
    down: migration_20260607_104322_add_locales.down,
    name: '20260607_104322_add_locales'
  },
];
