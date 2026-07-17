/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Currency } from '../models/Currency';
import type { CurrencyDetail } from '../models/CurrencyDetail';
import type { Provider } from '../models/Provider';
import type { Rate } from '../models/Rate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Get exchange rates
     * Returns exchange rates blended across providers. Without date params, returns the latest rates. Each record is a single currency pair. The response includes an identity record for the base currency (base equals quote, rate 1), subject to the quotes filter like any other record.
     * @param date Specific date (YYYY-MM-DD). Cannot be combined with from/to.
     * @param from Start of date range (YYYY-MM-DD)
     * @param to End of date range (YYYY-MM-DD). Defaults to today.
     * @param base Base currency (default: EUR)
     * @param quotes Comma-separated list of quote currencies to include
     * @param providers Comma-separated list of data providers to include
     * @param group Downsample rates by time period. Only applies to date ranges.
     * @param expand Comma-separated list of optional fields to include per record. Currently supports `providers`, which adds an array of `{ key, date, rate }` objects per record showing each provider's individual observation date and rate. Outliers excluded from the blend (and providers whose rate was overridden by a currency peg) are flagged with `excluded: true`. The field is omitted on synthesized peg rows where no provider published the quote. In CSV output, the `providers` column is encoded as `KEY:RATE` pairs joined by `|`, with a trailing `*` on excluded entries (e.g. `ECB:0.92|FED:1.50*`).
     * @returns Rate Exchange rates
     * @throws ApiError
     */
    public static getRates(
        date?: string,
        from?: string,
        to?: string,
        base: string = 'EUR',
        quotes?: string,
        providers?: string,
        group?: 'week' | 'month',
        expand?: 'providers',
    ): CancelablePromise<Array<Rate>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rates',
            query: {
                'date': date,
                'from': from,
                'to': to,
                'base': base,
                'quotes': quotes,
                'providers': providers,
                'group': group,
                'expand': expand,
            },
            errors: {
                404: `No data found`,
                422: `Invalid request`,
            },
        });
    }
    /**
     * Get a single exchange rate pair
     * Returns the blended exchange rate for a single currency pair. Without a date param, returns the latest rate. A same-currency pair returns the identity rate of 1.
     * @param base
     * @param quote
     * @param date Specific date (YYYY-MM-DD). Cannot be combined with from/to.
     * @param providers Comma-separated list of data providers to include
     * @returns Rate Exchange rate
     * @throws ApiError
     */
    public static getRate(
        base: string,
        quote: string,
        date?: string,
        providers?: string,
    ): CancelablePromise<Rate> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rate/{base}/{quote}',
            path: {
                'base': base,
                'quote': quote,
            },
            query: {
                'date': date,
                'providers': providers,
            },
            errors: {
                404: `No data found`,
                422: `Invalid request`,
            },
        });
    }
    /**
     * Get a single currency
     * Returns details for a single currency, including provider information or peg metadata.
     * @param code
     * @returns CurrencyDetail Currency details
     * @throws ApiError
     */
    public static getCurrency(
        code: string,
    ): CancelablePromise<CurrencyDetail> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/currency/{code}',
            path: {
                'code': code,
            },
            errors: {
                404: `No data found`,
            },
        });
    }
    /**
     * Get available currencies
     * Returns available currencies with their names and date ranges. By default, only active currencies are included.
     * @param scope Set to 'all' to include legacy currencies
     * @param providers Comma-separated list of data providers to include
     * @returns Currency Available currencies
     * @throws ApiError
     */
    public static getCurrencies(
        scope?: 'all',
        providers?: string,
    ): CancelablePromise<Array<Currency>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/currencies',
            query: {
                'scope': scope,
                'providers': providers,
            },
        });
    }
    /**
     * Get available data providers
     * Returns available exchange rate data providers with their base currency.
     * @returns Provider Available providers
     * @throws ApiError
     */
    public static getProviders(): CancelablePromise<Array<Provider>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/providers',
        });
    }
}
