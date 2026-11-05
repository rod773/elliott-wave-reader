"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

export type TTSChapter = { id: string; title: string; text: string }

type TTSState = {
  voices: SpeechSynthesisVoice[]
  englishVoices: SpeechSynthesisVoice[]
  selectedVoiceURI: string
  setSelectedVoiceURI: (uri: string) => void
  isPlaying: boolean
  isPaused: boolean
  chapters: TTSChapter[]
  setChapters: (chapters: TTSChapter[]) => void
  activeChapterId: string | null
  playChapter: (chapterId: string) => void
  playText: (text: string, chapterId?: string | null) => void
  pause: () => void
  resume: () => void
  stop: () => void
  nextChapter: () => void
  prevChapter: () => void
  skipForward: () => void
  skipBack: () => void
  volume: number
  setVolume: (v: number) => void
  currentIndex: number
  totalSentences: number
}

const TTSContext = createContext<TTSState | null>(null)

export function useTTS() {
  const ctx = useContext(TTSContext)
  if (!ctx) throw new Error("useTTS must be used within TTSProvider")
  return ctx
}

function splitIntoSentences(t: string): string[] {
  return t.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0)
}

export function TTSProvider({ children }: { children: React.ReactNode }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceChoice, setVoiceChoice] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [volume, setVolume] = useState(1)
  const [sentences, setSentences] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [chapters, setChapters] = useState<TTSChapter[]>([])
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
  const chaptersRef = useRef<TTSChapter[]>([])
  const activeChapterRef = useRef<string | null>(null)
  const sentencesRef = useRef<string[]>([])
  const indexRef = useRef(-1)
  const playingRef = useRef(false)
  const speakFromRef = useRef<(startIndex: number, list?: string[]) => void>(() => {})

  useEffect(() => {
    chaptersRef.current = chapters
  }, [chapters])

  useEffect(() => {
    activeChapterRef.current = activeChapterId
  }, [activeChapterId])

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices())
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const englishVoices = useMemo(
    () => voices.filter((v) => /^en(-|_|$)/i.test(v.lang)),
    [voices]
  )

  const selectedVoiceURI = useMemo(() => {
    if (voiceChoice && englishVoices.some((v) => v.voiceURI === voiceChoice)) return voiceChoice
    const us = englishVoices.filter((v) => /^en-US/i.test(v.lang))
    const isMale = (v: SpeechSynthesisVoice) =>
      /male|david|mark|alex|daniel|george|andrew|guy|christopher|eric|roger|ryan|jacob/i.test(v.name) ||
      /microsoft david|microsoft mark|microsoft guy|google us english male/i.test(v.name)
    const preferred =
      us.find(isMale) ??
      us[0] ??
      englishVoices.find(isMale) ??
      englishVoices[0]
    return preferred?.voiceURI ?? ""
  }, [englishVoices, voiceChoice])

  const getVoice = useCallback(() => {
    return (
      voices.find((v) => v.voiceURI === selectedVoiceURI) ??
      englishVoices[0] ??
      null
    )
  }, [voices, selectedVoiceURI, englishVoices])

  const speakFrom = useCallback(
    (startIndex: number, list?: string[]) => {
      const items = list ?? sentencesRef.current
      if (startIndex >= items.length) {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentIndex(-1)
        indexRef.current = -1
        playingRef.current = false
        return
      }
      const utterance = new SpeechSynthesisUtterance(items[startIndex])
      utterance.voice = getVoice()
      utterance.volume = volume
      utterance.rate = 1
      utterance.onstart = () => {
        setCurrentIndex(startIndex)
        indexRef.current = startIndex
        setIsPlaying(true)
        setIsPaused(false)
        playingRef.current = true
        const id = activeChapterRef.current
        if (id) {
          const el = document.getElementById(id)
          if (el) {
            const total = Math.max(1, items.length - 1)
            const progress = startIndex / total
            const rect = el.getBoundingClientRect()
            const top = rect.top + window.scrollY
            const maxScroll = Math.max(0, el.scrollHeight - window.innerHeight * 0.5)
            const target = top - 128 + maxScroll * progress
            window.scrollTo({ top: Math.max(0, target), behavior: "smooth" })
          }
        }
      }
      utterance.onend = () => {
        if (playingRef.current) speakFromRef.current(startIndex + 1, items)
      }
      utterance.onerror = () => {
        if (playingRef.current) speakFromRef.current(startIndex + 1, items)
      }
      window.speechSynthesis.speak(utterance)
    },
    [getVoice, volume]
  )

  useEffect(() => {
    speakFromRef.current = speakFrom
  }, [speakFrom])

  const playText = useCallback(
    (text: string, chapterId: string | null = null) => {
      if (!text?.trim()) return
      window.speechSynthesis.cancel()
      document.querySelectorAll("video, audio").forEach((el) => {
        const media = el as HTMLMediaElement
        if (!media.paused) media.pause()
      })
      setActiveChapterId(chapterId)
      activeChapterRef.current = chapterId
      const items = splitIntoSentences(text)
      sentencesRef.current = items
      setSentences(items)
      indexRef.current = 0
      setCurrentIndex(0)
      playingRef.current = true
      setIsPlaying(true)
      setIsPaused(false)
      speakFrom(0, items)
    },
    [speakFrom]
  )

  const playChapter = useCallback(
    (chapterId: string) => {
      const ch = chaptersRef.current.find((c) => c.id === chapterId)
      if (ch) playText(ch.text, ch.id)
    },
    [playText]
  )

  const nextChapter = useCallback(() => {
    const list = chaptersRef.current
    const idx = list.findIndex((c) => c.id === activeChapterRef.current)
    const next = list[idx + 1] ?? list[0]
    if (next) playText(next.text, next.id)
  }, [playText])

  const prevChapter = useCallback(() => {
    const list = chaptersRef.current
    const idx = list.findIndex((c) => c.id === activeChapterRef.current)
    const prev = list[idx - 1] ?? list[list.length - 1]
    if (prev) playText(prev.text, prev.id)
  }, [playText])

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
      setIsPlaying(false)
    }
  }, [])

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      const id = activeChapterRef.current
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  const stop = useCallback(() => {
    playingRef.current = false
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentIndex(-1)
    indexRef.current = -1
    setActiveChapterId(null)
    activeChapterRef.current = null
  }, [])

  const skipForward = useCallback(() => {
    if (!playingRef.current && !isPaused) return
    window.speechSynthesis.cancel()
    const next = Math.min(indexRef.current + 1, sentencesRef.current.length)
    playingRef.current = true
    speakFrom(next)
  }, [isPaused, speakFrom])

  const skipBack = useCallback(() => {
    if (!playingRef.current && !isPaused) return
    window.speechSynthesis.cancel()
    const prev = Math.max(indexRef.current - 1, 0)
    playingRef.current = true
    speakFrom(prev)
  }, [isPaused, speakFrom])

  const value = useMemo<TTSState>(
    () => ({
      voices,
      englishVoices,
      selectedVoiceURI,
      setSelectedVoiceURI: setVoiceChoice,
      isPlaying,
      isPaused,
      chapters,
      setChapters,
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
      currentIndex,
      totalSentences: sentences.length,
    }),
    [voices, englishVoices, selectedVoiceURI, isPlaying, isPaused, chapters, activeChapterId, playChapter, playText, pause, resume, stop, nextChapter, prevChapter, skipForward, skipBack, volume, currentIndex, sentences.length]
  )

  return <TTSContext.Provider value={value}>{children}</TTSContext.Provider>
}
