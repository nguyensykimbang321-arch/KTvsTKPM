import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, 
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit2, Trash2, ArrowLeft, Layers } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { bookingService } from '../services/api';

export default function ManageCategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await bookingService.getCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!name) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên danh mục');
      return;
    }
    Alert.alert('Thành công', 'Đã lưu danh mục mới');
    setModalVisible(false);
    setName('');
  };

  const renderItem = ({ item }) => (
    <View style={styles.categoryCard}>
      <View style={styles.iconBox}>
        <Layers size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>ID: #{item.id}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Xóa', 'Xóa danh mục này có thể ảnh hưởng đến các dịch vụ liên kết. Bạn chắc chắn chứ?')}>
          <Trash2 size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Danh mục</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* Modal Add Category */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo danh mục mới</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Tên danh mục (vị dụ: Chăm sóc da)" 
              value={name} 
              onChangeText={setName} 
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  
  categoryCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12, alignItems: 'center', ...theme.shadows.soft },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  sub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  
  actions: { justifyContent: 'center' },
  actionBtn: { padding: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: 'white', borderRadius: 28, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#F1F5F9', height: 56, borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { padding: 16, flex: 1, alignItems: 'center' },
  saveBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 16, flex: 1, alignItems: 'center' },
  cancelText: { color: theme.colors.textSecondary, fontWeight: '600' },
  saveText: { color: 'white', fontWeight: '800' }
});
