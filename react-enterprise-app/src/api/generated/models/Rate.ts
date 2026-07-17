/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Rate = {
    /**
     * The date of the rate
     */
    date: string;
    /**
     * Base currency code
     */
    base: string;
    /**
     * Quote currency code
     */
    quote: string;
    /**
     * Exchange rate value
     */
    rate: number;
    /**
     * Per-provider rates for this pair. Present only when `expand=providers` is set. Each entry has the provider's observation date and published rate (rebased to the row's base). Entries with `excluded: true` did not contribute to the blended `rate` — either flagged as outliers by the consensus filter, or overridden by a currency peg. Omitted on synthesized peg rows where no provider published the quote.
     */
    providers?: Array<{
        /**
         * Provider key
         */
        key: string;
        /**
         * Provider observation date used for this entry
         */
        date: string;
        /**
         * Provider's rate, rebased to the row's base
         */
        rate: number;
        /**
         * Present and true when this entry did not contribute to the blended rate
         */
        excluded?: boolean;
    }>;
};

