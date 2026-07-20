/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export type CurrencyDetail = {
    /**
     * ISO 4217 currency code
     */
    iso_code: string;
    /**
     * ISO 4217 numeric code
     */
    iso_numeric?: string | null;
    /**
     * Full currency name
     */
    name: string;
    /**
     * Currency symbol
     */
    symbol?: string | null;
    /**
     * Provider keys that publish this currency
     */
    providers?: Array<string>;
    /**
     * Peg metadata, present only for pegged currencies
     */
    peg?: {
        base?: string;
        rate?: number;
        authority?: string;
        source?: string;
    };
};

