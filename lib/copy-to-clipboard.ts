import { useState } from 'react'

type CopiedValue = string | null
type CopyFn = (text: string) => Promise<boolean> // Return success

function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null)

  const copy: CopyFn = async text => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported')
      return false
    }

    // Replace paragraph tags with newlines before stripping HTML
    const processedText = text
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')

    // Strip remaining HTML tags and decode HTML entities
    const tempElement = document.createElement('div')
    tempElement.innerHTML = processedText
    const plainText = tempElement.textContent || tempElement.innerText || ''

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(plainText.trim())
      setCopiedText(plainText.trim())
      return true
    } catch (error) {
      console.warn('Copy failed', error)
      setCopiedText(null)
      return false
    }
  }

  return [copiedText, copy]
}

export default useCopyToClipboard
