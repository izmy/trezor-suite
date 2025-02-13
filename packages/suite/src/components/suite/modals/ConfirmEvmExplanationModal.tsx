import styled from 'styled-components';

import { Translation } from 'src/components/suite';
import { useDispatch, useSelector } from 'src/hooks/suite';
import { Image, NewModal, Paragraph } from '@trezor/components';
import { onCancel } from 'src/actions/suite/modalActions';
import { Account } from '@suite-common/wallet-types';
import { networks } from '@suite-common/wallet-config';
import { TranslationKey } from 'src/components/suite/Translation';
import { SUITE } from 'src/actions/suite/constants';
import { spacings } from '@trezor/theme';
import { CoinLogo } from '@trezor/product-components';

const ImageWrapper = styled.div`
    position: relative;
    width: 97.5%;
`;

const CoinLogoLeft = styled.div<{ $isETH: boolean }>`
    position: absolute;
    top: 20%;
    left: ${({ $isETH }) => ($isETH ? '6.75%' : '5.5%')};
`;

const CoinLogoRight = styled.div`
    position: absolute;
    top: 34%;
    right: 5.5%;
`;

export interface ConfirmNetworkExplanationModalProps {
    account: Account | undefined;
    route: 'wallet-receive' | 'wallet-send';
}

export const ConfirmEvmExplanationModal = ({
    account,
    route,
}: ConfirmNetworkExplanationModalProps) => {
    const dispatch = useDispatch();
    const close = () => {
        dispatch(onCancel());
        if (!account?.symbol) {
            return;
        }
        dispatch({
            type: SUITE.EVM_CONFIRM_EXPLANATION_MODAL,
            symbol: account?.symbol,
            route,
        });
    };
    const confirmExplanationModalClosed = useSelector(
        state => state.suite.evmSettings.confirmExplanationModalClosed,
    );

    if (!account) {
        return null;
    }

    const network = networks[account.symbol];
    const isVisible =
        account.empty &&
        network.networkType === 'ethereum' &&
        !confirmExplanationModalClosed[account.symbol]?.[route];

    if (!isVisible) {
        return null;
    }

    const titleTranslationsIds: Record<typeof route, TranslationKey> = {
        'wallet-receive': 'TR_CONFIRM_EVM_EXPLANATION_RECEIVE_TITLE',
        'wallet-send': 'TR_CONFIRM_EVM_EXPLANATION_SEND_TITLE',
    };

    const descriptionTranslationsIds: Record<typeof route, TranslationKey> = {
        'wallet-receive':
            account.symbol === 'eth'
                ? 'TR_CONFIRM_EVM_EXPLANATION_RECEIVE_DESCRIPTION_ETH'
                : 'TR_CONFIRM_EVM_EXPLANATION_RECEIVE_DESCRIPTION_OTHER',
        'wallet-send': 'TR_CONFIRM_EVM_EXPLANATION_SEND_DESCRIPTION',
    };

    return (
        <NewModal
            bottomContent={
                <NewModal.Button onClick={close}>
                    <Translation id="TR_CONFIRM" />
                </NewModal.Button>
            }
            size="small"
            heading={
                <Translation
                    id={titleTranslationsIds[route]}
                    values={{
                        network: network.name,
                    }}
                />
            }
        >
            <ImageWrapper>
                <Image
                    image={
                        account.symbol === 'eth'
                            ? 'CONFIRM_EVM_EXPLANATION_ETH'
                            : 'CONFIRM_EVM_EXPLANATION_OTHER'
                    }
                    width="100%"
                />
                <CoinLogoLeft $isETH={account.symbol === 'eth'}>
                    <CoinLogo size={80} symbol={account.symbol} />
                </CoinLogoLeft>
                {account.symbol !== 'eth' && (
                    <CoinLogoRight>
                        <CoinLogo size={80} symbol="eth" />
                    </CoinLogoRight>
                )}
            </ImageWrapper>
            <Paragraph variant="tertiary" typographyStyle="hint" margin={{ top: spacings.xl }}>
                <Translation
                    id={descriptionTranslationsIds[route]}
                    values={{
                        network: network.name,
                    }}
                />
            </Paragraph>
        </NewModal>
    );
};
