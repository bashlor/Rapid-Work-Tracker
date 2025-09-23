import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { AlertCircle, ArrowLeft, Clock, Mail } from 'lucide-react'
import React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormInput } from '@/components/ui/form-input'
import { useFormQuery } from '@/hooks/useFormQuery'
import { BasePageProps } from '@/types/page_props'

export default function ForgotPassword(props: BasePageProps) {
  const { flash } = props

  const { data, formattedErrors, processing, setData } = useFormQuery(
    {
      email: '',
    },
    {
      // Mapping des labels pour les messages d'erreur
      fieldLabels: {
        email: 'Adresse email',
      },
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      skipRetryOnValidationErrors: true,
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    /**
    post(tuyau.auth['forgot-password'].$url(), {
      onSuccess: () => reset(),
    })
      **/
  }

  return (
    <>
      <Head title="Mot de passe oublié" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link className="inline-flex items-center space-x-2" route={'landing'}>
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">RapidWorkTracker</span>
            </Link>
          </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
            <CardDescription>
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot
              de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Flash messages */}
            {flash?.error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{flash.error}</AlertDescription>
              </Alert>
            )}
            {flash?.success && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{flash.success}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormInput
                error={formattedErrors.email}
                icon={<Mail className="h-4 w-4" />}
                label="Adresse email"
                onChange={(value) => setData('email', String(value))}
                placeholder="votre@email.com"
                required
                type="email"
                value={data.email}
              />

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={processing}
                type="submit"
              >
                {processing ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                route={'login.show'}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
