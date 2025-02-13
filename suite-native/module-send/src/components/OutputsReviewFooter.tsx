import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Animated, { SlideInDown } from 'react-native-reanimated';

import { useAtomValue } from 'jotai';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { isFulfilled } from '@reduxjs/toolkit';

import {
    AccountsRootState,
    selectAccountByKey,
    selectSendFormDraftByKey,
    SendRootState,
} from '@suite-common/wallet-core';
import { AccountKey, TokenAddress } from '@suite-common/wallet-types';
import { Button } from '@suite-native/atoms';
import { RootStackRoutes, AppTabsRoutes, RootStackParamList } from '@suite-native/navigation';
import { Translation } from '@suite-native/intl';
import { prepareNativeStyle, useNativeStyles } from '@trezor/styles';
import { analytics, EventType } from '@suite-native/analytics';

import { SendConfirmOnDeviceImage } from '../components/SendConfirmOnDeviceImage';
import { sendTransactionAndCleanupSendFormThunk } from '../sendFormThunks';
import { wasAppLeftDuringReviewAtom } from '../atoms/wasAppLeftDuringReviewAtom';
import { selectIsTransactionAlreadySigned } from '../selectors';

const navigateToAccountDetail = ({
    accountKey,
    tokenContract,
    txid,
}: RootStackParamList[RootStackRoutes.TransactionDetail]) =>
    // Reset navigation stack to the account detail screen with HomeStack as a previous step, so the user can navigate back there.
    CommonActions.reset({
        index: 1,
        routes: [
            {
                name: RootStackRoutes.AppTabs,
                params: {
                    screen: AppTabsRoutes.HomeStack,
                },
            },
            {
                name: RootStackRoutes.AccountDetail,
                params: {
                    accountKey,
                    tokenContract,
                },
            },
            {
                name: RootStackRoutes.TransactionDetail,
                params: {
                    accountKey,
                    tokenContract,
                    txid,
                    closeActionType: 'close',
                },
            },
        ],
    });

const footerStyle = prepareNativeStyle(utils => ({
    width: '100%',
    paddingHorizontal: utils.spacings.sp16,
}));

export const OutputsReviewFooter = ({
    accountKey,
    tokenContract,
}: {
    accountKey: AccountKey;
    tokenContract?: TokenAddress;
}) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { applyStyle } = useNativeStyles();
    const [isSendInProgress, setIsSendInProgress] = useState(false);
    const wasAppLeftDuringReview = useAtomValue(wasAppLeftDuringReviewAtom);

    const account = useSelector((state: AccountsRootState) =>
        selectAccountByKey(state, accountKey),
    );
    const isTransactionAlreadySigned = useSelector(selectIsTransactionAlreadySigned);

    const formValues = useSelector((state: SendRootState) =>
        selectSendFormDraftByKey(state, accountKey, tokenContract),
    );

    {
        /* TODO: improve the illustration: https://github.com/trezor/trezor-suite/issues/13965 */
    }
    if (!isTransactionAlreadySigned || !account) return <SendConfirmOnDeviceImage />;

    const handleSendTransaction = async () => {
        setIsSendInProgress(true);

        const sendResponse = await dispatch(sendTransactionAndCleanupSendFormThunk({ account }));

        if (isFulfilled(sendResponse)) {
            const { txid } = sendResponse.payload;

            if (formValues) {
                analytics.report({
                    type: EventType.SendTransactionDispatched,
                    payload: {
                        symbol: account.symbol,
                        outputsCount: formValues.outputs.length,
                        selectedFee: formValues.selectedFee ?? 'normal',
                        wasAppLeftDuringReview,
                    },
                });
            }

            navigation.dispatch(
                navigateToAccountDetail({
                    accountKey,
                    tokenContract,
                    txid,
                }),
            );
        }
    };

    return (
        <Animated.View style={applyStyle(footerStyle)} entering={SlideInDown}>
            <Button
                isLoading={isSendInProgress}
                accessibilityRole="button"
                accessibilityLabel="validate send form"
                testID="@send/send-transaction-button"
                onPress={handleSendTransaction}
            >
                <Translation id="moduleSend.review.outputs.submitButton" />
            </Button>
        </Animated.View>
    );
};
