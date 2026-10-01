import { useId, useState, type FormEvent } from 'react'
import { DEPARTMENTS, type Department } from '../../../shared/domain/status'
import { useCreateRequest } from '../api/api'

export function RequestForm(): React.JSX.Element {
  const [requesterName, setRequesterName] = useState('')
  const [department, setDepartment] = useState<Department>(DEPARTMENTS[0])
  const [purpose, setPurpose] = useState('')
  const [amountPesos, setAmountPesos] = useState('')
  const createRequest = useCreateRequest()

  const id = useId()
  const ids = {
    name: `${id}-name`,
    department: `${id}-department`,
    purpose: `${id}-purpose`,
    amount: `${id}-amount`
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amountCentavos = Math.round(Number(amountPesos) * 100)
    if (!requesterName.trim() || !purpose.trim() || !amountCentavos) return

    createRequest.mutate(
      { requesterName: requesterName.trim(), department, purpose: purpose.trim(), amountCentavos },
      {
        onSuccess: () => {
          setRequesterName('')
          setPurpose('')
          setAmountPesos('')
        }
      }
    )
  }

  return (
    <section className="card form-card" aria-labelledby={`${id}-title`}>
      <header className="card__header">
        <div>
          <h2 className="card__title" id={`${id}-title`}>
            New fund request
          </h2>
          <p className="card__subtitle">Fill in the details to log a request.</p>
        </div>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field__label" htmlFor={ids.name}>
            Requester name
          </label>
          <input
            id={ids.name}
            className="input"
            placeholder="e.g. Juan Dela Cruz"
            autoComplete="off"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor={ids.department}>
            Department
          </label>
          <select
            id={ids.department}
            className="select"
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department)}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor={ids.purpose}>
            Purpose
          </label>
          <textarea
            id={ids.purpose}
            className="input textarea"
            placeholder="What is this fund for?"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor={ids.amount}>
            Amount
          </label>
          <div className="input-group">
            <span className="input-group__prefix" aria-hidden="true">
              ₱
            </span>
            <input
              id={ids.amount}
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amountPesos}
              onChange={(e) => setAmountPesos(e.target.value)}
              required
            />
          </div>
        </div>

        {createRequest.isError && (
          <p className="feedback feedback--error" role="alert">
            Failed to add request. Please try again.
          </p>
        )}
        {createRequest.isSuccess && (
          <p className="feedback feedback--success" role="status">
            Request added.
          </p>
        )}

        <button className="btn" type="submit" disabled={createRequest.isPending}>
          {createRequest.isPending ? 'Adding…' : 'Add request'}
        </button>
      </form>
    </section>
  )
}