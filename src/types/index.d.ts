export type Validator = () => boolean

export type ValidatorSet = Record<string, Validator>

export type ValueRangeType = {
    min?: number | bigint | string
    max?: number | bigint | string
}

export type RuleValidation = Record<string, unknown>

export type RuleCase = {
    active?: boolean
    validation: RuleValidation
    cases?: RuleCasesCollection
    resolve?: any
}

export type RuleCasesCollection = Array<RuleCase>

export type DecisionTakerOptions = {
    debug?: boolean
}
