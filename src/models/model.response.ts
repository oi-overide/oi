/**
 * Type representing a block of code replacement.
 */
export interface ReplacementBlock {
  find: string[]; // The code to find in the file.
  replace: string[]; // The replacement code.
}
