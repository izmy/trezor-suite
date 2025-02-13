import { useSelector } from 'react-redux';

import { G } from '@mobily/ts-belt';

import { Icon } from '@suite-native/icons';
import { TokenDefinitionsRootState } from '@suite-common/token-definitions';
import { TransactionsRootState } from '@suite-common/wallet-core';
import { AccountKey } from '@suite-common/wallet-types';
import { Box, Text, VStack } from '@suite-native/atoms';
import { useTranslate } from '@suite-native/intl';

import { selectTransactionInputAndOutputTransfers, TransactionTranfer } from '../../selectors';
import { TransactionDetailInputsSheetSection } from './TransactionDetailInputsSheetSection';
import { TransactionDetailSheet } from './TransactionDetailSheet';

type TransactionDetailInputsSheetProps = {
    isVisible: boolean;
    txid: string;
    accountKey: AccountKey;
    onSheetVisibilityChange: () => void;
};

type InputsOutputsHeaderProps = {
    inputsCount: number;
    outputsCount: number;
};

const InputsOutputsHeader = ({ inputsCount, outputsCount }: InputsOutputsHeaderProps) => (
    <Box flexDirection="row" justifyContent="space-between" marginBottom="sp16">
        <Box flex={1} flexDirection="row" alignItems="center" paddingLeft="sp8">
            <Text variant="hint" color="textSubdued">
                Inputs · {inputsCount}
            </Text>
            <Box marginLeft="sp8">
                <Icon name="arrowLineDown" color="iconSubdued" size="medium" />
            </Box>
        </Box>

        <Box flex={1} flexDirection="row" alignItems="center" paddingLeft="sp24">
            <Text variant="hint" color="textSubdued">
                Outputs · {outputsCount}
            </Text>
            <Box marginLeft="sp8">
                <Icon name="arrowLineUp" color="iconSubdued" size="medium" />
            </Box>
        </Box>
    </Box>
);

const getTransactionInputsAndOutputsCount = (transfers: TransactionTranfer[]) =>
    transfers.reduce(
        (accumulator, { inputs, outputs }) => {
            accumulator.inputsCount += inputs.length;
            accumulator.outputsCount += outputs.length;

            return accumulator;
        },
        { inputsCount: 0, outputsCount: 0 },
    );

export const TransactionDetailInputsSheet = ({
    isVisible,
    onSheetVisibilityChange,
    txid,
    accountKey,
}: TransactionDetailInputsSheetProps) => {
    const { translate } = useTranslate();
    const transactionTransfers = useSelector(
        (state: TransactionsRootState & TokenDefinitionsRootState) =>
            selectTransactionInputAndOutputTransfers(state, txid, accountKey),
    );

    if (G.isNull(transactionTransfers)) return null;
    const { externalTransfers, internalTransfers, tokenTransfers } = transactionTransfers;
    const { inputsCount, outputsCount } = getTransactionInputsAndOutputsCount(externalTransfers);

    return (
        <TransactionDetailSheet
            isVisible={isVisible}
            onVisibilityChange={onSheetVisibilityChange}
            title={translate('transactions.detail.sheet.inputs')}
            iconName="swap"
            transactionId={txid}
        >
            <VStack>
                <TransactionDetailInputsSheetSection
                    header={
                        <InputsOutputsHeader
                            inputsCount={inputsCount}
                            outputsCount={outputsCount}
                        />
                    }
                    transfers={externalTransfers}
                />

                <TransactionDetailInputsSheetSection
                    header="Internal Transfers"
                    transfers={internalTransfers}
                />

                <TransactionDetailInputsSheetSection
                    header="Token Transfers"
                    transfers={tokenTransfers}
                />
            </VStack>
        </TransactionDetailSheet>
    );
};
