'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { aiManager } from '@/lib/ai'

interface SpeechToTaskProps {
  onTaskCreated: (task: string) => void
  disabled?: boolean
  className?: string
}

export default function SpeechToTask({ onTaskCreated, disabled = false, className = '' }: SpeechToTaskProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any | null>(null)

  const startListening = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser')
      return
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
      }

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        setIsListening(false)
        setIsProcessing(true)
        
        try {
          const processedTask = await aiManager.speechToTaskWithFallback(transcript)
          onTaskCreated(processedTask || transcript)
        } finally {
          setIsProcessing(false)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setIsProcessing(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleClick = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <Button
      variant={isListening ? "destructive" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`${className} ${isListening ? 'animate-pulse' : ''}`}
      title={isListening ? 'Stop recording' : 'Speak to add task'}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      <span className="ml-2">
        {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Speak'}
      </span>
    </Button>
  )
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}