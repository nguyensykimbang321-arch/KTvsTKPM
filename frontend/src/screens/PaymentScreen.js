import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  ScrollView, Image, Platform, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CreditCard, Wallet, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { PremiumButton } from '../components/Common';
import { paymentService, bookingService } from '../services/api';

export default function PaymentScreen({ route, navigation }) {
  const { bookingData } = route.params || {};
  if (!bookingData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không tìm thấy thông tin đặt lịch</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ color: theme.colors.primary, marginTop: 10 }}>Quay lại</Text></TouchableOpacity>
      </View>
    );
  }
  const { service, slot, date, staff } = bookingData;
  const [method, setMethod] = useState('vnpay');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1. Tạo Booking thực tế trong Database
      const bookingPayload = {
        serviceId: service.id,
        staffId: staff.id,
        bookingDate: date, // Sử dụng ngày thực tế đã chọn
        startTime: slot + ':00',
        totalAmount: service.price,
        status: method === 'vnpay' ? 'draft' : 'pending' // Không ghi đè khung giờ nếu qua cổng VNPAY
      };

      const newBooking = await bookingService.create(bookingPayload);

      if (method === 'vnpay') {
        // 2. Nếu chọn VNPAY, khởi tạo thanh toán với ID thật
        const response = await paymentService.initiate(newBooking.id, 'vnpay');
        if (Platform.OS === 'web') {
          window.open(response.paymentUrl, '_blank');
          navigation.navigate('VNPay', { paymentUrl: response.paymentUrl });
        } else {
          navigation.navigate('VNPay', { paymentUrl: response.paymentUrl });
        }
      } else {
        // 3. Nếu chọn trả sau (COD)
        if (Platform.OS === 'web') {
          window.alert('Lịch đặt của bạn đã được ghi nhận (Thanh toán tại quầy). Bạn có thể xem lại trong Lịch sử.');
          navigation.navigate('MainTabs');
        } else {
          Alert.alert(
            'Thành công 🎉',
            'Lịch đặt của bạn đã được ghi nhận (Thanh toán tại quầy). Bạn có thể xem lại trong Lịch sử.',
            [{ text: 'Về trang chủ', onPress: () => navigation.navigate('MainTabs') }]
          );
        }
      }
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        window.alert(typeof error === 'string' ? error : 'Có lỗi xảy ra khi xử lý đơn hàng.');
      } else {
        Alert.alert('Lỗi', typeof error === 'string' ? error : 'Có lỗi xảy ra khi xử lý đơn hàng.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Quá trình đặt lịch</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Step Indicator */}
        <View style={styles.steps}>
          <View style={styles.stepActive}><CheckCircle2 color="white" size={14} /></View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepActive}><Text style={styles.stepNum}>2</Text></View>
        </View>

        {/* Invoice Card */}
        <View style={styles.invoice}>
          <View style={styles.invoiceHead}>
            <Text style={styles.invoiceTitle}>Chi tiết hóa đơn</Text>
            <ShieldCheck color={theme.colors.success} size={20} />
          </View>

          <View style={styles.invoiceItem}>
            <Text style={styles.label}>Dịch vụ</Text>
            <Text style={styles.value}>{service.name}</Text>
          </View>
          <View style={styles.invoiceItem}>
            <Text style={styles.label}>Thời gian</Text>
            <Text style={styles.value}>{slot}, {date}</Text>
          </View>

          <View style={styles.dash} />

          <View style={styles.invoiceItem}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{parseInt(service.price).toLocaleString()}đ</Text>
          </View>
        </View>

        {/* Methods */}
        <Text style={styles.sectionTitle}>Chọn phương thức trả phí</Text>

        <TouchableOpacity
          style={[styles.method, method === 'vnpay' && styles.methodActive]}
          onPress={() => setMethod('vnpay')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
            <Smartphone color={theme.colors.primary} size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.methodName}>VNPAY Gateway</Text>
            <Text style={styles.methodDesc}>ATM / QR Pay / E-Wallet</Text>
          </View>
          <View style={[styles.radio, method === 'vnpay' && styles.radioActive]}>
            {method === 'vnpay' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.method, method === 'cod' && styles.methodActive]}
          onPress={() => setMethod('cod')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
            <Wallet color="#F59E0B" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.methodName}>Thanh toán tại quầy</Text>
            <Text style={styles.methodDesc}>Tiền mặt hoặc thẻ POS</Text>
          </View>
          <View style={[styles.radio, method === 'cod' && styles.radioActive]}>
            {method === 'cod' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <View style={styles.secureNotice}>
          <ShieldCheck color={theme.colors.textSecondary} size={16} />
          <Text style={styles.noticeText}>Dữ liệu của bạn được mã hóa và bảo mật tuyệt đối</Text>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <PremiumButton
          title="Xác nhận & Hoàn tất"
          onPress={handlePayment}
          loading={loading}
          style={{ height: 60 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: theme.colors.text },

  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  stepActive: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  stepInactive: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  stepNum: { color: 'white', fontSize: 12, fontWeight: '800' },
  stepNumInactive: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '800' },
  stepLineActive: { flex: 0.2, height: 2, backgroundColor: theme.colors.primary },
  stepLine: { flex: 0.2, height: 2, backgroundColor: '#F1F5F9' },

  invoice: { backgroundColor: '#F8FAFC', borderRadius: 32, padding: 24, marginBottom: 40 },
  invoiceHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  invoiceTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  invoiceItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
  value: { fontSize: 14, color: theme.colors.text, fontWeight: '700' },
  dash: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12, borderStyle: 'dashed' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  totalValue: { fontSize: 20, fontWeight: '900', color: theme.colors.primary },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 24 },
  method: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 2, borderColor: '#F1F5F9', marginBottom: 16 },
  methodActive: { borderColor: theme.colors.primary, backgroundColor: '#EEF2FF' },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  methodName: { fontSize: 16, fontWeight: '800', color: theme.colors.text },
  methodDesc: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: theme.colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },

  secureNotice: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  noticeText: { marginLeft: 8, fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },
  footer: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 25 }
});
