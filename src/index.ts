import {
    RuleCasesCollection,
    ValidatorSet,
    RuleCase,
    RuleValidation,
} from '~/types'

const checkValidation = (
    validation: RuleValidation,
    validators: ValidatorSet,
) => {
    let result = true
    Object.keys(validation).forEach(validator => {
        if (
            !validators[validator] ||
            validators[validator]() !== validation[validator]
        ) {
            result = false
        }
    })
    return result
}

const isRuleActive = (rule: RuleCase) => rule.active !== false

const checkRule = (rule: RuleCase, validators: ValidatorSet): any => {
    if (isRuleActive(rule) && checkValidation(rule.validation, validators)) {
        const childResult = rule.cases
            ? checkRules(rule.cases, validators)
            : false
        return childResult || rule.resolve || true
    }
    return false
}

const checkRules = (rules: RuleCasesCollection, validators: ValidatorSet) => {
    for (const rule in rules) {
        const result = checkRule(rules[rule], validators)
        if (result !== false) {
            return result
        }
    }
    return false
}

export const decideOn = (rules: RuleCase[], validators: ValidatorSet): any => {
    return checkRules(rules, validators)
}
