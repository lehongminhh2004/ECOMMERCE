import * as migration_20260603_124920_init from './20260603_124920_init';
import * as migration_20260607_104322_add_locales from './20260607_104322_add_locales';
import * as migration_20260608_add_coupon_code from './20260608_add_coupon_code';
import * as migration_20260609_fix_promotion_content_schema from './20260609_fix_promotion_content_schema';
import * as migration_20260609_fix_posts_localized_discount_label from './20260609_fix_posts_localized_discount_label';

export const migrations = [
  {
    up: migration_20260603_124920_init.up,
    down: migration_20260603_124920_init.down,
    name: '20260603_124920_init',
  },
  {
    up: migration_20260607_104322_add_locales.up,
    down: migration_20260607_104322_add_locales.down,
    name: '20260607_104322_add_locales',
  },
  {
    up: migration_20260608_add_coupon_code.up,
    down: migration_20260608_add_coupon_code.down,
    name: '20260608_add_coupon_code',
  },
  {
    up: migration_20260609_fix_promotion_content_schema.up,
    down: migration_20260609_fix_promotion_content_schema.down,
    name: '20260609_fix_promotion_content_schema',
  },
  {
    up: migration_20260609_fix_posts_localized_discount_label.up,
    down: migration_20260609_fix_posts_localized_discount_label.down,
    name: '20260609_fix_posts_localized_discount_label',
  },
];
