const fs = require('fs');
let code = fs.readFileSync('src/app/[...slug]/page.tsx', 'utf8');

const importReplacement = `import { ContactForm } from '@/components/ContactForm';
import { OrgChartPageTemplate } from '@/components/OrgChartPageTemplate';`;
code = code.replace(`import { ContactForm } from '@/components/ContactForm';`, importReplacement);

const pageFnTarget = `export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;`;

const pageFnReplacement = `export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');

  // Check OrgSettings
  const payloadConfig = await getPayload({ config: configPromise });
  let orgSlug = 'gioi-thieu/co-cau-to-chuc';
  try {
    const orgSettings = await payloadConfig.findGlobal({ slug: 'org-settings' });
    if (orgSettings?.pagePath) {
      orgSlug = orgSettings.pagePath;
    }
  } catch (e) {}

  if (slug === orgSlug) {
    return <OrgChartPageTemplate slug={slug} />;
  }`;

code = code.replace(pageFnTarget, pageFnReplacement);

const metaTarget = `export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;`;

const metaReplacement = `export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug: slugArray } = await params;
  const slug = slugArray.join('/');

  const payloadConfig = await getPayload({ config: configPromise });
  let orgSlug = 'gioi-thieu/co-cau-to-chuc';
  try {
    const orgSettings = await payloadConfig.findGlobal({ slug: 'org-settings' });
    if (orgSettings?.pagePath) orgSlug = orgSettings.pagePath;
  } catch (e) {}

  if (slug === orgSlug) return { title: 'Cơ cấu tổ chức — CDC Đà Nẵng' };`;

code = code.replace(metaTarget, metaReplacement);

fs.writeFileSync('src/app/[...slug]/page.tsx', code);
console.log('Successfully updated page.tsx');
