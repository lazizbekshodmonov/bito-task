export interface IValidationField {
  field: string;
  errors: string[];
}

export interface IBaseException {
  statusCode: number;
  message: string;
  code: string;
  locale: string;
  path: string;
  timestamp: string;
  details?: IValidationField[];
}

// HTTP Error class for consistent error handling
export class HttpError extends Error {
  status: number;
  code: string;
  data: IBaseException | null;
  silent: boolean;

  constructor(status: number, message: string, code: string = "UNKNOWN_ERROR", data: IBaseException | null = null, silent: boolean = false) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
    this.silent = silent;
    this.name = "HttpError";
  }
}
