import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../theme';

export default function Input({
  placeholder,
  value,
  onChangeText,
  icon: Icon,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      {Icon && (
        <View style={styles.iconWrapper}>
          <Icon color={isFocused ? colors.primary : colors.textLight} size={18} />
        </View>
      )}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
          {/* Usar MaterialCommunityIcons para o toggle de senha */}
          {/* eslint-disable-next-line import/no-extraneous-dependencies */}
          {(() => {
            const { MaterialCommunityIcons } = require('@expo/vector-icons');
            return (
              <MaterialCommunityIcons
                name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textLight}
              />
            );
          })()}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: colors.white,
    gap: 12,
  },
  containerFocused: {
    borderColor: colors.primary,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.text,
  },
});
