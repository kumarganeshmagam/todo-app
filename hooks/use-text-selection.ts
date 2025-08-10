'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseTextSelectionOptions {
  targetRef?: React.RefObject<HTMLElement | null>
}

export function useTextSelection({ targetRef }: UseTextSelectionOptions = {}) {
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState<Range | null>(null)

  const updateSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setSelectedText('')
      setSelectionRange(null)
      return
    }

    const range = selection.getRangeAt(0)
    const text = selection.toString().trim()

    // If we have a target ref, check if the selection is within it
    if (targetRef?.current) {
      const isWithinTarget = targetRef.current.contains(range.commonAncestorContainer)
      if (!isWithinTarget) {
        setSelectedText('')
        setSelectionRange(null)
        return
      }
    }

    setSelectedText(text)
    setSelectionRange(text ? range.cloneRange() : null)
  }, [targetRef])

  const replaceSelection = useCallback((newText: string, asHTML = false) => {
    if (!selectionRange) return false

    try {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(selectionRange)
        
        if (asHTML) {
          // Create a temporary container to parse HTML
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = newText
          
          // Insert the parsed HTML content
          selectionRange.deleteContents()
          
          // Insert all child nodes from the temp div
          while (tempDiv.firstChild) {
            selectionRange.insertNode(tempDiv.firstChild)
          }
        } else {
          // Create a text node with the new content
          const textNode = document.createTextNode(newText)
          selectionRange.deleteContents()
          selectionRange.insertNode(textNode)
        }
        
        // Clear selection
        selection.removeAllRanges()
        setSelectedText('')
        setSelectionRange(null)
        
        return true
      }
    } catch (error) {
      console.error('Failed to replace selection:', error)
    }
    
    return false
  }, [selectionRange])

  const clearSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
    setSelectedText('')
    setSelectionRange(null)
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', updateSelection)
    return () => {
      document.removeEventListener('selectionchange', updateSelection)
    }
  }, [updateSelection])

  return {
    selectedText,
    hasSelection: selectedText.length > 0,
    replaceSelection,
    clearSelection
  }
}