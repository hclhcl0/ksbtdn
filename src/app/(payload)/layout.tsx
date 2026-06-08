import configPromise from '@payload-config'
import '@payloadcms/next/css'
import './custom.css'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap'
import { GlobalLogoutButton } from './admin/components/GlobalLogoutButton'

type Args = {
  children: React.ReactNode
}

const serverFunction = async function (args: any) {
  'use server'
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}

const Layout = ({ children }: Args) => {
  return (
    <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
      <GlobalLogoutButton>
        {children}
      </GlobalLogoutButton>
    </RootLayout>
  )
}

export default Layout
