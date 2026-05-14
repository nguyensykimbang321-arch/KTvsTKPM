import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Home, Clock, User } from 'lucide-react-native';
import { theme } from '../theme/theme';

export default function BottomNav({ state, descriptors, navigation }) {
  const tabs = [
    { name: 'Home', icon: Home, label: 'Trang chủ' },
    { name: 'History', icon: Clock, label: 'Lịch sử' },
    { name: 'Profile', icon: User, label: 'Hồ sơ' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab, index) => {
          const isActive = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[index].key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TouchableOpacity 
              key={tab.name}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconBg]}>
                <tab.icon 
                  size={isActive ? 26 : 22} 
                  color={isActive ? theme.colors.primary : theme.colors.textMuted} 
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    height: 70,
    ...theme.shadows.medium,
    paddingHorizontal: 10,
    elevation: 10, // Đảm bảo nổi bật trên Android
  },
  navBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconBg: {
    backgroundColor: '#EEF2FF',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  activeLabel: {
    color: theme.colors.primary,
    fontWeight: '800',
  }
});
