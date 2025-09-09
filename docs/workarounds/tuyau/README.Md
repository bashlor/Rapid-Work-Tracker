# Workaround Tuyau pour Structure Exotique

## Problème

Le générateur de types Tuyau ne supporte pas nativement notre structure de projet personnalisée où les controllers sont organisés dans :
- `app/core/auth/controllers/`
- `app/core/main/controllers/app/`
- `app/core/main/controllers/landing/`

Au lieu de la structure standard AdonisJS où les controllers sont dans `app/controllers/`.

Cela causait des erreurs du type :
```
[ warn ] Unable to find the controller file for /api/sessions/:id
```

## Solution

Le workaround modifie le fichier `generate.js` de Tuyau pour supporter notre structure personnalisée.

### Fichier à modifier

```
node_modules/.pnpm/@tuyau+core@[VERSION]/node_modules/@tuyau/core/build/commands/generate.js
```

### Modifications appliquées

1. **Recherche flexible des controllers** : Au lieu de chercher seulement avec les patterns standards, le code essaie plusieurs patterns adaptés à notre structure
2. **Support des dossiers personnalisés** : Recherche spécifiquement dans nos dossiers `core/auth/controllers/`, `core/main/controllers/app/`, etc.
3. **Suppression des logs debug verbeux** : Évite le spam de logs pour une sortie plus propre

### Code modifié

Dans la méthode `generate()`, la logique de recherche des fichiers de contrôleurs a été remplacée par :

```javascript
const file = sourcesFiles.find((sf) => {
  const filePath = sf.getFilePath();
  
  // Support pour la structure exotique avec app/core/*/controllers/
  const normalizedModulePath = routeHandler.moduleNameOrPath
    .replace("./", "")
    .replace(".js", "")
    .replace("#", "");
  
  // Recherche flexible qui supporte différentes structures de dossiers
  const patterns = [
    // Pattern original
    routeHandler.moduleNameOrPath.startsWith("./") 
      ? routeHandler.moduleNameOrPath.replace("./", "").replace(".js", ".ts")
      : `${routeHandler.moduleNameOrPath.replace("#", "")}.ts`,
    // Pattern pour la structure exotique
    `core/auth/controllers/${normalizedModulePath.split('/').pop()}.ts`,
    `core/main/controllers/app/${normalizedModulePath.split('/').pop()}.ts`,
    `core/main/controllers/landing/${normalizedModulePath.split('/').pop()}.ts`,
    // Pattern générique pour toute structure dans app/
    `${normalizedModulePath}.ts`
  ];
  
  return patterns.some(pattern => {
    const matches = filePath.endsWith(pattern);
    return matches;
  });
});
```

## Application du workaround

⚠️ **Important** : Ce workaround doit être appliqué après chaque `pnpm install` car il modifie les fichiers dans `node_modules`.

### Résultat

Après application du workaround :
- ✅ Les types Tuyau sont générés correctement
- ✅ Plus d'erreurs "Unable to find the controller file"
- ✅ Sortie propre sans logs debug verbeux
- ✅ Support complet de notre structure de projet personnalisée

## Tests

Pour vérifier que le workaround fonctionne :

```bash
cd apps/rapidwork-web
node ace tuyau:generate
```

Vous devriez voir :
```
[ info ] Generating types for /api/sessions/by_date
[ info ] Generating types for /api/sessions
[ info ] Generating types for /api/sessions/:id
[ success ] Types generated successfully
```

Sans aucun warning ou erreur.