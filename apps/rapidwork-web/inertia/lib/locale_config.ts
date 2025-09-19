/**
 * Configuration centralisée des locales pour l'application
 * Utilise Luxon pour un formatage cohérent des dates en français
 */

// Configuration centralisée des locales
export const LOCALE_CONFIG = {
  // Configuration pour les formats de date courants
  dateFormats: {
    // Formats pour Luxon
    dateTime: 'dd/MM/yyyy HH:mm',
    dateTimeLong: 'cccc dd LLLL yyyy, HH:mm',
    dayMonth: 'dd LLLL',
    long: 'cccc dd LLLL yyyy',
    monthYear: 'LLLL yyyy',
    short: 'dd/MM/yyyy',
    time: 'HH:mm',
    weekday: 'cccc',
    weekdayShort: 'ccc',
  },
  // Locale par défaut
  locale: 'fr-FR',
  // Textes localisés
  texts: {
    add: 'Ajouter',
    cancel: 'Annuler',
    close: 'Fermer',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    edit: 'Modifier',
    error: 'Erreur',
    lastWeek: 'Semaine dernière',
    loading: 'Chargement...',
    nextWeek: 'Semaine prochaine',
    noData: 'Aucune donnée',
    save: 'Enregistrer',
    thisWeek: 'Cette semaine',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    yesterday: 'Hier',
  },
  // Configuration pour les heures de travail
  timeConfig: {
    endHour: 18,
    format24h: true, // Utiliser le format 24h au lieu de AM/PM
    startHour: 8,
  },
  // Timezone par défaut
  timeZone: 'Europe/Paris',
  // Configuration pour les jours de la semaine
  weekConfig: {
    startOfWeek: 1, // Lundi = 1
    workDays: 5, // Lundi à Vendredi
  },
} as const

export type DateFormatKey = keyof typeof LOCALE_CONFIG.dateFormats
// Types pour la sécurité de type
export type LocaleTextKey = keyof typeof LOCALE_CONFIG.texts
