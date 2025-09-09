/**
 * Base class for ViewModel Action Responses
 * Encapsulates the input parameters, feature response, and formatted output
 */
export abstract class ViewModelActionResponse<TInput, TEntity, TOutput> {
  /**
   * Returns the formatted and serialized data to be returned by the controller
   * This method should transform the domain entities into the appropriate format for the HTTP response
   */
  abstract get publicHttpJsonResponse(): TOutput

  constructor(
    protected readonly input: TInput,
    protected readonly entities: TEntity
  ) {}
}
