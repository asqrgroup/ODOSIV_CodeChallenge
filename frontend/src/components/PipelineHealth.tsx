import { type FC } from 'react'

type Props = {
  status: 'passing' | 'failing' | 'unknown'
}

const PipelineHealth: FC<Props> = ({ status }) => {
  return (
    <div role="status" aria-live="polite" className="pipeline-health">
      <span aria-hidden className={`status-indicator ${status}`} />
      <div>
        <div className="pipeline-health-text">Data Pipeline Health: {status}</div>
      </div>
    </div>
  )
}

export default PipelineHealth
