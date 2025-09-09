import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TasksTab } from './TasksTab'
import { useDomainsManagement } from '@/hooks/useDomainsManagement'
import { DomainsTab } from './DomainsTab'
import type { ApiDomain, ApiTask } from '@/types/api'

const TaskAndDomainMultiDataView = ({
  domains: initialDomains,
  tasks = [],
}: {
  domains: ApiDomain[]
  tasks?: ApiTask[]
}) => {
  const { domains, loading: isDomainsLoading } = useDomainsManagement(initialDomains)

  if (isDomainsLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-border p-8">
          <h2 className="text-2xl font-semibold mb-6">Gestion des données</h2>
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-border p-8">
        <h2 className="text-2xl font-semibold mb-6">Gestion des données</h2>

        <Tabs defaultValue="tasks">
          <TabsList className="mb-4">
            <TabsTrigger value="tasks">Tâches créées</TabsTrigger>
            <TabsTrigger value="domains">Domaines et Sous-domaines</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TasksTab
              domains={domains}
              tasks={tasks}
              isLoading={isDomainsLoading}
            />
          </TabsContent>

          <TabsContent value="domains">
            <DomainsTab domains={domains} isLoading={isDomainsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default TaskAndDomainMultiDataView
