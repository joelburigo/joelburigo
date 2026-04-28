import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // Incremental cache fica como default por enquanto. Plugar R2/KV cache
  // numa próxima sprint (criar bucket NEXT_INC_CACHE_R2_BUCKET).
});
