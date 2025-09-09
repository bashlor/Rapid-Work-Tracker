import { Link, Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, BarChart3, Target, Users, Play, TrendingUp } from 'lucide-react'

export default function Landing() {
  return (
    <>
      <Head title="Accueil - Rapid Work Tracker" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">RapidWorkTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Commencer maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Maîtrisez votre temps,
              <span className="text-blue-600 block">maximisez votre productivité</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Vous perdez la trace de votre temps au quotidien ? RapidWorkTracker est l'outil simple
              et efficace pour suivre vos tâches, organiser vos journées, et reprendre le contrôle
              sur votre emploi du temps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  Essayer gratuitement
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                Voir la démo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir RapidWorkTracker ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une solution complète pour transformer votre gestion du temps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Simplicité d'utilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Démarrez et arrêtez le suivi en un clic, sans distraction ni prise de tête.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Visualisation claire</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Accédez à des rapports détaillés pour comprendre où part votre temps.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Organisation personnalisée</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Classez vos tâches par projets, catégories ou priorités.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Suivi en temps réel</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Surveillez votre progression et ajustez votre planning à la volée.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              En 4 étapes simples vers une meilleure productivité
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Ajoutez vos tâches</h3>
              <p className="text-gray-600">
                Notez rapidement les tâches à effectuer, assignez-les à des projets ou à des
                priorités.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Lancez le timer</h3>
              <p className="text-gray-600">
                Démarrez le suivi du temps en un clic, faites des pauses, reprenez, changez de tâche
                facilement.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Analysez vos journées</h3>
              <p className="text-gray-600">
                Consultez des tableaux de bord clairs : temps passé par tâche, projet, période…
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Optimisez votre organisation</h3>
              <p className="text-gray-600">
                Utilisez les statistiques pour mieux planifier vos prochaines journées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Pour qui ?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Indépendants & freelances</CardTitle>
              </CardHeader>
            </Card>

            <Card className="text-center border-2 border-green-100 hover:border-green-300 transition-colors">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Étudiants & chercheurs</CardTitle>
              </CardHeader>
            </Card>

            <Card className="text-center border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Entreprises & équipes</CardTitle>
              </CardHeader>
            </Card>

            <Card className="text-center border-2 border-orange-100 hover:border-orange-300 transition-colors">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Toute personne souhaitant mieux gérer son temps</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-lg text-gray-600 mb-6 italic">
                    "Grâce à RapidWorkTracker, j'ai doublé ma productivité et je sais enfin où passe
                    mon temps chaque semaine."
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">Amélie</p>
                    <Badge variant="secondary">Freelance</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-lg text-gray-600 mb-6 italic">
                    "Une interface simple, mais redoutablement efficace pour organiser mes
                    journées."
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">Lucas</p>
                    <Badge variant="secondary">Étudiant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Essayez RapidWorkTracker gratuitement
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Inscrivez-vous en 30 secondes et commencez à optimiser votre temps dès aujourd'hui !
          </p>
          <Link href="/auth/register">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Commencer maintenant
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">RapidWorkTracker</span>
            </div>
            <p className="text-gray-400 mb-6">Besoin d'une démo ou de plus d'informations ?</p>
            <p className="text-gray-400">
              Contactez-nous :{' '}
              <a
                href="mailto:contact@rapidworktracker.com"
                className="text-blue-400 hover:text-blue-300"
              >
                contact@rapidworktracker.com
              </a>
            </p>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
