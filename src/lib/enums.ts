export enum HttpStatus {
    Ok = 200,
    Created = 201,
    NoContent = 204,

    Forbidden = 403,
    NotFound = 404,
    TooManyRequests = 429,
}

export function isStatusOk(s: HttpStatus) {
    const firstDigit = +s.toString().charAt(0);
    return firstDigit === 2;
}
