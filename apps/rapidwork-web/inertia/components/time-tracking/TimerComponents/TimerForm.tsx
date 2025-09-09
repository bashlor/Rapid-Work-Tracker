import React from 'react'
import TaskSelection from '../TaskSelection'

interface TimerFormProps {
  isCustomTask: boolean
  setIsCustomTask: (isCustom: boolean) => void
  customTaskName: string
  setCustomTaskName: (name: string) => void
  customDomain: string
  setCustomDomain: (domain: string) => void
  customSubdomain: string
  setCustomSubdomain: (subdomain: string) => void
  selectedTaskId: string
  setSelectedTaskId: (id: string) => void
  isIdle: boolean
}

const TimerForm = ({
  isCustomTask,
  setIsCustomTask,
  customTaskName,
  setCustomTaskName,
  customDomain,
  setCustomDomain,
  customSubdomain,
  setCustomSubdomain,
  selectedTaskId,
  setSelectedTaskId,
  isIdle,
}: TimerFormProps) => {
  return (
    <TaskSelection
      isCustomTask={isCustomTask}
      setIsCustomTask={setIsCustomTask}
      customTaskName={customTaskName}
      setCustomTaskName={setCustomTaskName}
      customDomain={customDomain}
      setCustomDomain={setCustomDomain}
      customSubdomain={customSubdomain}
      setCustomSubdomain={setCustomSubdomain}
      selectedTaskId={selectedTaskId}
      setSelectedTaskId={setSelectedTaskId}
      isIdle={isIdle}
    />
  )
}

export default TimerForm
