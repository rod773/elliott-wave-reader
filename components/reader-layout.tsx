"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ReaderContent } from "@/components/reader-content"
import { ReadAloudMenuBar } from "@/components/read-aloud-menu-bar"
import { useTTS } from "@/components/tts-context"

type Block = { type: string; text: string }
type BookPage = { id: string; title: string; blocks: Block[] }

export function ReaderLayout({
  pages,
  title,
  source,
}: {
  pages: BookPage[]
  title: string
  source: string
}) {
  const [showIndex, setShowIndex] = useState(true)
  const { setChapters, activeChapterId } = useTTS()

  useEffect(() => {
    setChapters(
      pages.map((p) => ({
        id: p.id,
        title: p.title,
        text: p.blocks.map((b) => b.text).join(" "),
      }))
    )
  }, [pages, setChapters])

  return (
    <div className="flex flex-col h-full">
      <nav className="border-b border-input bg-background sticky top-0 z-20">
        <div className="container mx-auto px-3 md:px-6 py-2 flex items-center justify-between gap-2 md:gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 h-9 w-9"
              onClick={() => setShowIndex((v) => !v)}
              aria-label={showIndex ? "Hide chapter index" : "Show chapter index"}
              aria-expanded={showIndex}
              aria-controls="chapter-index"
            >
              {showIndex ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
            <span className="text-base md:text-lg font-bold tracking-tight text-primary truncate">
              Elliott Wave
            </span>
          </div>
          <ReadAloudMenuBar />
          <div className="flex items-center gap-4 text-sm shrink-0">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside
            id="chapter-index"
            className={cn("lg:w-72 flex-shrink-0", showIndex ? "block" : "hidden")}
          >
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 rounded-lg border border-input/50 bg-background/50 p-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Chapters
              </h2>
              <nav className="space-y-1 pb-2">
                {pages.map((page) => (
                  <a
                    key={page.id}
                    href={`#${page.id}`}
                    className={cn(
                      "block px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent hover:text-primary",
                      activeChapterId === page.id && "bg-accent text-primary font-medium"
                    )}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        setShowIndex(false)
                      }
                    }}
                  >
                    {page.title}
                  </a>
                ))}
                <a
                  href="#videos"
                  className="block px-3 py-2 text-sm rounded-lg transition-colors hover:bg-accent hover:text-primary font-medium"
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setShowIndex(false)
                    }
                  }}
                >
                  Videos
                </a>
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-8">{title}</h1>
            <p className="text-muted-foreground mb-8">Source: {source}</p>

            {pages.map((page) => (
              <section key={page.id} id={page.id} className="mb-16 scroll-mt-32">
                <ReaderContent page={page} />
              </section>
            ))}

            <section id="videos" className="mb-16 scroll-mt-32">
              <h2 className="text-2xl font-bold text-primary mb-6">Videos</h2>
              <div className="grid gap-6">
                {[
                  "Elliott Wave Triangle Structure ｜ Elliott Wave Learning ｜ Elliott Wave Forecast.mkv",
                  "Elliott Wave Webinar： Elliott Wave for Beginners ｜ Elliott Wave Analysis ｜ Elliott Wave Forecast.mkv",
                  "How to trade a WXY Elliott Wave Structure ｜ Learn Elliott Wave ｜ Elliott Wave Theory.mkv",
                  "Impulse Structure ｜ Forex Market Structure Impulse and Correction ｜ Elliott Wave Forecast.mkv",
                  "Learning Elliott Wave Flat Structure ｜ Elliott Wave Analysis ｜ Elliott Wave Forecast.mkv",
                  "Reading and Labelling Elliott Wave Chart.mkv",
                ].map((videoName, i) => (
                  <div key={i} className="rounded-xl border bg-background overflow-hidden">
                    <video className="w-full aspect-video min-h-[360px] md:min-h-[480px] lg:min-h-[540px]" controls>
                      <source src={`/videos/${videoName}`} type="video/x-matroska" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="p-4">
                      <h3 className="font-semibold">{videoName.replace(/\.mkv$/, "")}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
