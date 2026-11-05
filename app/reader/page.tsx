import { ReaderLayout } from "@/components/reader-layout"
import { TTSProvider } from "@/components/tts-context"
import bookContent from "@/content/book.json"

type BookPage = {
  id: string
  title: string
  blocks: { type: string; text: string }[]
}

export const metadata = {
  title: "Elliott Wave Theory Reader",
  description: "Read Elliott Wave Theory with scroll animations and read-aloud",
}

export default function ReaderPage() {
  const pages = bookContent.pages as BookPage[]

  return (
    <TTSProvider>
      <ReaderLayout pages={pages} title={bookContent.title} source={bookContent.source} />
    </TTSProvider>
  )
}
