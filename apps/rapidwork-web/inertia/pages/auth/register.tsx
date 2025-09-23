import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { AlertCircle, Clock, Lock, Mail, User } from 'lucide-react'
import React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormInput } from '@/components/ui/form-input'
import { useFormQuery } from '@/hooks/useFormQuery'
import { tuyau } from '@/tuyau'
import { RegisterPageProps } from '@/types/page_props'

export default function Register(props: RegisterPageProps) {
  const { flash } = props

  const { data, formattedErrors, post, processing, reset, setData } = useFormQuery(
    {
      email: '',
      full_name: '',
      password: '',
      password_confirmation: '',
    },
    {
      // Mapping des labels pour les messages d'erreur
      fieldLabels: {
        email: 'Email address',
        full_name: 'Full name',
        password: 'Password',
        password_confirmation: 'Password confirmation',
      },
      onRetry: (failureCount) => {
        console.info(`New connection attempt ${failureCount}`)
      },
      // Configuration de retry
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      skipRetryOnValidationErrors: true,
    }
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
            <Link className="inline-flex items-center space-x-2" route={'landing'}>
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
                  error={formattedErrors.full_name}
                  icon={<User className="h-4 w-4" />}
                  label="Nom complet"
                  onChange={(value) => setData('full_name', String(value))}
                  placeholder="Votre nom complet"
                  required
                  type="text"
                  value={data.full_name}
                />

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
                  placeholder="Créez un mot de passe sécurisé"
                  required
                  type="password"
                  value={data.password}
                />

                <FormInput
                  error={formattedErrors.password_confirmation}
                  icon={<Lock className="h-4 w-4" />}
                  label="Confirmer le mot de passe"
                  onChange={(value) => setData('password_confirmation', String(value))}
                  placeholder="Confirmez votre mot de passe"
                  required
                  type="password"
                  value={data.password_confirmation}
                />

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={processing}
                  type="submit"
                >
                  {processing ? 'Création du compte...' : 'Créer mon compte'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Déjà un compte ?{' '}
                  <Link
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    route={'login.show'}
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
