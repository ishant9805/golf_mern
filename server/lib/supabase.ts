import { StorageClient } from "@supabase/storage-js";
import { env } from "@/server/lib/env";

export const storageClient = new StorageClient(
  `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1`,
  {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
  }
);
