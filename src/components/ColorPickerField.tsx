'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

export const ColorPickerField: React.FC<any> = ({ field, path }) => {
  const { value, setValue } = useField<string>({ path: path || field?.name || '' })
  
  const label = field?.label || field?.name || 'Màu sắc';
  const labelText = typeof label === 'string' ? label : (label?.['vi'] || 'Màu sắc');

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
        {labelText}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input 
          type="color" 
          value={value || '#007a8c'} 
          onChange={(e) => setValue(e.target.value)} 
          style={{ width: '40px', height: '40px', padding: '0', border: '1px solid var(--theme-elevation-150)', borderRadius: '4px', cursor: 'pointer' }}
        />
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => setValue(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid var(--theme-elevation-150)', borderRadius: '4px', flex: 1, maxWidth: '150px', background: 'var(--theme-bg)', color: 'inherit' }}
        />
      </div>
      {field?.admin?.description && (
         <div style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-400)', marginTop: '0.5rem' }}>
           {typeof field.admin.description === 'string' ? field.admin.description : ''}
         </div>
      )}
    </div>
  )
}
