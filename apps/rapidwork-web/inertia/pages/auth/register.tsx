import React, { useEffect } from 'react'
import { Link } from '@tuyau/inertia/react'
import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormInput } from '@/components/ui/form-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { RegisterPageProps } from '@/types/page_props'
import { useFormQuery } from '@/hooks/useFormQuery'
import { tuyau } from '@/tuyau'

export default function Register(props: RegisterPageProps) {
  const { flash, errors, old } = props

  const { data, setData, post, processing, formattedErrors, reset } = useFormQuery(
    {
      full_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    {
      // Configuration de retry
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onRetry: (failureCount) => {
        console.info(`New connection attempt ${failureCount}`)
      },
      skipRetryOnValidationErrors: true,
      // Mapping des labels pour les messages d'erreur
      fieldLabels: {
        full_name: 'Full name',
        email: 'Email address',
        password: 'Password',
        password_confirmation: 'Password confirmation',
      },
    },
    errors,
    old
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(tuyau.auth.register.$url(), {
      onSuccess: () => {
        // Reset seulement en cas de succès
        reset('password', 'password_confirmation')
      },
    })
  }

  return (
    <>
      <Head title="Inscription" />
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
              <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
              <CardDescription>
                Rejoignez RapidWorkTracker pour optimiser votre temps
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
                  label="Nom complet"
                  type="text"
                  value={data.full_name}
                  onChange={(value) => setData('full_name', String(value))}
                  placeholder="Votre nom complet"
                  error={formattedErrors.full_name}
                  icon={<User className="h-4 w-4" />}
                  required
                />

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
                  placeholder="Confirmez votre mot de passe"
                  error={formattedErrors.password_confirmation}
                  icon={<Lock className="h-4 w-4" />}
                  required
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={processing}
                >
                  {processing ? 'Création du compte...' : 'Créer mon compte'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Déjà un compte ?{' '}
                  <Link
                    route={'login.show'}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
