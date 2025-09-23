import { Button } from '@/components/ui/button'
import { Domain, Subdomain } from '@/lib/mock_data'

interface DomainListProps {
  domains: Domain[]
  onAddSubdomain: (domain: Domain) => void
  onDeleteDomain: (domain: Domain) => void
  onDeleteSubdomain: (domain: Domain, subdomain: Subdomain) => void
  onEditDomain: (domain: Domain) => void
  onEditSubdomain: (domain: Domain, subdomain: Subdomain) => void
}

export function DomainList({
  domains,
  onAddSubdomain,
  onDeleteDomain,
  onDeleteSubdomain,
  onEditDomain,
  onEditSubdomain,
}: DomainListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">Domaines et sous-domaines</h3>
      {domains.map((domain) => (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm" key={domain.id}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-semibold text-gray-900">{domain.name}</h4>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {domain.subdomains.length} sous-domaine{domain.subdomains.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="text-sm"
                onClick={() => onAddSubdomain(domain)}
                size="sm"
                variant="outline"
              >
                Ajouter sous-domaine
              </Button>
              <Button
                className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => onEditDomain(domain)}
                size="sm"
                title="Modifier le domaine"
                variant="ghost"
              >
                ✏️
              </Button>
              <Button
                className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDeleteDomain(domain)}
                size="sm"
                title="Supprimer le domaine"
                variant="ghost"
              >
                🗑️
              </Button>
            </div>
          </div>
          {domain.subdomains.length > 0 ? (
            <div className="ml-4 border-l-2 border-blue-200 pl-6 space-y-3">
              {domain.subdomains.map((subdomain) => (
                <div
                  className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 shadow-sm"
                  key={subdomain.id}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{subdomain.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => onEditSubdomain(domain, subdomain)}
                      size="sm"
                      title="Modifier le sous-domaine"
                      variant="ghost"
                    >
                      ✏️
                    </Button>
                    <Button
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDeleteSubdomain(domain, subdomain)}
                      size="sm"
                      title="Supprimer le sous-domaine"
                      variant="ghost"
                    >
                      ✖️
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-4 border-l-2 border-gray-200 pl-6">
              <p className="text-sm text-gray-500 italic">Aucun sous-domaine défini</p>
            </div>
          )}
        </div>
      ))}
      {domains.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          Aucun domaine défini. Utilisez le bouton "Ajouter Domaine" pour commencer.
        </p>
      )}
    </div>
  )
}
