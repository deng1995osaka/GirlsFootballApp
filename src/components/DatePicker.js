import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  
} from 'react-native';
import { colors, typography, fonts } from '../styles/main';
import { wp, hp } from '../utils/responsive';
import { Picker } from '@react-native-picker/picker';

const DatePicker = ({ visible, onClose, onSelect, title }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState('skip'); // 默认选中"现在不填"

  const years = Array.from({ length: 25 }, (_, i) => (2025 - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const days = ['skip', ...Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))];

  const handleConfirm = () => {
    onSelect({
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.headerButton}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.headerButton}>确定</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={selectedYear}
              onValueChange={(value) => setSelectedYear(value)}
            >
              {years.map(year => (
                <Picker.Item key={year} label={`${year}年`} value={year} />
              ))}
            </Picker>
            
            <Picker
              style={styles.picker}
              selectedValue={selectedMonth}
              onValueChange={(value) => setSelectedMonth(value)}
            >
              {months.map(month => (
                <Picker.Item key={month} label={`${month}月`} value={month} />
              ))}
            </Picker>
            
            <Picker
              style={styles.picker}
              selectedValue={selectedDay}
              onValueChange={(value) => setSelectedDay(value)}
            >
              <Picker.Item label="现在不填" value="skip" />
              {days.slice(1).map(day => (
                <Picker.Item key={day} label={`${day}日`} value={day} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    paddingBottom: hp(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerButton: {
    fontSize: typography.size.base,
    color: colors.primary,
    fontFamily: fonts.pixel,
  },
  title: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontFamily: fonts.pixel,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    flex: 1,
    height: hp(25),
  }
});

export default DatePicker;