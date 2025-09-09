export interface Feature<Input, Output> {
  execute(input: Input): Promise<Output>;
}
