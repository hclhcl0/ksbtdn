import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { vi } from '@payloadcms/translations/languages/vi';

// DATABASE_URI = custom Postgres URL
// POSTGRES_URL = auto-injected by Vercel Postgres addon
const dbUrl = process.env.DATABASE_URI || process.env.POSTGRES_URL;

import { Users } from './collections/Users.ts';
import { Departments } from './collections/Departments.ts';
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
import { ServicesLanding } from './globals/ServicesLanding.ts';
import { Settings } from './globals/Settings.ts';
import { BannerSettings } from './globals/BannerSettings.ts';
import { ThemeSettings } from './globals/ThemeSettings.ts';
import { WorkSchedules } from './collections/WorkSchedules.ts';
import { Videos } from './collections/Videos.ts';
import { VideoChannels } from './collections/VideoChannels.ts';
import { FormSubmissions } from './collections/FormSubmissions.ts';
import { OrgUnits } from './collections/OrgUnits.ts';
import { AiKnowledge } from './collections/AiKnowledge.ts';
import { ApiKeys } from './collections/ApiKeys.ts';
import { Procurements } from './collections/Procurements.ts';
import { Procedures } from './collections/Procedures.ts';
import { ProcedureGroups } from './collections/ProcedureGroups.ts';
import { Services } from './collections/Services.ts';
import { ServiceCategories } from './collections/ServiceCategories.ts';


const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  onInit: async (payload) => {
    // const { initCron } = await import('./lib/zalo-admin/cron.js');
    // initCron();
  },
  admin: {
    user: 'users',
    css: path.resolve(dirname, 'admin.css'),
    components: {
      graphics: {
        Logo: '@/app/(payload)/admin/components/AdminLogo.tsx#AdminLogo',
        Icon: '@/app/(payload)/admin/components/AdminIcon.tsx#AdminIcon',
      },

      beforeDashboard: [
        '@/app/(payload)/admin/components/AuthorWelcome.tsx#AuthorWelcome',
      ]
    }
  },
  i18n: {
    supportedLanguages: { vi },
    fallbackLanguage: 'vi',
  },
  collections: [
    Departments,
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
    FormSubmissions,
    OrgUnits,
    AiKnowledge,
    ApiKeys,
    Procurements,
    ProcedureGroups,
    Procedures,
    ServiceCategories,
    Services,
  ],
  globals: [
    Header,
    MainMenu,
    Sidebar,
    Footer,
    ServicesLanding,
    Settings,
    BannerSettings,
    ThemeSettings,
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
        // push: false — Schema được quản lý bởi migrate.mjs (chạy trước next build).
        // Drizzle push ở production sẽ hỏi interactive → treo Docker container.
        // Để force sync 1 lần (khi có schema mới lớn): đặt PAYLOAD_FORCE_PUSH=true tạm thời.
        push: (() => {
          const val = String(process.env.PAYLOAD_FORCE_PUSH).toLowerCase().trim();
          return val === 'true' || val === '1' || val === 'yes';
        })(),
      })
    : sqliteAdapter({
        client: {
          url: process.env.SQLITE_URL || 'file:./payload-data.db',
        },
      }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
