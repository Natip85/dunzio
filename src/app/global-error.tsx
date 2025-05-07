'use client'

export default function GlobalError({error: _error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col gap-5'>
        <h1>Global error page</h1>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </div>
    </div>
  )
}
