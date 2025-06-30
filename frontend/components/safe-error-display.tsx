"use client"

interface SafeErrorDisplayProps {
  error: any
  className?: string
}

export function SafeErrorDisplay({ error, className = "text-red-500 text-sm" }: SafeErrorDisplayProps) {
  const getSafeErrorMessage = (err: any): string => {
    if (!err) return ""
    
    if (typeof err === "string") {
      return err
    }
    
    if (typeof err === "object") {
      // Handle common error object structures
      if (err.message && typeof err.message === "string") {
        return err.message
      }
      
      if (err.msg && typeof err.msg === "string") {
        return err.msg
      }
      
      if (err.detail && typeof err.detail === "string") {
        return err.detail
      }
      
      // If it's an array, try to extract messages
      if (Array.isArray(err)) {
        return err.map(item => getSafeErrorMessage(item)).filter(Boolean).join(", ")
      }
      
      // Last resort - return a generic message instead of trying to stringify
      return "An error occurred"
    }
    
    return String(err)
  }

  const message = getSafeErrorMessage(error)
  
  if (!message) {
    return null
  }

  return <p className={className}>{message}</p>
}
