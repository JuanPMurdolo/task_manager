import type React from "react"

interface SafeErrorDisplayProps {
  error?: string | { msg: string } | any
  className?: string
}

export const SafeErrorDisplay: React.FC<SafeErrorDisplayProps> = ({
  error,
  className = "text-red-400 text-sm mt-1",
}) => {
  if (!error) return null

  const errorMessage = typeof error === "string" ? error : error.msg || "An error occurred."

  return <p className={className}>{errorMessage}</p>
}
