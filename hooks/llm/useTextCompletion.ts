import React from 'react'
import {AgentAPI} from "@palico-ai/react"

const DeploymentID = 8

export const useSummarize = () => {
  const [loading, setLoading] = React.useState(false)

  const summarize = async (text: string) => {
    setLoading(true)
    const result = await AgentAPI.newConversation({
      deploymentId: DeploymentID,
      message: text,
      context: {
        type: 'summarize',
        content: text
      }
    })
    setLoading(false)
    return result
  }

  return {
    summarize,
    loading
  }
}

export const useGenerate = () => {
  const [loading, setLoading] = React.useState(false)

  const generate = async (text: string) => {
    setLoading(true)
    const result = await AgentAPI.newConversation({
      deploymentId: DeploymentID,
      message: text,
      context: {
        type: 'generate',
        content: text
      }
    })
    setLoading(false)
    return result
  }

  return {
    generate,
    loading
  }
}

export const useTranslate = () => {
  const [loading, setLoading] = React.useState(false)

  const translate = async (text: string, translateTo: string) => {
    setLoading(true)
    const result = await AgentAPI.newConversation({
      deploymentId: DeploymentID,
      message: text,
      context: {
        type: 'translate',
        content: text,
        payload: {
          translateTo
        }
      }
    })
    setLoading(false)
    return result
  }

  return {
    translate,
    loading
  }
}