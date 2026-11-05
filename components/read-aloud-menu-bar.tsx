"use client"

import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward, Square, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTTS } from "@/components/tts-context"

export function ReadAloudMenuBar() {
  const {
    englishVoices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    isPlaying,
    isPaused,
    chapters,
    activeChapterId,
    playChapter,
    playText,
    pause,
    resume,
    stop,
    nextChapter,
    prevChapter,
    skipForward,
    skipBack,
    volume,
    setVolume,
  } = useTTS()

  return (
    <div className="flex items-center gap-2 flex-wrap bg-background">
      <span className="text-xs font-medium text-muted-foreground hidden xl:inline">Reading</span>
      <select
        value={selectedVoiceURI}
        onChange={(e) => setSelectedVoiceURI(e.target.value)}
        className="h-9 max-w-[150px] md:max-w-[200px] rounded-md border border-input bg-background px-2 text-sm"
        aria-label="Select English voice"
        title="Select English voice"
      >
        {englishVoices.length === 0 ? (
          <option value="">Loading voices…</option>
        ) : (
          englishVoices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name}
            </option>
          ))
        )}
      </select>
      <select
        value={activeChapterId ?? ""}
        onChange={(e) => {
          const id = e.target.value
          if (id) playChapter(id)
        }}
        className="h-9 max-w-[160px] md:max-w-[240px] rounded-md border border-input bg-background px-2 text-sm"
        aria-label="Select chapter to read"
        title="Select chapter to read"
      >
        <option value="">Select chapter…</option>
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={prevChapter} aria-label="Previous chapter" title="Previous chapter">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={skipBack} aria-label="Previous sentence" title="Previous sentence">
          <SkipBack className="h-4 w-4" />
        </Button>
        {isPlaying ? (
          <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={pause} aria-label="Pause" title="Pause">
            <Pause className="h-4 w-4" />
          </Button>
        ) : isPaused ? (
          <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={resume} aria-label="Resume" title="Resume">
            <Play className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              if (activeChapterId) playChapter(activeChapterId)
              else if (chapters[0]) playText(chapters[0].text, chapters[0].id)
            }}
            aria-label="Play"
            title="Play"
            disabled={chapters.length === 0}
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
        <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={stop} aria-label="Stop" title="Stop" disabled={!isPlaying && !isPaused}>
          <Square className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={skipForward} aria-label="Next sentence" title="Next sentence">
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={nextChapter} aria-label="Next chapter" title="Next chapter">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <label className="flex items-center gap-1 text-muted-foreground" aria-label="Volume">
        <Volume2 className="h-4 w-4" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-14 md:w-20 accent-primary"
        />
      </label>
    </div>
  )
}
