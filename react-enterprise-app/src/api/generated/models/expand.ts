/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Comma-separated list of optional fields to include per record. Currently supports `providers`, which adds an array of `{ key, date, rate }` objects per record showing each provider's individual observation date and rate. Outliers excluded from the blend (and providers whose rate was overridden by a currency peg) are flagged with `excluded: true`. The field is omitted on synthesized peg rows where no provider published the quote. In CSV output, the `providers` column is encoded as `KEY:RATE` pairs joined by `|`, with a trailing `*` on excluded entries (e.g. `ECB:0.92|FED:1.50*`).
 */
export enum expand {
    PROVIDERS = 'providers',
}
