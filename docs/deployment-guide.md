# 🚀 Guide de Déploiement - Versioning Automatique

Ce guide explique comment utiliser le système de versioning automatique pour déployer sur la branche `main` avec différents types de versions (MAJOR, MINOR, PATCH).

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Convention de commits](#convention-de-commits)
- [Types de versions](#types-de-versions)
- [Processus de déploiement](#processus-de-déploiement)
- [Exemples pratiques](#exemples-pratiques)
- [Dépannage](#dépannage)

## 🎯 Vue d'ensemble

Le système analyse automatiquement vos commits depuis le dernier tag pour déterminer le type de version à appliquer selon [Semantic Versioning](https://semver.org/) :

- **MAJOR** (X.0.0) : Changements incompatibles
- **MINOR** (X.Y.0) : Nouvelles fonctionnalités compatibles
- **PATCH** (X.Y.Z) : Corrections de bugs

**🆕 Premier déploiement :** Si aucun tag n'existe, le système commence par `v0.0.1`, `v0.1.0` ou `v1.0.0` selon le type de commits détectés.

## 📝 Convention de commits

Pour que le système fonctionne correctement, utilisez ces préfixes dans vos messages de commit :

### ✨ Nouvelles fonctionnalités (MINOR)
```bash
feat: ajouter authentification OAuth
feature: implémenter système de notifications
```

### 🐛 Corrections de bugs (PATCH)
```bash
fix: corriger l'affichage du calendrier
bugfix: résoudre problème de connexion base de données
```

### 💥 Changements incompatibles (MAJOR)
```bash
BREAKING CHANGE: modifier l'API des utilisateurs
breaking: supprimer l'ancien système d'auth
```

### 📚 Documentation et autres (PATCH)
```bash
docs: mettre à jour le README
style: corriger l'indentation
refactor: restructurer le code
test: ajouter tests unitaires
chore: mettre à jour les dépendances
```

## 🔄 Types de versions

### 🔴 MAJOR (X.0.0)
**Quand utiliser :** Changements qui cassent la compatibilité

**Déclencheurs :**
- Message contenant `BREAKING CHANGE`
- Message contenant `breaking:`

**Exemples :**
- Modification d'API publique
- Suppression de fonctionnalités
- Changement de structure de base de données incompatible

### 🟡 MINOR (X.Y.0)
**Quand utiliser :** Nouvelles fonctionnalités compatibles

**Déclencheurs :**
- Message contenant `feat` ou `feature:`

**Exemples :**
- Nouvelle page ou composant
- Nouvelle API endpoint
- Nouvelle fonctionnalité utilisateur

### 🟢 PATCH (X.Y.Z)
**Quand utiliser :** Corrections et améliorations mineures

**Déclencheurs :**
- Tous les autres types de commits
- Messages contenant `fix`, `docs`, `style`, etc.

**Exemples :**
- Correction de bugs
- Mise à jour documentation
- Optimisations de performance

## 🚀 Processus de déploiement

### Étape 1 : Développement et commits
```bash
# Faire vos modifications
git add .
git commit -m "feat: ajouter système de notifications"

# Pousser vers votre branche de développement
git push origin feature/notifications
```

### Étape 2 : Merge Request vers main
1. Créer une Merge Request vers `main`
2. Faire reviewer le code
3. Merger la MR

### Étape 3 : Déclenchement du versioning
1. Aller dans GitLab CI/CD → Pipelines
2. Localiser le pipeline sur `main`
3. Cliquer sur le job `analyze_version`
4. Cliquer sur "Play" (▶️) pour lancer manuellement

### Étape 4 : Vérification automatique
Le système va automatiquement :
- ✅ Analyser les commits depuis le dernier tag
- ✅ Déterminer le type de version
- ✅ Générer le changelog
- ✅ Créer le tag Git
- ✅ Builder l'image Docker avec le bon tag
- ✅ Pousser tout vers le registry

## 📖 Exemples pratiques

### Exemple 0 : Premier déploiement (aucun tag existant)
```bash
# Aucun tag n'existe encore dans le projet
git tag -l
# (aucun résultat)

# Commits depuis le début du projet
git log --oneline
# feat: ajouter système de tâches
# fix: corriger configuration base de données
# docs: ajouter README

# Résultat : Version 0.1.0 (MINOR car il y a feat:)
# Si seulement des fix/docs : Version 0.0.1 (PATCH)
# Si BREAKING CHANGE : Version 1.0.0 (MAJOR)
```

### Exemple 1 : Déploiement PATCH
```bash
# Commits depuis le dernier tag v1.2.0
git log v1.2.0..HEAD --oneline
# fix: corriger bug affichage calendrier
# docs: mettre à jour README

# Résultat : Version 1.2.1 (PATCH)
```

### Exemple 2 : Déploiement MINOR
```bash
# Commits depuis le dernier tag v1.2.1
git log v1.2.1..HEAD --oneline
# feat: ajouter export PDF
# fix: corriger validation formulaire

# Résultat : Version 1.3.0 (MINOR)
```

### Exemple 3 : Déploiement MAJOR
```bash
# Commits depuis le dernier tag v1.3.0
git log v1.3.0..HEAD --oneline
# BREAKING CHANGE: modifier structure API utilisateurs
# feat: nouveau système d'authentification

# Résultat : Version 2.0.0 (MAJOR)
```

## 🔧 Configuration du déploiement

### Variables d'environnement
Votre `docker-compose.prod.yml` utilise déjà la variable `DOCKER_IMAGE` :

```bash
# Déployer une version spécifique
DOCKER_IMAGE=lab.frogg.it:5050/grind-apps/rapid-work-tracker:v1.3.0 \
docker-compose -f docker-compose.prod.yml up -d

# Déployer la dernière version
DOCKER_IMAGE=lab.frogg.it:5050/grind-apps/rapid-work-tracker:latest \
docker-compose -f docker-compose.prod.yml up -d
```

### Fichier .env pour la production
Créez un fichier `.env` :
```env
DOCKER_IMAGE=lab.frogg.it:5050/grind-apps/rapid-work-tracker:latest
TZ=Europe/Paris
PORT=3333
NODE_ENV=production
# ... autres variables
```

## 🛠️ Dépannage

### Problème : Le job analyze_version ne se lance pas
**Solution :** Vérifiez que vous êtes sur la branche `main` et lancez manuellement

### Problème : Mauvais type de version détecté
**Cause :** Convention de commits non respectée
**Solution :** Utilisez les bons préfixes (`feat:`, `fix:`, `BREAKING CHANGE:`)

### Problème : Tag déjà existant
**Cause :** Tentative de création d'un tag qui existe déjà
**Solution :** Le système incrémente automatiquement, vérifiez les logs

### Problème : Image Docker non trouvée
**Cause :** Tag pas encore poussé ou nom incorrect
**Solution :** Vérifiez le registry GitLab et utilisez le bon tag

### Question : Première version du projet
**Réponse :** Le système commence par v0.0.1 (PATCH), v0.1.0 (MINOR) ou v1.0.0 (MAJOR) selon vos commits

## 📊 Suivi des versions

### Voir les tags existants
```bash
git tag -l
# v1.0.0
# v1.1.0
# v1.2.0
```

### Voir le changelog
Le fichier `CHANGELOG.md` est automatiquement généré et maintenu.

### Voir les images Docker
Dans GitLab : Container Registry → rapid-work-tracker

## 🎯 Bonnes pratiques

1. **Commits atomiques** : Un commit = une fonctionnalité/correction
2. **Messages clairs** : Utilisez la convention de commits
3. **Tests avant merge** : Assurez-vous que tout fonctionne
4. **Review de code** : Faites reviewer vos changements
5. **Documentation** : Mettez à jour la doc si nécessaire

## 🔗 Liens utiles

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)

---

**💡 Astuce :** Pour forcer un type de version spécifique, assurez-vous que votre commit contient le bon préfixe. Par exemple, même pour une petite fonctionnalité, utilisez `feat:` si vous voulez une version MINOR.
