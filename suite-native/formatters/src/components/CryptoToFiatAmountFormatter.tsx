import { TextProps } from '@suite-native/atoms';
import { NetworkSymbol } from '@suite-common/wallet-config';

import { FormatterProps } from '../types';
import { useFiatFromCryptoValue } from '../hooks/useFiatFromCryptoValue';
import { FiatAmountFormatter } from './FiatAmountFormatter';

type CryptoToFiatAmountFormatterProps = FormatterProps<string | number | null> &
    TextProps & {
        network: NetworkSymbol;
        historicRate?: number;
        useHistoricRate?: boolean;
        isBalance?: boolean;
        isForcedDiscreetMode?: boolean;
    };

export const CryptoToFiatAmountFormatter = ({
    value,
    network,
    historicRate,
    useHistoricRate,
    isBalance = false,
    ...otherProps
}: CryptoToFiatAmountFormatterProps) => {
    const fiatValue = useFiatFromCryptoValue({
        network,
        historicRate,
        useHistoricRate,
        isBalance,
        cryptoValue: value ? value.toString() : null,
    });

    return <FiatAmountFormatter network={network} value={fiatValue} {...otherProps} />;
};
