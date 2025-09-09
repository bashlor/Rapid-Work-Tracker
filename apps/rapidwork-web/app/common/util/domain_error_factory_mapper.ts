import { Exception } from '@adonisjs/core/exceptions'
import {
  ActiveSessionAlreadyExistsError,
  CannotDeleteDomainWithTasksError,
  CannotDeleteSubDomainWithTasksError,
  DomainError,
  DomainNotFoundError,
  InvalidSessionTimeRangeError,
  InvalidSubDomainWithoutDomainError,
  NoActiveSessionError,
  SessionMustBeLinkedToTaskError,
  SubDomainNotFoundError,
  TaskDoesNotExistError,
  TaskMustBeLinkedToDomainOrSubDomainError,
  TaskNotFoundError,
  UnauthorizedTaskAccessError,
} from 'domain-rapid-work'

// Mapping des erreurs de domaine spécifiques vers les codes de statut HTTP
const domainErrorHttpStatusCodeMapping = {
  // Erreurs de règles métier (409 - Conflict)
  [ActiveSessionAlreadyExistsError.name]: 409,
  [CannotDeleteDomainWithTasksError.name]: 409,
  [CannotDeleteSubDomainWithTasksError.name]: 409,
  // Erreurs de ressources non trouvées (404 - Not Found)
  [DomainNotFoundError.name]: 404,
  // Erreurs de validation/données invalides (422 - Unprocessable Entity)
  [InvalidSessionTimeRangeError.name]: 422,
  [InvalidSubDomainWithoutDomainError.name]: 422,
  [NoActiveSessionError.name]: 404,
  [SessionMustBeLinkedToTaskError.name]: 422,
  [SubDomainNotFoundError.name]: 404,
  [TaskDoesNotExistError.name]: 404,
  [TaskMustBeLinkedToDomainOrSubDomainError.name]: 422,
  [TaskNotFoundError.name]: 404,
  // Erreurs d'autorisation (403 - Forbidden)
  [UnauthorizedTaskAccessError.name]: 403,
} as const

type FindDomainErrorHttpStatusCodeReturnType =
  | {
      domainError: Error
      httpException: Exception
    }
  | {
      domainError: null
      httpException: Exception
    }

export function getHttpExceptionFromDomainError(
  error: Error
): FindDomainErrorHttpStatusCodeReturnType {
  if (!(error instanceof DomainError)) {
    return {
      domainError: null,
      httpException: new Exception('Unknown error', {
        status: 500,
      }),
    }
  }

  // Vérifier si l'erreur a un mapping spécifique
  const errorName = error.constructor.name as keyof typeof domainErrorHttpStatusCodeMapping
  if (errorName in domainErrorHttpStatusCodeMapping) {
    const statusCode = domainErrorHttpStatusCodeMapping[errorName]
    return {
      domainError: error,
      httpException: new Exception(error.message, { status: statusCode }),
    }
  }

  return {
    domainError: error,
    httpException: genericDomainErrorToHttpException(error),
  }
}

function genericDomainErrorToHttpException(error: DomainError): Exception {
  let defaultMessage = 'Unknown error'
  let finalMessage = error.message ?? 'Unknown error'
  if (error.exposeCause && finalMessage !== defaultMessage) {
    finalMessage += `- ${error.cause}`
  }
  switch (error.type) {
    case 'already_exists':
      return new Exception(finalMessage, { status: 409 })
    case 'business_logic_error':
    case 'unknown':
    case 'unspecified_internal_error':
      return new Exception(finalMessage, { status: 500 })
    case 'forbidden':
      return new Exception(finalMessage, { status: 403 })
    case 'invalid_data':
      return new Exception(finalMessage, { status: 422 })
    case 'not_found':
      return new Exception(finalMessage, { status: 404 })
    case 'unauthorized_user_operation':
      return new Exception(finalMessage, { status: 401 })
  }
}
