import type { Block } from 'payload';
import { lexicalEditor, HeadingFeature, AlignFeature, BlocksFeature } from '@payloadcms/richtext-lexical';
import { VideoBlock } from './VideoBlock.ts';
import { PDFBlock } from './PDFBlock.ts';
import { GalleryBlock } from './GalleryBlock.ts';
import { CalloutBlock } from './CalloutBlock.ts';
import { ButtonBlock } from './ButtonBlock.ts';
import { RelatedArticlesBlock } from './RelatedArticlesBlock.ts';
import { CardBlock } from './CardBlock.ts';

console.log("DEBUG PAYLOAD BLOCKS IN COLUMNS:", {
  VideoBlock: !!VideoBlock,
  PDFBlock: !!PDFBlock,
  GalleryBlock: !!GalleryBlock,
  CalloutBlock: !!CalloutBlock,
  ButtonBlock: !!ButtonBlock,
  RelatedArticlesBlock: !!RelatedArticlesBlock,
  CardBlock: !!CardBlock,
});

const columnEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h3', 'h4', 'h5'] }),
    AlignFeature(),
    BlocksFeature({
      blocks: [
        VideoBlock,
        PDFBlock,
        GalleryBlock,
        CalloutBlock,
        ButtonBlock,
        RelatedArticlesBlock,
        CardBlock
      ],
    }),
  ],
});

export const ColumnsBlock: Block = {
  slug: 'columnsBlock',
  labels: {
    singular: 'Chia cột (Columns)',
    plural: 'Chia cột (Columns)',
  },
  fields: [
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'half',
      options: [
        { label: '2 cột bằng nhau (50% - 50%)', value: 'half' },
        { label: '3 cột bằng nhau (33% - 33% - 33%)', value: 'third' },
        { label: 'Trái lớn - Phải nhỏ (66% - 33%)', value: 'twoThirdsLeft' },
        { label: 'Trái nhỏ - Phải lớn (33% - 66%)', value: 'twoThirdsRight' },
      ],
      label: 'Kiểu chia cột',
    },
    {
      name: 'col1',
      type: 'richText',
      editor: columnEditor,
      label: 'Nội dung cột 1 (Bên trái)',
      required: true,
    },
    {
      name: 'col2',
      type: 'richText',
      editor: columnEditor,
      label: 'Nội dung cột 2',
      required: true,
    },
    {
      name: 'col3',
      type: 'richText',
      editor: columnEditor,
      label: 'Nội dung cột 3 (Bên phải)',
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'third',
      },
    },
  ],
};
