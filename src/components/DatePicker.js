import React, { useState, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView
} from 'react-native';
import AppText from '@components/AppText';
import { colors, typography, fonts } from '@styles/main';
import { normalize, wp, hp } from '@utils/responsive';
import BottomSheet from '@components/BottomSheet';

const DatePicker = ({ visible, onClose, onSelect, title }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState('skip'); // 默认选中"现在不填"

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // 年份最大为今年
  const years = Array.from({ length: 25 }, (_, i) => (currentYear - i).toString());
  // 月份：如果选今年，最大为本月，否则1-12
  const months = Array.from({ length: selectedYear == currentYear ? currentMonth : 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  // 日期：如果选今年本月，最大为今天，否则1-31
  const days = [
    'skip',
    ...Array.from({ length: (selectedYear == currentYear && selectedMonth == currentMonth) ? currentDay : 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  ];

  // 联动修正逻辑，防止越界
  useEffect(() => {
    // 月份越界
    if (selectedYear == currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
    // 日期越界
    if (
      selectedYear == currentYear &&
      selectedMonth == currentMonth &&
      selectedDay !== 'skip' &&
      Number(selectedDay) > currentDay
    ) {
      setSelectedDay(currentDay.toString().padStart(2, '0'));
    }
  }, [selectedYear, selectedMonth]);

  const handleConfirm = () => {
    onSelect({
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay
    });
    onClose();
  };

  const PickerItem = ({ label, selected, onPress }) => (
    <TouchableOpacity 
      style={[styles.pickerItem, selected && styles.pickerItemSelected]} 
      onPress={onPress}
    >
      <AppText style={[
        styles.pickerItemText,
        selected && styles.pickerItemTextSelected,
        /[0-9a-zA-Z]/.test(label) ? { fontFamily: fonts.pixel } : null
      ]}>
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <BottomSheet
      visible={visible}
      title={title}
      onClose={onClose}
   
      headerRight={
        <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
          <AppText style={styles.confirmButtonText}>确定</AppText>
        </TouchableOpacity>
      }
      contentStyle={styles.pickerContainer}
    >
      <View style={styles.pickerColumn}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {years.map(year => (
            <PickerItem
              key={year}
              label={`${year}年`}
              selected={selectedYear === year}
              onPress={() => setSelectedYear(year)}
            />
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.pickerColumn}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {months.map(month => (
            <PickerItem
              key={month}
              label={`${month}月`}
              selected={selectedMonth === month}
              onPress={() => setSelectedMonth(month)}
            />
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.pickerColumn}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <PickerItem
            key="skip"
            label="现在不填"
            selected={selectedDay === 'skip'}
            onPress={() => setSelectedDay('skip')}
          />
          {days.slice(1).map(day => (
            <PickerItem
              key={day}
              label={`${day}日`}
              selected={selectedDay === day}
              onPress={() => setSelectedDay(day)}
            />
          ))}
        </ScrollView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: 'row',
    height: hp(30),
  },
  pickerColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  pickerItem: {
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(2),
  },
  pickerItemSelected: {
    backgroundColor: colors.bgLight,
  },
  pickerItemText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  pickerItemTextSelected: {
    color: colors.primary,
  },
  confirmButton: {
    marginRight: 0,
  },
  confirmButtonText: {
    fontSize: typography.size.base,
    color: colors.primary,
    fontFamily: fonts.pixel,
  },
});

export default DatePicker;