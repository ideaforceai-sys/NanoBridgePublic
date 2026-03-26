'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { PageBackground } from '@/components/page-background'
import { Button } from '@/components/ui/button'

export function ComingSoonPage() {
  const router = useRouter()
  const locale = useLocale()

  return (
    <PageBackground>
      <Navbar />
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-24">
        <div className="w-full max-w-2xl rounded-2xl border border-border/60 bg-background/70 p-10 text-center shadow-lg backdrop-blur-sm">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">敬请期待</h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Coming Soon
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href={`/${locale}`}>返回首页</Link>
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              返回上一页
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </PageBackground>
  )
}
