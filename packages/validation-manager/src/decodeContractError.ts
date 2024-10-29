import { ErrorDescription } from '@ethersproject/abi/lib/interface'
import { IEntryPointInterface } from '@account-abstraction/contracts/types/IEntryPoint'

/**
 * Parse contract error data
 * @param entryPointInterface - EntryPoint contract interface
 * @param error - To parse error object
 * @returns Parsed error data, null if parse failed
 */
export function decodeContractError (
  entryPointInterface: IEntryPointInterface,
  error: any
): ErrorDescription {
  try {
    const data = error?.error?.error?.data ?? error?.error?.data ?? error?.data

    if (data === undefined || data === null || data === '') {
      return {
        name: 'ExecutionError',
        args: { message: error?.message ?? 'Unknown error' },
        signature: 'ExecutionError(string message)',
        sighash: '0x',
        errorFragment: entryPointInterface.getError('ExecutionError')
      } as unknown as ErrorDescription
    }

    // use EntryPoint interface to parse data
    const errorDescription = entryPointInterface.parseError(data)
    return errorDescription
  } catch {
    return {
      name: 'DecodeError',
      args: { message: 'Failed to decode contract error' },
      signature: 'DecodeError(string message)',
      sighash: '0x',
      errorFragment: entryPointInterface.getError('DecodeError')
    } as unknown as ErrorDescription
  }
}

export function isFailedOp (error: ErrorDescription): boolean {
  return error?.name === 'FailedOp'
}

export function isValidationResult (error: ErrorDescription): boolean {
  return error?.name === 'ValidationResult'
}

export function getFailedOpMessage (error: ErrorDescription): string | null {
  if (isFailedOp(error)) {
    return error.args[1]
  }
  return null
}
