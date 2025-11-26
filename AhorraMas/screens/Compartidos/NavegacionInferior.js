import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const BottomNavigation = ({ state, descriptors, navigation }) => {
  const tabs = [
    { id: 'Inicio', icon: 'Inicio', label: 'Inicio' },
    { id: 'Balance', icon: 'Balance', label: 'Balance' },
    { id: 'Transacciones', icon: 'Transacciones', label: 'Transacciones' },
    { id: 'Usuario', icon: 'Usuario', label: 'Usuario' },
  ];

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        const tab = tabs.find(t => t.id === route.name) || tabs[index];

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={[
              styles.tabItem,
              isFocused && styles.activeTabItem
            ]}
            onPress={onPress}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              isFocused && styles.activeTabLabel
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#4b5563',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  activeTabItem: {
    backgroundColor: '#6b7280',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    color: '#9ca3af',
    fontSize: 10,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: 'white',
  },
});

export default BottomNavigation;