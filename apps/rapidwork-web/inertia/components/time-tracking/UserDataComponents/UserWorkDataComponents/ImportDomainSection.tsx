import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useNotification } from '@/hooks/useNotification'
import { Domain } from '@/lib/mock_data'

interface ImportDomainsSectionProps {
  addDomain: (domain: Domain) => Promise<void>
  domains: Domain[]
  updateDomain: (domain: Domain) => Promise<void>
}

export function ImportDomainsSection({ addDomain, domains, updateDomain }: ImportDomainsSectionProps) {
  const [importCsvText, setImportCsvText] = useState('')
  const { error, success } = useNotification()
  const [loading, setLoading] = useState(false)

  const handleImportCsv = async () => {
    if (!importCsvText.trim()) {
      error('Veuillez entrer des données CSV')
      return
    }

    setLoading(true)
    try {
      const lines = importCsvText.trim().split('\n')
      const newDomains = [...domains]
      let importCount = 0

      lines.forEach((line) => {
        const [domainName, subdomainName] = line.split(',').map((item) => item.trim())
        if (!domainName || !subdomainName) return

        let domain = newDomains.find((d) => d.name.toLowerCase() === domainName.toLowerCase())
        if (!domain) {
          domain = {
            id: `d${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: domainName,
            subdomains: [],
          }
          newDomains.push(domain)
        }

        const subdomainExists = domain.subdomains.some(
          (sd) => sd.name.toLowerCase() === subdomainName.toLowerCase()
        )
        if (!subdomainExists) {
          domain.subdomains.push({
            id: `sd${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: subdomainName,
          })
          importCount++
        }
      })

      for (const domain of newDomains) {
        const existingDomain = domains.find((d) => d.id === domain.id)
        if (existingDomain) {
          await updateDomain(domain)
        } else {
          await addDomain(domain)
        }
      }

      setImportCsvText('')
      success(`${importCount} enregistrements importés avec succès`)
    } catch (e) {
      error("Erreur lors de l'import")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">Import en masse</h3>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="csvInput">Format: domaine,sous-domaine (un par ligne)</Label>
          <textarea
            className="w-full mt-1 p-2 border rounded-md min-h-[100px]"
            id="csvInput"
            onChange={(e) => setImportCsvText(e.target.value)}
            placeholder="Développement,Frontend&#10;Développement,Backend&#10;Marketing,SEO&#10;Marketing,Social Media"
            value={importCsvText}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Chaque ligne au format: nom_domaine,nom_sous_domaine
          </p>
        </div>
        <Button disabled={loading} onClick={handleImportCsv}>
          {loading ? 'Import en cours...' : 'Importer les données'}
        </Button>
      </div>
    </div>
  )
}