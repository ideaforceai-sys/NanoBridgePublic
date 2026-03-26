import type React from 'react'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isZh = locale === 'zh'

  return {
    title: isZh ? '敬请期待' : 'Coming Soon',
    description: isZh ? '页面建设中，敬请期待。' : 'This page is under construction.',
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
