type SectionHeaderProps = {
  label: string
  title: string
  accent: string
  text?: string
  dark?: boolean
}

export function SectionHeader({ label, title, accent, text, dark }: SectionHeaderProps) {
  return (
    <div className={`section-heading ${dark ? 'on-dark' : ''}`}>
      <div className="section-label">{label}</div>
      <h2>{title}<br /><span>{accent}</span></h2>
      {text && <p>{text}</p>}
    </div>
  )
}
