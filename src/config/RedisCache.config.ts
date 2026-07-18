import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const getRedisCacheConfig = async (
  config: ConfigService,
): Promise<CacheModuleOptions> => {
  const store = await redisStore({
    socket: {
      host: config.get<string>('REDIS_HOST') || 'localhost',
      port: config.get<number>('REDIS_PORT') || 6379,
    },
    password: config.get<string>('REDIS_PASSWORD') || undefined,
    ttl: (config.get<number>('REDIS_TTL') || 300) * 1000, // ms
  });

  return {
    store: store as unknown as CacheModuleOptions['store'],
  };
};
