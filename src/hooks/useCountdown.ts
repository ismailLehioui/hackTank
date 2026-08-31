import { useEffect, useState } from 'react'

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number; done: boolean }

function computeTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds, done: false }
}

export function useCountdown(iso: string): TimeLeft {
  const target = new Date(iso).getTime()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(target))

  useEffect(() => {
    const id = window.setInterval(() => setTimeLeft(computeTimeLeft(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])

  return timeLeft
}
