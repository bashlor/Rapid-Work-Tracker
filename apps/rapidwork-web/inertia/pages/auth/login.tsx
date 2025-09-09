import React from 'react'
import { Link } from '@tuyau/inertia/react'
import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormInput } from '@/components/ui/form-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Mail, Lock, AlertCircle } from 'lucide-react'
import { LoginPageProps } from '@/types/page_props'
import { useFormQuery } from '@/hooks/useFormQuery'
import { tuyau } from '@/tuyau'

export default function Login(props: LoginPageProps) {
  const { flash } = props

  const { data, setData, post, processing, formattedErrors, reset } = useFormQuery(
    {
      email: '',
      password: '',
      remember: false,
    },
    {
      // Configuration de retry
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onRetry: (failureCount) => {
        console.info(`Nouvelle tentative de connexion ${failureCount}`)
      },
      skipRetryOnValidationErrors: true,
      // Mapping des labels pour les messages d'erreur
      fieldLabels: {
        email: 'Email',
        password: 'Mot de passe',
        remember: 'Se souvenir de moi',
      },
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
            <Link route={'landing'} className="inline-flex items-center space-x-2">
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
                label="Email"
                type="email"
                value={data.email}
                onChange={(value) => setData('email', String(value))}
                placeholder="votre@email.com"
                error={formattedErrors.email}
                icon={<Mail className="h-4 w-4" />}
                required
              />

              <FormInput
                label="Mot de passe"
                type="password"
                value={data.password}
                onChange={(value) => setData('password', String(value))}
                placeholder="Votre mot de passe"
                error={formattedErrors.password}
                icon={<Lock className="h-4 w-4" />}
                required
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked as any)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Se souvenir de moi
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={processing}
              >
                {processing ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <div className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link
                  route={'register.show'}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Créer un compte
                </Link>
              </div>

              <div className="pt-4">
                <Link route={'landing'} className="text-sm text-gray-500 hover:text-gray-700">
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
