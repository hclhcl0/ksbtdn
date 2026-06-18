'use client'

import React, { useEffect, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

// Hàm chuyển đổi tiếng Việt sang slug không dấu
export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD') // Tách tổ hợp dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa các ký tự dấu
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s/])/g, '') // Xóa ký tự đặc biệt (giữ lại dấu gạch chéo / cho đường dẫn lồng)
    .replace(/(\s+)/g, '-') // Thay khoảng trắng bằng -
    .replace(/-+/g, '-') // Xóa nhiều ký tự - liên tiếp
    .replace(/^-+|-+$/g, ''); // Xóa ký tự - ở đầu và cuối
}

export const SlugField: React.FC<any> = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path: path || field?.name || '' })

  // Lắng nghe thay đổi trường 'title' hoặc 'name'
  const targetValue = useFormFields(([fields]) => {
    const titleField = fields['title'] || fields['name'];
    return titleField?.value;
  }) as string | undefined;

  const [isModifiedByUser, setIsModifiedByUser] = useState(false);

  // Tự động sinh slug khi trường tiêu đề thay đổi và người dùng chưa can thiệp thủ công
  useEffect(() => {
    if (targetValue !== undefined && !isModifiedByUser) {
      const autoSlug = slugify(targetValue);
      if (autoSlug !== value) {
        setValue(autoSlug);
      }
    }
  }, [targetValue, isModifiedByUser, value, setValue]);

  // Nếu người dùng xóa sạch slug thì cho phép tự sinh lại
  useEffect(() => {
    if (!value && isModifiedByUser) {
      setIsModifiedByUser(false);
    }
  }, [value, isModifiedByUser]);

  const label = field?.label || field?.name || 'Đường dẫn tĩnh';
  const labelText = typeof label === 'string' ? label : (label?.['vi'] || 'Đường dẫn tĩnh');

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
        {labelText}
        {field?.required && <span style={{ color: 'var(--theme-error-500)', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <input 
        type="text" 
        value={value || ''} 
        onChange={(e) => {
          setValue(e.target.value);
          setIsModifiedByUser(true);
        }}
        placeholder="viet-slug-tai-day"
        style={{ 
          width: '100%',
          padding: '0.5rem 0.75rem',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: '4px',
          background: 'var(--theme-bg)',
          color: 'inherit'
        }}
      />
      {field?.admin?.description && (
         <div style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-400)', marginTop: '0.5rem' }}>
           {typeof field.admin.description === 'string' ? field.admin.description : ''}
         </div>
      )}
    </div>
  )
}
