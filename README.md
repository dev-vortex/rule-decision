# Rule Decision Library
This library aims to provide an agnostic and reliable mechanism to decide the applicable value based on defined rules given at a specific moment.

## Installation
```
yarn add @dev-vortex/rule-decision
```

or

```
npm install @dev-vortex/rule-decision
```

## Rule definition
A rule `RuleCase` is composed by:

| Attribute | Description | Default |
|:---------:|:------------|:-------:|
|validation|Key/Value object where the key represents the validator name and the value is the expected value to validate||
|active|(Optional) boolean value, when `false` it will set the current case as inactive|undefined|
|cases|(optional) An array of `RuleCase` object type. This will set the sub-rules to be checked.|undefined|
|resolve|(optional) The return value in case the case is valid (if not defined the service will return true)|true|

## Validators
A validator is a callable function that will return the value to validate. 

The return value will be verified against the expected value set in the `rule.validation` object

## Quick Start
 1. Prepare the `validator` functions to provide them to the validation service function
 ```typescript
import type { ValidatorSet } from '@dev-vortex/rule-decision'

...

 const getValidators = (values: Record<string, any>): ValidatorSet => ({
    currentMarket: () => values.market || undefined,
    currentCountry: () => values.country || undefined,
    isCreditCard: () => values.cardNumber.indexOf('3') === 0,
    isMastercard: () => values.cardNumber.indexOf('35') === 0,
    isVisa: () => values.cardNumber.indexOf('34') === 0,
})
 ```

 2. Define youur rules
 ```typescript
import type { RuleCasesCollection } from '@dev-vortex/rule-decision'

...

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

 ```

 3. When needed, call the validation service providing the rule collection and the validator set.
```typescript
import { decideOn } from '@dev-vortex/rule-decision'

...

const decision = decideOn(
    creditCardAcceptanceSimple,
    getValidators({
        market: 'EU',
        cardNumber: '3546367126490263',
    }),
)
```

4. Check if the decision is valid (`true`) or just use the resolved value for the first found case.

## How to prepare/read the rule correction
The service will check your collection top to bottom and it will stop on the first successfully validated case. 

For this reason, the rule priority matters. and the returned value will either be the `resolve` value present in the `case` or the value `true` (showiing that a case was found).

Any case with `active` attribute as `false` will be ignored.

If sub-cases are present in a valiid parent-case, the service will follow and check them returning the `resolve` value from the validated rule/sub-case.

If the sub-case does not have a `resolve` value set, the service will return the parent `resolve` value or `true` if none exist.