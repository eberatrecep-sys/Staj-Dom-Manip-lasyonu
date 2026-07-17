/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Provider = {
    /**
     * Provider identifier
     */
    key: string;
    /**
     * Full provider name
     */
    name: string;
    /**
     * ISO 3166-1 alpha-2 country code
     */
    country_code?: string | null;
    /**
     * Official rate type as used by the source
     */
    rate_type?: string | null;
    /**
     * Base currency for published rates
     */
    pivot_currency?: string | null;
    /**
     * Link to the data source
     */
    data_url?: string | null;
    /**
     * Link to terms of use
     */
    terms_url?: string | null;
    /**
     * Earliest available date
     */
    start_date?: string | null;
    /**
     * Latest available date
     */
    end_date?: string | null;
    /**
     * How often the provider publishes rates. Determines the unit of publishes_missed: a count of days, ISO weeks, or calendar months. Null for historical-only providers with no scheduled cadence.
     */
    publish_cadence?: Provider.publish_cadence;
    /**
     * Number of expected publishes missed since end_date, in units of publish_cadence. For daily providers, counts scheduled publish days strictly between end_date and today. For weekly and monthly providers, counts ISO weeks or calendar months between the latest imported bucket and the bucket whose publish window has already started. Null when the provider has no scheduled cadence or no imported data.
     */
    publishes_missed?: number | null;
    /**
     * Currency codes covered by this provider
     */
    currencies: Array<string>;
};
export namespace Provider {
    /**
     * How often the provider publishes rates. Determines the unit of publishes_missed: a count of days, ISO weeks, or calendar months. Null for historical-only providers with no scheduled cadence.
     */
    export enum publish_cadence {
        DAILY = 'daily',
        WEEKLY = 'weekly',
        MONTHLY = 'monthly',
    }
}

