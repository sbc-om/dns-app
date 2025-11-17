import os from 'os';

export type MemoryProfile = 'low' | 'medium' | 'high';

export interface MemoryBudget {
  profile: MemoryProfile;
  mapSizeBytes: number;
  maxReaders: number;
  maxDbs: number;
  totalMemBytes: number;
}

const ONE_GB = 1024 * 1024 * 1024;
const TWO_GB = 2 * ONE_GB;

/**
 * Estimate a safe LMDB configuration for the current host.
 */
export function getMemoryBudget(): MemoryBudget {
  const totalMemBytes = os.totalmem();
  const prefersLowResource = process.env.LOW_RESOURCE_MODE === 'true';

  if (prefersLowResource || totalMemBytes <= ONE_GB) {
    return {
      profile: 'low',
      mapSizeBytes: 64 * 1024 * 1024,
      maxReaders: 1,
      maxDbs: 4,
      totalMemBytes,
    };
  }

  if (totalMemBytes <= TWO_GB) {
    return {
      profile: 'medium',
      mapSizeBytes: 96 * 1024 * 1024,
      maxReaders: 2,
      maxDbs: 8,
      totalMemBytes,
    };
  }

  return {
    profile: 'high',
    mapSizeBytes: 128 * 1024 * 1024,
    maxReaders: 4,
    maxDbs: 16,
    totalMemBytes,
  };
}

export function isLowResourceMode(): boolean {
  return process.env.LOW_RESOURCE_MODE === 'true' || getMemoryBudget().profile === 'low';
}
