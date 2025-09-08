import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';

type Props = {
  values: string[]; // 表示する選択肢
  selected: string[]; // 選択中
  onToggle: (v: string) => void; // 押下で切替
  maxSelect?: number; // 上限（省略=無制限）
  wrap?: boolean; // 折返し（デフォルトtrue）
  style?: ViewStyle; // コンテナ追加スタイル
  chipStyle?: ViewStyle; // Chipの追加スタイル
  chipTextStyle?: TextStyle; // Chipテキストの追加スタイル
};

export const Chips: React.FC<Props> = ({
  values,
  selected,
  onToggle,
  maxSelect,
  wrap = true,
  style,
  chipStyle,
  chipTextStyle,
}) => {
  const canAddMore = (v: string) =>
    selected.includes(v) || maxSelect == null || selected.length < maxSelect;

  return (
    <View
      style={[
        { flexDirection: 'row', flexWrap: wrap ? 'wrap' : 'nowrap' },
        style,
      ]}
    >
      {values.map((v, i) => {
        const active = selected.includes(v);
        const disabled = !active && !canAddMore(v);
        return (
          <TouchableOpacity
            key={`${v}_${i}`}
            activeOpacity={0.8}
            onPress={() => !disabled && onToggle(v)}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled }}
            style={[
              {
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
                borderWidth: 1,
                marginRight: 8,
                marginBottom: 8,
                borderColor: active ? '#4f46e5' : '#d1d5db',
                backgroundColor: active ? '#4f46e5' : '#ffffff',
                opacity: disabled ? 0.5 : 1,
              },
              chipStyle,
            ]}
          >
            <Text
              style={[
                { color: active ? '#ffffff' : '#374151', fontSize: 14 },
                chipTextStyle,
              ]}
            >
              {v}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
