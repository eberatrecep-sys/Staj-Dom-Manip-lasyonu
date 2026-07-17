/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Currency = {
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
     * Earliest available date
     */
    start_date?: string | null;
    /**
     * Latest available date
     */
    end_date?: string | null;
};

