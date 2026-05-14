import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, Image, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator, Modal, TextInput 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, Clock, Save, Image as ImageIcon, Lock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme/theme';
import BottomNav from '../components/BottomNav';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  
  // Edit Profile State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedAvatar, setEditedAvatar] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserData(user);
        setEditedName(user.fullName || '');
        setEditedPhone(user.phone || '');
        setEditedEmail(user.email || '');
        setEditedAvatar(user.avatar || 'https://i.pravatar.cc/150?u=customer');
        setIsAdmin(user.role === 'admin');
        setIsStaff(user.role === 'staff');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editedName || !editedEmail) {
      Alert.alert('Lỗi', 'Họ tên và Email không được để trống');
      return;
    }
    const updatedUser = { 
      ...userData, 
      fullName: editedName, 
      phone: editedPhone,
      email: editedEmail,
      avatar: editedAvatar
    };
    if (newPassword) {
      Alert.alert('Thông báo', 'Mật khẩu đã được đổi thành công');
      setNewPassword('');
    }
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    setUserData(updatedUser);
    setEditModalVisible(false);
    Alert.alert('Thành công', 'Thông tin đã được cập nhật');
  };

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn thoát?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.replace('Login');
        }
      }
    ]);
  };

  const getMenuItems = () => {
    const baseMenu = [
      { id: '1', icon: User, title: 'Thông tin cá nhân', action: () => setEditModalVisible(true) },
    ];
    if (isAdmin) baseMenu.push({ id: 'admin', icon: Shield, title: 'Quản trị hệ thống', action: () => navigation.navigate('AdminDashboard') });
    if (isStaff || isAdmin) baseMenu.push({ id: 'staff', icon: Clock, title: 'Nhiệm vụ nhân viên', action: () => navigation.navigate('StaffDashboard') });
    baseMenu.push(
      { id: '3', icon: Bell, title: 'Cài đặt thông báo', action: () => Alert.alert('Thông báo', 'Đã bật thông báo đẩy') }
    );
    return baseMenu;
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={styles.header}>
          <Image source={{ uri: userData?.avatar || 'https://i.pravatar.cc/150?u=customer' }} style={styles.avatar} />
          <Text style={styles.userName}>{userData?.fullName || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'email@example.com'}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditModalVisible(true)}>
            <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          {getMenuItems().map(item => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.action}>
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}><item.icon color={theme.colors.primary} size={20} /></View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <ChevronRight color={theme.colors.textMuted} size={20} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuItem, { marginTop: 10 }]} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}><LogOut color={theme.colors.error} size={20} /></View>
              <Text style={[styles.menuTitle, { color: theme.colors.error }]}>Đăng xuất</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Advanced Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cập nhật tài khoản</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}><ImageIcon size={14} /> Link Avatar (URL)</Text>
                <TextInput style={styles.input} value={editedAvatar} onChangeText={setEditedAvatar} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}><User size={14} /> Họ và tên</Text>
                <TextInput style={styles.input} value={editedName} onChangeText={setEditedName} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gmail (Email)</Text>
                <TextInput style={styles.input} value={editedEmail} onChangeText={setEditedEmail} keyboardType="email-address" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput style={styles.input} value={editedPhone} onChangeText={setEditedPhone} keyboardType="phone-pad" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, {color: theme.colors.primary}]}><Lock size={14} /> Mật khẩu mới</Text>
                <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="********" />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}><Text style={styles.cancelText}>Hủy</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile}>
                  <Text style={styles.saveText}>Lưu tất cả</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 40, backgroundColor: 'white' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, borderWidth: 4, borderColor: '#EEF2FF' },
  userName: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  userEmail: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  editBtn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, backgroundColor: '#EEF2FF' },
  editBtnText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },
  menuContainer: { marginTop: 10, paddingHorizontal: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, backgroundColor: 'white', paddingHorizontal: 16, borderRadius: 20, marginBottom: 12, ...theme.shadows.soft },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingBottom: 50 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: theme.colors.text, marginBottom: 24, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#F1F5F9', height: 48, borderRadius: 14, paddingHorizontal: 16, fontSize: 14, color: theme.colors.text },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cancelBtn: { flex: 1, height: 50, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { flex: 2, height: 50, backgroundColor: theme.colors.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: theme.colors.textSecondary, fontWeight: '700' },
  saveText: { color: 'white', fontWeight: '800' }
});
