import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, Image, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Fingerprint } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { PremiumButton, GlassInput } from '../components/Common';
import { authService } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('customer@a.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await authService.login({ email, password });
      navigation.replace('MainTabs');
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi đăng nhập', 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#EEF2FF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      
      {/* Decorative Orbs */}
      <View style={[styles.orb, { top: -50, left: -50, backgroundColor: '#818CF8' }]} />
      <View style={[styles.orb, { bottom: 100, right: -50, backgroundColor: '#F472B6', opacity: 0.2 }]} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
          enabled={Platform.OS === 'ios'}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                <LinearGradient colors={theme.colors.gradients.primary} style={styles.logoIcon}>
                  <Lock color="white" size={28} />
                </LinearGradient>
              </View>
              <Text style={styles.brandTitle}>Booking Pro</Text>
              <Text style={styles.brandSubtitle}>Trải nghiệm đặt lịch thế hệ mới</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Chào mừng trở lại!</Text>
              
              <GlassInput 
                icon={Mail} 
                placeholder="Email của bạn" 
                value={email}
                onChangeText={setEmail}
              />
              
              <GlassInput 
                icon={Lock} 
                placeholder="Mật khẩu" 
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />

              <TouchableOpacity style={styles.forgotPass} onPress={() => Alert.alert('Khôi phục', 'Vui lòng kiểm tra email để lấy lại mật khẩu')}>
                <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              <PremiumButton 
                title="Đăng nhập" 
                onPress={handleLogin} 
                loading={loading}
                style={{ marginTop: 10 }}
              />

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>Hoặc đăng nhập nhanh</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity 
                  style={styles.socialBtn}
                  onPress={() => Alert.alert('Biometric', 'Vui lòng xác thực bằng Vân tay/Khuôn mặt')}
                >
                  <Fingerprint color={theme.colors.primary} size={28} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Bạn chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpText}>Tham gia ngay</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContent: { padding: 32, flexGrow: 1, justifyContent: 'center' },
  orb: { position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.1 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBadge: { marginBottom: 16, ...theme.shadows.soft },
  logoIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  brandTitle: { fontSize: 28, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },
  brandSubtitle: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 4 },
  
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...theme.shadows.soft,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 24, color: theme.colors.text },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPassText: { color: theme.colors.primary, fontWeight: '600', fontSize: 13 },
  
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: theme.colors.textMuted },
  
  socialRow: { alignItems: 'center' },
  socialBtn: { 
    width: 64, height: 64, borderRadius: 32, 
    backgroundColor: '#EEF2FF', justifyContent: 'center', 
    alignItems: 'center', borderWidth: 1, borderColor: '#C7D2FE' 
  },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: theme.colors.textSecondary, fontSize: 14 },
  signUpText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 }
});
