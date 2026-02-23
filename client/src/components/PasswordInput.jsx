import { useState } from 'react'

const EyeOpen = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M12 5c5 0 9 5 9 7s-4 7-9 7-9-5-9-7 4-7 9-7zm0 2c-3.866 0-7 3.582-7 5s3.134 5 7 5 7-3.582 7-5-3.134-5-7-5zm0 2.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z"/>
  </svg>
)

const EyeClosed = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M2 4.27L3.28 3l17.72 17.72L20.72 22l-3.06-3.06A10.85 10.85 0 0112 19c-5 0-9-5-9-7a11.6 11.6 0 013.7-4.86L2 4.27zM7.53 9.8A6.9 6.9 0 005 12c0 1.418 3.134 5 7 5 1.04 0 2.02-.22 2.9-.61l-1.84-1.84A2.98 2.98 0 0112 15a3 3 0 01-3-3c0-.41.08-.8.22-1.15l-1.69-1.69zm6.48 2.1l-3.91-3.91A2.98 2.98 0 0112 9a3 3 0 013 3c0 .35-.06.68-.19.98zM12 5c1.2 0 2.34.22 3.38.63l-1.54 1.54A10.4 10.4 0 0012 7C8.88 7 6.13 8.92 4.75 11c.33.48.75 1 1.25 1.54l-1.43 1.43A11.6 11.6 0 013 12c0-2 4-7 9-7z"/>
  </svg>
)

const PasswordInput = ({ value, onChange, placeholder = 'Password', name = 'password', autoComplete = 'current-password', className = '' }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        autoComplete={autoComplete}
        aria-label={placeholder}
        className={`input pr-10 ${className}`}
      />
      <button 
        type="button" 
        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-primary-600 transition-colors"
        aria-label={show ? 'Hide password' : 'Show password'} 
        onClick={() => setShow(!show)}
      >
        {show ? <EyeClosed /> : <EyeOpen />}
      </button>
    </div>
  )
}

export default PasswordInput
