import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, 
  TouchableOpacity, Modal, TextInput, Alert, Image, ActivityIndicator, ScrollView, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit2, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { bookingService } from '../services/api';

export default function ManageServicesScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [imageUrls, setImageUrls] = useState(''); // Chuỗi cách nhau bằng dấu phẩy
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await bookingService.getServices();
      setServices(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !price || !duration) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Chuyển chuỗi URL thành mảng, lọc bỏ khoảng trắng và chuỗi trống
    const urlArray = imageUrls.split(',').map(url => url.trim()).filter(url => url !== '');

    const data = {
      name,
      price: parseFloat(price),
      durationMinutes: parseInt(duration),
      imageUrl: urlArray,
      description
    };

    try {
      if (editingService) {
        await bookingService.updateService(editingService.id, data);
        Alert.alert('Thành công', 'Đã cập nhật dịch vụ');
      } else {
        await bookingService.createService(data);
        Alert.alert('Thành công', 'Đã thêm dịch vụ mới');
      }
      setModalVisible(false);
      fetchServices();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu dịch vụ');
    }
  };

  const handleDelete = (id) => {
    const performDelete = async () => {
      try {
        await bookingService.deleteService(id);
        fetchServices();
      } catch (error) {
        if (Platform.OS === 'web') {
          alert('Không thể xóa dịch vụ');
        } else {
          Alert.alert('Lỗi', 'Không thể xóa dịch vụ');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Bạn chắc chắn muốn xóa dịch vụ này?')) {
        performDelete();
      }
    } else {
      Alert.alert('Xác nhận', 'Bạn chắc chắn muốn xóa dịch vụ này?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const renderItem = ({ item }) => {
    // Lấy ảnh đầu tiên trong mảng
    const displayImg = (Array.isArray(item.imageUrl) && item.imageUrl.length > 0) 
      ? item.imageUrl[0] 
      : 'https://images.unsplash.com/photo-1599351431247-f577f5d38ed9?w=500';

    return (
      <View style={styles.serviceItem}>
        <Image source={{ uri: displayImg }} style={styles.serviceImg} />
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.servicePrice}>{parseInt(item.price).toLocaleString()}đ - {item.durationMinutes}phút</Text>
        </View>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {
            setEditingService(item);
            setName(item.name);
            setPrice(item.price.toString());
            setDuration(item.durationMinutes.toString());
            setImageUrls(Array.isArray(item.imageUrl) ? item.imageUrl.join(', ') : '');
            setDescription(item.description || '');
            setModalVisible(true);
          }}>
            <Edit2 size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
            <Trash2 size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Dịch vụ</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => {
            setEditingService(null);
            setName('');
            setPrice('');
            setDuration('');
            setImageUrls('');
            setDescription('');
            setModalVisible(true);
          }}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        />
      )}

      {/* Modal Add/Edit */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}</Text>
              
              <TextInput 
                style={styles.input} 
                placeholder="Tên dịch vụ" 
                value={name} 
                onChangeText={setName} 
              />
              <TextInput 
                style={styles.input} 
                placeholder="Mô tả dịch vụ" 
                value={description} 
                onChangeText={setDescription}
                multiline
              />
              <TextInput 
                style={styles.input} 
                placeholder="Giá tiền (VNĐ)" 
                keyboardType="numeric" 
                value={price} 
                onChangeText={setPrice} 
              />
              <TextInput 
                style={styles.input} 
                placeholder="Thời lượng (phút)" 
                keyboardType="numeric" 
                value={duration} 
                onChangeText={setDuration} 
              />
              <TextInput 
                style={[styles.input, { height: 100 }]} 
                placeholder="Link ảnh (Phân cách bằng dấu phẩy để tạo Album)" 
                value={imageUrls} 
                onChangeText={setImageUrls}
                multiline
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    paddingBottom: 15,
    backgroundColor: 'white' 
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  
  serviceItem: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 20, padding: 12, marginBottom: 16, alignItems: 'center', ...theme.shadows.soft },
  serviceImg: { width: 60, height: 60, borderRadius: 12 },
  serviceInfo: { flex: 1, marginLeft: 16 },
  serviceName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  servicePrice: { fontSize: 13, color: theme.colors.primary, marginTop: 4, fontWeight: '600' },
  actionGroup: { flexDirection: 'row' },
  iconBtn: { padding: 8, marginLeft: 8 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: 'white', borderRadius: 32, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 15, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { padding: 16, flex: 1, alignItems: 'center' },
  saveBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 16, flex: 1, alignItems: 'center' },
  cancelText: { color: theme.colors.textSecondary, fontWeight: '700' },
  saveText: { color: 'white', fontWeight: '800' }
});
