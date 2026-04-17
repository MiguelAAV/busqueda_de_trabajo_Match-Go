export function Button({ 
  children, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}) {
  const baseStyles = 'font-medium rounded-lg transition-all inline-flex items-center justify-center gap-2'
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-300',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 disabled:border-primary-300 disabled:text-primary-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
    ghost: 'text-gray-600 hover:bg-gray-100',
  }
  
  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

export function Input({ 
  label, 
  error,
  className = '',
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input 
        className={`px-3 py-2 border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}

export function Select({ 
  label, 
  options,
  className = '',
  ...props 
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select 
        className={`px-3 py-2 border border-gray-300 rounded-lg ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export function Card({ 
  children, 
  className = '',
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  }
  return (
    <div className={`animate-spin rounded-full border-primary-500 border-t-transparent ${sizes[size]} ${className}`} />
  )
}

export function Textarea({ 
  label, 
  error,
  className = '',
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea 
        className={`px-3 py-2 border rounded-lg min-h-[100px] ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}

export function Badge({ 
  children, 
  variant = 'default',
  className = '' 
}: { 
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function Checkbox({ 
  label,
  className = '',
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
      <input 
        type="checkbox" 
        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
        {...props}
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  )
}