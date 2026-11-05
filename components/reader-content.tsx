"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTTS } from "@/components/tts-context"

interface ReaderContentProps {
  page: {
    id: string
    title: string
    blocks: { type: string; text: string }[]
  }
}

export function ReaderContent({ page }: ReaderContentProps) {
  const { playText } = useTTS()
  const text = page.blocks.map((b) => b.text).join(" ")

  return (
    <article className="space-y-8">
      <motion.div
        whileInView={{ y: [20, 0], opacity: [0, 1] }}
        viewport={{ once: true }}
        className="fade-in"
      >
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <CardTitle className="text-2xl">{page.title}</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => playText(text, page.id)}
              aria-label={`Read aloud: ${page.title}`}
            >
              <Play className="w-4 h-4 mr-2" />
              Read
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="prose prose-lg max-w-none">
              {page.blocks.map((block, i) => {
                switch (block.type) {
                  case "h1":
                    return (
                      <h1 key={i} className="text-3xl font-bold text-primary mb-4 mt-8 first:mt-0">
                        {block.text}
                      </h1>
                    )
                  case "h2":
                    return (
                      <h2 key={i} className="text-2xl font-bold text-primary mb-3 mt-8 border-b border-input pb-2">
                        {block.text}
                      </h2>
                    )
                  case "h3":
                    return (
                      <h3 key={i} className="text-xl font-semibold text-foreground mb-3 mt-6">
                        {block.text}
                      </h3>
                    )
                  case "h4":
                    return (
                      <h4 key={i} className="text-lg font-medium text-foreground mb-2 mt-5">
                        {block.text}
                      </h4>
                    )
                  case "paragraph":
                    return (
                      <p key={i} className="leading-relaxed mb-4 text-foreground">
                        {block.text}
                      </p>
                    )
                  case "list-item":
                    return (
                      <li key={i} className="list-disc list-inside mb-2 text-foreground">
                        {block.text}
                      </li>
                    )
                  default:
                    return null
                }
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </article>
  )
}
