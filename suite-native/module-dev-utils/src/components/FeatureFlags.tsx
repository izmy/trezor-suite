import { Box, Card, CheckBox, Text, VStack } from '@suite-native/atoms';
import { FeatureFlag as FeatureFlagEnum, useFeatureFlag } from '@suite-native/feature-flags';

const featureFlagsTitleMap = {
    [FeatureFlagEnum.IsDeviceConnectEnabled]: 'Connect device',
    [FeatureFlagEnum.IsBitcoinLikeSendEnabled]: 'Bitcoin-like coins send',
    [FeatureFlagEnum.IsEthereumSendEnabled]: 'Ethereum send',
    [FeatureFlagEnum.IsRegtestEnabled]: 'Regtest',
    [FeatureFlagEnum.IsPolygonEnabled]: 'Polygon',
    [FeatureFlagEnum.IsBscEnabled]: 'BNB Smart Chain',
    [FeatureFlagEnum.IsSolanaEnabled]: 'Solana',
    [FeatureFlagEnum.IsConnectPopupEnabled]: 'Connect Popup',
} as const satisfies Record<FeatureFlagEnum, string>;

const FeatureFlag = ({ featureFlag }: { featureFlag: FeatureFlagEnum }) => {
    const [value, setValue] = useFeatureFlag(featureFlag);

    return (
        <Box flexDirection="row" justifyContent="space-between">
            <Text>{featureFlagsTitleMap[featureFlag]}</Text>
            <CheckBox isChecked={value} onChange={setValue} />
        </Box>
    );
};

export const FeatureFlags = () => (
    <Card>
        <VStack spacing="sp8">
            <Text variant="titleSmall">Feature Flags</Text>
            <VStack>
                {Object.values(FeatureFlagEnum).map(featureFlag => (
                    <FeatureFlag key={featureFlag} featureFlag={featureFlag} />
                ))}
            </VStack>
        </VStack>
    </Card>
);
