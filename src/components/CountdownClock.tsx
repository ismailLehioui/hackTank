import { useCountdown } from '../hooks/useCountdown'
import { EVENT } from '../data'

export function CountdownClock() {
  const { days, hours, minutes, seconds, done } = useCountdown(EVENT.startsAt)
  const units = [
    { label: 'days', value: days },
    { label: 'hours', value: hours },
    { label: 'minutes', value: minutes },
    { label: 'seconds', value: seconds },
  ]

  return (
    <div className="clock">
      {units.map((unit) => (
        <div key={unit.label}>
          <strong>{done ? '00' : String(unit.value).padStart(2, '0')}</strong>
          <span>{unit.label}</span>
        </div>
      ))}
    </div>
  )
}
