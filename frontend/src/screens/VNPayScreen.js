import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCcw } from 'lucide-react-native';
import { theme } from '../theme/theme';

export default function VNPayScreen({ route, navigation }) {
  const { paymentUrl } = route.params;
  const [loading, setLoading] = useState(true);

  if (!paymentUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lỗi: Không tìm thấy đường dẫn thanh toán.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleNavigationStateChange = (navState) => {
    // Kiểm tra nếu URL chứa return URL từ backend và có mã phản hồi từ VNPAY
    if (navState.url.includes('vnpay_return') && navState.url.includes('vnp_ResponseCode')) {
      if (Platform.OS === 'web') {
        alert('Giao dịch đang được xử lý...');
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Thông báo', 'Giao dịch đang được xử lý...');
        setTimeout(() => {
          navigation.navigate('MainTabs');
        }, 2000);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán VNPAY</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.closeBtn}>
          <RefreshCcw color={theme.colors.text} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.webviewContainer}>
        {Platform.OS === 'web' ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text, marginTop: 16, textAlign: 'center' }}>
              Tab thanh toán VNPAY đã được mở!
            </Text>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center', marginBottom: 32 }}>
              Vui lòng hoàn tất thanh toán trên tab mới mở của VNPAY. Sau khi hoàn tất, hệ thống sẽ tự động cập nhật lịch hẹn của bạn.
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Quay lại trang chủ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: paymentUrl }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={theme.colors.primary} size="large" />
                <Text style={styles.loadingText}>Đang kết nối tới VNPAY...</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  closeBtn: { padding: 8 },
  webviewContainer: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  loadingText: { marginTop: 12, color: theme.colors.textSecondary, fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: theme.colors.error, marginBottom: 20, textAlign: 'center' },
  backBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: 'white', fontWeight: 'bold' }
});
