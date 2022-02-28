import { expect } from 'chai'
import { decideOn, RuleCasesCollection, ValidatorSet } from '../src'

const getValidators = (values: Record<string, any>): ValidatorSet => ({
    currentMarket: () => values.market || undefined,
    currentCountry: () => values.country || undefined,
    isCreditCard: () => values.cardNumber.indexOf('3') === 0,
    isMastercard: () => values.cardNumber.indexOf('35') === 0,
    isVisa: () => values.cardNumber.indexOf('34') === 0,
})

const creditCardAcceptanceSimple: RuleCasesCollection = [
    {
        active: false,
        validation: { isCreditCard: false },
        resolve: { fee: 0.5 },
    },
    {
        validation: { currentCountry: 'NO', isVisa: true },
        resolve: { availability: false },
    },
    {
        validation: { currentCountry: 'NO', isMastercard: true },
    },
    {
        validation: { currentMarket: 'EU', isMastercard: true },
        resolve: { fee: 0.01 },
    },
    {
        validation: { currentCountry: 'SE', isMastercard: true },
        resolve: { fee: 0.02 },
    },
    {
        validation: { isMastercard: true },
        resolve: { fee: 0.03 },
    },
    {
        validation: { isVisa: true },
        resolve: { fee: 0.04 },
    },
    {
        validation: { isCreditCard: true },
        resolve: { fee: 0.05 },
    },
]

const creditCardAcceptanceStructured: RuleCasesCollection = [
    {
        active: false,
        validation: { isCreditCard: false },
        resolve: { fee: 0.5 },
    },
    {
        validation: { isCreditCard: true },
        cases: [
            {
                validation: { currentMarket: 'EU', isMastercard: true },
                resolve: { fee: 0.01 },
            },
            {
                validation: { currentCountry: 'NO' },
                cases: [
                    {
                        validation: { isVisa: true },
                        resolve: { availability: false },
                    },
                    {
                        validation: { isMastercard: true },
                    },
                ],
            },
            {
                validation: { currentCountry: 'SE', isMastercard: true },
                resolve: { fee: 0.02 },
            },
            {
                validation: { isMastercard: true },
                resolve: { fee: 0.03 },
            },
            {
                validation: { isVisa: true },
                resolve: { fee: 0.04 },
            },
        ],
        resolve: { fee: 0.05 },
    },
]

describe('Rule-Decision', () => {
    describe('decideOn - Simple structure', () => {
        it('should return the EU - Mastercard fee', () => {
            const result = decideOn(
                creditCardAcceptanceSimple,
                getValidators({
                    market: 'EU',
                    cardNumber: '3546367126490263',
                }),
            )
            expect(result.fee).to.equals(0.01)
        })

        it('should return the SE - Mastercard fee', () => {
            const result = decideOn(
                creditCardAcceptanceSimple,
                getValidators({
                    country: 'SE',
                    cardNumber: '3546367126490263',
                }),
            )
            expect(result.fee).to.equals(0.02)
        })

        it('should return the General Mastercard fee', () => {
            const result = decideOn(
                creditCardAcceptanceSimple,
                getValidators({
                    market: 'US',
                    cardNumber: '3546367126490263',
                }),
            )
            expect(result.fee).to.equals(0.03)
        })

        it('should return true if NO - Mastercard', () => {
            const result = decideOn(
                creditCardAcceptanceSimple,
                getValidators({
                    country: 'NO',
                    cardNumber: '3546367126490263',
                }),
            )
            expect(result).to.true
        })

        it('should return the NO - Visa as not available', () => {
            const result = decideOn(
                creditCardAcceptanceSimple,
                getValidators({
                    country: 'NO',
                    cardNumber: '3446367126490263',
                }),
            )
            expect(result.availability).to.false
        })

        it('should return the General Visa fee', () => {
            const result = decideOn(
                creditCardAcceptanceSimple,
                getValidators({
                    market: 'FI',
                    cardNumber: '3446367126490263',
                }),
            )
            expect(result.fee).to.equals(0.04)
        })

        it('should return the General Credit Card fee', () => {
            const result = decideOn(
                creditCardAcceptanceSimple,
                getValidators({
                    cardNumber: '3646367126490263',
                }),
            )
            expect(result.fee).to.equals(0.05)
        })
    })

    describe('decideOn - Structured structure', () => {
        it('should return the EU - Mastercard fee', () => {
            const result = decideOn(
                creditCardAcceptanceStructured,
                getValidators({
                    market: 'EU',
                    cardNumber: '3546367126490263',
                }),
            )
            expect(result.fee).to.equals(0.01)
        })

        it('should return the SE - Mastercard fee', () => {
            const result = decideOn(
                creditCardAcceptanceStructured,
                getValidators({
                    country: 'SE',
                    cardNumber: '3546367126490263',
                }),
            )
            expect(result.fee).to.equals(0.02)
        })

        it('should return the General Mastercard fee', () => {
            const result = decideOn(
                creditCardAcceptanceStructured,
                getValidators({
                    market: 'US',
                    cardNumber: '3546367126490263',
                }),
            )
            expect(result.fee).to.equals(0.03)
        })

        it('should return true if NO - Mastercard', () => {
            const result = decideOn(
                creditCardAcceptanceStructured,
                getValidators({
                    country: 'NO',
                    cardNumber: '3546367126490263',
                }),
            )
            expect(result).to.true
        })

        it('should return the NO - Visa as not available', () => {
            const result = decideOn(
                creditCardAcceptanceStructured,
                getValidators({
                    country: 'NO',
                    cardNumber: '3446367126490263',
                }),
            )
            expect(result.availability).to.false
        })

        it('should return the General Visa fee', () => {
            const result = decideOn(
                creditCardAcceptanceStructured,
                getValidators({
                    market: 'FI',
                    cardNumber: '3446367126490263',
                }),
            )
            expect(result.fee).to.equals(0.04)
        })

        it('should return the General Credit Card fee', () => {
            const result = decideOn(
                creditCardAcceptanceStructured,
                getValidators({
                    cardNumber: '3646367126490263',
                }),
            )
            expect(result.fee).to.equals(0.05)
        })
    })
})
