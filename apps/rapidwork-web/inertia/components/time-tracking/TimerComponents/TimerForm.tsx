import React from 'react'

import TaskSelection from '../TaskComponents/TaskSelection'

interface TimerFormProps {
  customDomain: string
  customSubdomain: string
  customTaskName: string
  isCustomTask: boolean
  isIdle: boolean
  selectedTaskId: string
  setCustomDomain: (domain: string) => void
  setCustomSubdomain: (subdomain: string) => void
  setCustomTaskName: (name: string) => void
  setIsCustomTask: (isCustom: boolean) => void
  setSelectedTaskId: (id: string) => void
}

const TimerForm = ({
  customDomain,
  customSubdomain,
  customTaskName,
  isCustomTask,
  isIdle,
  selectedTaskId,
  setCustomDomain,
  setCustomSubdomain,
  setCustomTaskName,
  setIsCustomTask,
  setSelectedTaskId,
}: TimerFormProps) => {
  return (
    <TaskSelection
      customDomain={customDomain}
      customSubdomain={customSubdomain}
      customTaskName={customTaskName}
      isCustomTask={isCustomTask}
      isIdle={isIdle}
      selectedTaskId={selectedTaskId}
      setCustomDomain={setCustomDomain}
      setCustomSubdomain={setCustomSubdomain}
      setCustomTaskName={setCustomTaskName}
      setIsCustomTask={setIsCustomTask}
      setSelectedTaskId={setSelectedTaskId}
    />
  )
}

export default TimerForm
