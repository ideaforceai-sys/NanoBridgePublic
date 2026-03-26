import type React from 'react'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['en', 'zh']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (!locales.includes(locale)) {
    notFound()
  }

  const isZh = locale === 'zh'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const currentUrl = baseUrl ? `${baseUrl}/${locale}` : ''
  const siteName = 'IdeaForce'
  const title = siteName
  const description = isZh
    ? 'IdeaForce 官网，更多内容持续更新中。'
    : 'Official IdeaForce website. More content is being updated.'

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: isZh ? 'IdeaForce,AI,产品' : 'IdeaForce,AI,product',
    authors: [{ name: 'IdeaForce Team' }],
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/logo.png', type: 'image/png', sizes: '512x512' },
      ],
      shortcut: '/logo.png',
      apple: '/logo.png',
    },
    metadataBase: baseUrl ? new URL(baseUrl) : null,
    alternates: baseUrl
      ? {
          canonical: currentUrl,
          languages: {
            zh: `${baseUrl}/zh`,
            en: `${baseUrl}/en`,
          },
        }
      : undefined,
    openGraph: {
      type: 'website',
      locale: isZh ? 'zh_CN' : 'en_US',
      url: currentUrl,
      title,
      description,
      siteName,
      images: baseUrl
        ? [
            {
              url: `${baseUrl}/images/homehaibao.png`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: baseUrl ? [`${baseUrl}/images/homehaibao.png`] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
    category: 'technology',
    other: {
      'theme-color': '#00F0FF',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': siteName,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale)) {
    notFound()
  }

  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div data-locale={locale}>{children}</div>
    </NextIntlClientProvider>
  )
}
