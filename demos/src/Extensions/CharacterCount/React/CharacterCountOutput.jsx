import { CharacterCountGauge } from '../../../Components/CharacterCountGauge.jsx'

export const CharacterCountOutput = ({ charactersCount, wordsCount, limit, limitLabel }) => {
  const percentage = limit ? Math.min(100, Math.round((100 / limit) * charactersCount)) : 0

  return (
    <div
      className={`character-count ${limit !== null && charactersCount >= limit ? 'character-count--warning' : ''}`}
    >
      <CharacterCountGauge percentage={percentage} />
      {charactersCount} / {limitLabel} characters
      <br />
      {wordsCount} words
    </div>
  )
}
