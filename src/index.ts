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

const checkRule = (rule: RuleCase, validators: ValidatorSet): any => {
    if (rule.active === false) {
        return false
    }
    if (checkValidation(rule.validation, validators) === false) {
        return false
    }
    if (rule.cases) {
        const childResult = checkRules(rule.cases, validators)
        return childResult === false && rule.resolve
            ? rule.resolve
            : childResult
    } else {
        if (rule.resolve) {
            return rule.resolve
        }
    }
    return true
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
