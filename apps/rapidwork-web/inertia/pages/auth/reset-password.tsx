import React from 'react'
import { Link } from '@tuyau/inertia/react'
import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormInput } from '@/components/ui/form-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Lock, AlertCircle, Mail } from 'lucide-react'
import { useFormQuery } from '@/hooks/useFormQuery'
import { tuyau } from '@/tuyau'

export default function ResetPassword(props:any) {
  const { flash, token } = props

  const { data, setData, processing, formattedErrors } = useFormQuery(
    {
      token: token,
      email: '',
      password: '',
      password_confirmation: '',
    },
    {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      skipRetryOnValidationErrors: true,
      // Mapping des labels pour les messages d'erreur
      fieldLabels: {
        email: 'Adresse email',
        password: 'Nouveau mot de passe',
        password_confirmation: 'Confirmation du mot de passe',
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    /**
    post(tuyau.auth['reset-password']({ token }).$url(), {
      onSuccess: () => reset('password', 'password_confirmation'),
    })
    **/
  }

  return (
    <>
      <Head title="Réinitialiser mot de passe" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link route={'landing'} className="inline-flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">RapidWorkTracker</span>
          </Link>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Nouveau mot de passe</CardTitle>
            <CardDescription>
              Choisissez un nouveau mot de passe sécurisé pour votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Flash messages */}
            {flash?.error && (
              <Alert variant="destructive" className="mb-4">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Adresse email"
                type="email"
                value={data.email}
                onChange={(value) => setData('email', String(value))}
                placeholder="votre@email.com"
                error={formattedErrors.email}
                icon={<Mail className="h-4 w-4" />}
                required
              />

              <FormInput
                label="Nouveau mot de passe"
                type="password"
                value={data.password}
                onChange={(value) => setData('password', String(value))}
                placeholder="Créez un mot de passe sécurisé"
                error={formattedErrors.password}
                icon={<Lock className="h-4 w-4" />}
                required
              />

              <FormInput
                label="Confirmer le mot de passe"
                type="password"
                value={data.password_confirmation}
                onChange={(value) => setData('password_confirmation', String(value))}
                placeholder="Confirmez votre nouveau mot de passe"
                error={formattedErrors.password_confirmation}
                icon={<Lock className="h-4 w-4" />}
                required
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={processing}
              >
                {processing ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link route={'login.show'} className="text-sm text-blue-600 hover:text-blue-700">
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
