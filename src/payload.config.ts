import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';

// DATABASE_URI = custom Postgres URL
// POSTGRES_URL = auto-injected by Vercel Postgres addon
const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL;

import { Users } from './collections/Users.ts';
import { Media } from './collections/Media.ts';
import { Categories } from './collections/Categories.ts';
import { Tags } from './collections/Tags.ts';
import { Articles } from './collections/Articles.ts';
import { Pages } from './collections/Pages.ts';
import { Banners } from './collections/Banners.ts';
import { Documents } from './collections/Documents.ts';
import { Header } from './globals/Header.ts';
import { MainMenu } from './globals/MainMenu.ts';
import { Sidebar } from './globals/Sidebar.ts';
import { Footer } from './globals/Footer.ts';
import { Settings } from './globals/Settings.ts';
import { BannerSettings } from './globals/BannerSettings.ts';
import { WorkSchedules } from './collections/WorkSchedules.ts';
import { Videos } from './collections/Videos.ts';
import { VideoChannels } from './collections/VideoChannels.ts';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: 'users',
    css: path.resolve(dirname, 'admin.css'),
    components: {
      beforeDashboard: [
        '@/app/(payload)/admin/components/AuthorWelcome.tsx#AuthorWelcome',
        '@/app/(payload)/admin/components/YouTubeSyncButton.tsx#YouTubeSyncButton',
      ]
    }
  },
  collections: [
    Users,
    Media,
    Categories,
    Tags,
    Articles,
    Pages,
    Banners,
    Documents,
    WorkSchedules,
    VideoChannels,
    Videos,
  ],
  globals: [
    Header,
    MainMenu,
    Sidebar,
    Footer,
    Settings,
    BannerSettings,
  ],
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: true,
            },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'YOUR-SUPER-SECRET-KEY',
  db: dbUrl
    ? postgresAdapter({
        pool: {
          connectionString: dbUrl,
        },
        // Tự động tạo/đồng bộ bảng trong database khi khởi động
        // Không cần chạy migrate thủ công
        push: true,
      })
    : sqliteAdapter({
        client: {
          url: 'file:./payload-data.db',
        },
      }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
