import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { AlertCircle, Clock, Lock, Mail } from 'lucide-react'
import React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormInput } from '@/components/ui/form-input'
import { useFormQuery } from '@/hooks/useFormQuery'
import { tuyau } from '@/tuyau'
import { LoginPageProps } from '@/types/page_props'

export default function Login(props: LoginPageProps) {
  const { flash } = props

  const { data, formattedErrors, post, processing, reset, setData } = useFormQuery(
    {
      email: '',
      password: '',
      remember: false,
    },
    {
      // Mapping des labels pour les messages d'erreur
      fieldLabels: {
        email: 'Email',
        password: 'Mot de passe',
        remember: 'Se souvenir de moi',
      },
      onRetry: (failureCount) => {
        console.info(`Nouvelle tentative de connexion ${failureCount}`)
      },
      // Configuration de retry
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      skipRetryOnValidationErrors: true,
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(tuyau.auth.login.$url(), {
      onSuccess: () => {
        // Reset seulement en cas de succès
        reset('password')
      },
    })
  }

  return (
    <>
      <Head title="Connexion" />
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
            <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
            <CardDescription>Connectez-vous à votre compte pour continuer</CardDescription>
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
                label="Email"
                onChange={(value) => setData('email', String(value))}
                placeholder="votre@email.com"
                required
                type="email"
                value={data.email}
              />

              <FormInput
                error={formattedErrors.password}
                icon={<Lock className="h-4 w-4" />}
                label="Mot de passe"
                onChange={(value) => setData('password', String(value))}
                placeholder="Votre mot de passe"
                required
                type="password"
                value={data.password}
              />

              <div className="flex items-center space-x-2">
                <input
                  checked={data.remember}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  id="remember"
                  onChange={(e) => setData('remember', e.target.checked as any)}
                  type="checkbox"
                />
                <label className="text-sm text-gray-600" htmlFor="remember">
                  Se souvenir de moi
                </label>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={processing}
                type="submit"
              >
                {processing ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <div className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  route={'register.show'}
                >
                  Créer un compte
                </Link>
              </div>

              <div className="pt-4">
                <Link className="text-sm text-gray-500 hover:text-gray-700" route={'landing'}>
                  ← Retour
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
