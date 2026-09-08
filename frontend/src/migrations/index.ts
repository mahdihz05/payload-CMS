import * as migration_20260907_120000_starter_v1_baseline from './20260907_120000_starter_v1_baseline';
import * as migration_20260907_133520_seo_routing_foundation from './20260907_133520_seo_routing_foundation';
import * as migration_20260907_135305_seo_canonical_override from './20260907_135305_seo_canonical_override';

export const migrations = [
  {
    up: migration_20260907_120000_starter_v1_baseline.up,
    down: migration_20260907_120000_starter_v1_baseline.down,
    name: '20260907_120000_starter_v1_baseline'
  },
  {
    up: migration_20260907_133520_seo_routing_foundation.up,
    down: migration_20260907_133520_seo_routing_foundation.down,
    name: '20260907_133520_seo_routing_foundation'
  },
  {
    up: migration_20260907_135305_seo_canonical_override.up,
    down: migration_20260907_135305_seo_canonical_override.down,
    name: '20260907_135305_seo_canonical_override'
  },
];
