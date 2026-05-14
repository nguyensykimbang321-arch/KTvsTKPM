import { StyleSheet, TouchableOpacity, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

export const PremiumButton = ({ title, onPress, icon: Icon, secondary, style, loading }) => (
  <TouchableOpacity 
    activeOpacity={0.8}
    onPress={onPress}
    disabled={loading}
    style={[styles.btnWrapper, style, loading && { opacity: 0.7 }]}
  >
    <LinearGradient
      colors={secondary ? theme.colors.gradients.premium : theme.colors.gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          {Icon && <Icon color="white" size={20} style={{ marginRight: 8 }} />}
          <Text style={styles.btnText}>{title}</Text>
        </>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

export const GlassInput = ({ icon: Icon, placeholder, value, onChangeText, secureTextEntry }) => (
  <View style={styles.glassInputWrapper}>
    {Icon && <Icon color={theme.colors.textSecondary} size={20} style={{ marginRight: 12 }} />}
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={!!secureTextEntry}
    />
  </View>
);

const styles = StyleSheet.create({
  btnWrapper: {
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.premium,
  },
  gradient: {
    height: 56,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  glassInputWrapper: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  }
});
