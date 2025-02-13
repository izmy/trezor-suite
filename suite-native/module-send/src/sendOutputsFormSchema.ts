import { G } from '@mobily/ts-belt';

import { BigNumber } from '@trezor/utils';
import { NetworkSymbol } from '@suite-common/wallet-config';
import { formatNetworkAmount, isAddressValid, isDecimalsValid } from '@suite-common/wallet-utils';
import { FeeInfo } from '@suite-common/wallet-types';
import { yup } from '@suite-common/validators';

import { FeeLevelsMaxAmount } from './types';

export type SendFormFormContext = {
    networkSymbol?: NetworkSymbol;
    availableBalance?: string;
    networkFeeInfo?: FeeInfo;
    isValueInSats?: boolean;
    isTokenFlow?: boolean;
    feeLevelsMaxAmount?: FeeLevelsMaxAmount;
    decimals?: number;
};

const isAmountDust = (amount: string, context?: SendFormFormContext) => {
    if (!amount || !context) {
        return false;
    }

    const { networkSymbol, networkFeeInfo, isValueInSats } = context;

    if (!networkSymbol || !networkFeeInfo) {
        return false;
    }

    const amountBigNumber = new BigNumber(amount);
    const rawDust = networkFeeInfo.dustLimit?.toString();

    const dustThreshold =
        rawDust && (isValueInSats ? rawDust : formatNetworkAmount(rawDust, networkSymbol));

    if (!dustThreshold) {
        return false;
    }

    return amountBigNumber.lt(dustThreshold);
};

const isAmountHigherThanBalance = (
    amount: string,
    isSendMaxEnabled: boolean,
    context?: SendFormFormContext,
) => {
    if (!amount || !context) {
        return false;
    }

    const { networkSymbol, networkFeeInfo, availableBalance, feeLevelsMaxAmount, isTokenFlow } =
        context;

    if (!networkSymbol || !networkFeeInfo || !availableBalance) {
        return false;
    }

    const amountBigNumber = new BigNumber(amount);
    if (isTokenFlow) {
        return amountBigNumber.gt(availableBalance);
    }

    const normalMaxAmount = feeLevelsMaxAmount?.normal;

    // if send max is enabled, user is allowed submit form even if there is enough balance only for economy fee.
    if (isSendMaxEnabled) {
        const lowestLevelMaxAmount = feeLevelsMaxAmount?.economy ?? normalMaxAmount;
        if (!lowestLevelMaxAmount) return true;

        return amountBigNumber.gt(lowestLevelMaxAmount);
    }

    return !normalMaxAmount || amountBigNumber.gt(normalMaxAmount);
};

// TODO: change error messages copy when is design ready
export const sendOutputsFormValidationSchema = yup.object({
    outputs: yup
        .array(
            yup.object({
                address: yup
                    .string()
                    .required()
                    .test(
                        'is-invalid-address',
                        'The address format is incorrect.',
                        (value, { options: { context } }: yup.TestContext<SendFormFormContext>) => {
                            const networkSymbol = context?.networkSymbol;

                            return (
                                G.isNotNullable(value) &&
                                G.isNotNullable(networkSymbol) &&
                                isAddressValid(value, networkSymbol)
                            );
                        },
                    ),
                amount: yup
                    .string()
                    .required('Amount is required.')
                    .matches(/^\d*\.?\d+$/, 'Invalid decimal value.')
                    .test(
                        'is-dust-amount',
                        'The value is lower than the dust limit.',
                        (value, { options: { context } }: yup.TestContext<SendFormFormContext>) => {
                            return !isAmountDust(value, context);
                        },
                    )
                    .test(
                        'is-higher-than-balance',
                        'You don’t have enough balance to send this amount.',
                        function (
                            value,
                            { options: { context } }: yup.TestContext<SendFormFormContext>,
                        ) {
                            const isSendMaxEnabled = G.isNotNullable(
                                this.from?.[1]?.value.setMaxOutputId,
                            );

                            return !isAmountHigherThanBalance(value, isSendMaxEnabled, context);
                        },
                    )
                    .test(
                        'too-many-decimals',
                        'Too many decimals.',
                        (value, { options: { context } }: yup.TestContext<SendFormFormContext>) => {
                            const { decimals = 8 } = context!;

                            return isDecimalsValid(value, decimals);
                        },
                    ),
                fiat: yup.string(),
                token: yup.string().required().nullable(),
                // TODO: other validations have to be added in the following PRs
                //       e.g. check if the amount is not higher than XRP reserve
            }),
        )
        .required(),
    setMaxOutputId: yup.number(),
});

export type SendOutputsFormValues = yup.InferType<typeof sendOutputsFormValidationSchema>;
export type SendOutputFieldName = keyof SendOutputsFormValues['outputs'][number];
