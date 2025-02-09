import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, SafeAreaView, FlatList } from 'react-native';
import SearchBar from './SearchBar';
import { capitalizeFirstLetterAllWords } from '../utils/Utils'

const { width } = Dimensions.get('window');
const getResponsiveSize = (percent) => (width * percent) / 100;

const FilterModal = ({
  searchQuery,           // Changed from searchValue
  onSearchChange,
  selectedEquipment,
  selectedBodyPart,
  onEquipmentChange,
  onBodyPartChange,
  equipmentOptions = [],
  bodyPartOptions = [],
  style
}) => {
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [bodyPartModalVisible, setBodyPartModalVisible] = useState(false);

  const renderListItem = (item, isSelected, onSelect) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        isSelected && styles.selectedListItem
      ]}
      onPress={() => onSelect(item)}
    >
      <Text style={[
        styles.listItemText,
        isSelected && styles.selectedListItemText
      ]}>
        {item === 'All Equipment' || item === 'All Body Parts'
          ? item
          : capitalizeFirstLetterAllWords(item)}
      </Text>
    </TouchableOpacity>
  );

  const ListModal = ({ visible, title, data, selectedValue, onSelect, onClose }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>

            <FlatList
              data={data}
              keyExtractor={(item) => item}
              renderItem={({ item }) =>
                renderListItem(item, item === selectedValue, (selected) => {
                  onSelect(selected);
                  onClose();
                })
              }
              style={styles.list}
            />

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={[styles.container, style]}>
      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search exercises"
      />

      <View style={styles.filterButtonsContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setEquipmentModalVisible(true)}
        >
          <Text style={styles.filterButtonText} numberOfLines={1} ellipsizeMode="tail">
            {selectedEquipment === 'All Equipment'
              ? selectedEquipment
              : capitalizeFirstLetterAllWords(selectedEquipment)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setBodyPartModalVisible(true)}
        >
          <Text style={styles.filterButtonText} numberOfLines={1} ellipsizeMode="tail">
            {selectedBodyPart === 'All Body Parts'
              ? selectedBodyPart
              : capitalizeFirstLetterAllWords(selectedBodyPart)}
          </Text>
        </TouchableOpacity>
      </View>

      <ListModal
        visible={equipmentModalVisible}
        title="Select Equipment"
        data={equipmentOptions}
        selectedValue={selectedEquipment}
        onSelect={onEquipmentChange}
        onClose={() => setEquipmentModalVisible(false)}
      />

      <ListModal
        visible={bodyPartModalVisible}
        title="Select Body Part"
        data={bodyPartOptions}
        selectedValue={selectedBodyPart}
        onSelect={onBodyPartChange}
        onClose={() => setBodyPartModalVisible(false)}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSize(4),
    marginTop: getResponsiveSize(-1),
    marginBottom: getResponsiveSize(2),
  },
  filterButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: getResponsiveSize(2),
    paddingVertical: getResponsiveSize(2.5),
    paddingHorizontal: getResponsiveSize(6),
    flex: 0.475,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonText: {
    color: '#FFF',
    fontSize: getResponsiveSize(3.8),
    textAlign: 'center',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(4),
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    width: '100%',
    padding: getResponsiveSize(4),
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: getResponsiveSize(4.5),
    fontWeight: 'bold',
    marginBottom: getResponsiveSize(4),
    textAlign: 'center',
  },
  list: {
    maxHeight: '80%',
    marginBottom: getResponsiveSize(4),
  },
  listItem: {
    paddingVertical: getResponsiveSize(3),
    paddingHorizontal: getResponsiveSize(4),
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedListItem: {
    backgroundColor: '#4C24FF',
  },
  listItemText: {
    color: '#FFF',
    fontSize: getResponsiveSize(3.8),
  },
  selectedListItemText: {
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: getResponsiveSize(3),
    borderRadius: getResponsiveSize(2),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#FFF',
    fontSize: getResponsiveSize(4),
    fontWeight: 'bold',
  },
});

export default React.memo(FilterModal);