import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  colors: any;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  colors,
}: PaginationProps) {
  return (
    <View style={[styles.paginationInfo, { borderTopColor: colors.separator }]}>
      <View style={styles.paginationControls}>
        <TouchableOpacity 
          style={[
            styles.pageButton, 
            currentPage === 1 && styles.pageButtonDisabled
          ]}
          onPress={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <Ionicons 
            name="chevron-back-outline" 
            size={20} 
            color={currentPage === 1 ? colors.gray : colors.text} 
          />
          <Ionicons 
            name="chevron-back-outline" 
            size={20} 
            color={currentPage === 1 ? colors.gray : colors.text} 
            style={styles.secondIcon} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.pageButton,
            currentPage === 1 && styles.pageButtonDisabled
          ]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons 
            name="chevron-back-outline" 
            size={20} 
            color={currentPage === 1 ? colors.gray : colors.text} 
          />
        </TouchableOpacity>

        <View style={styles.pageNumberContainer}>
          <Text style={[styles.currentPage, { color: colors.text }]}>
            {currentPage}
          </Text>
          <Text style={[styles.paginationText, { color: colors.gray }]}> / </Text>
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                'Chọn trang',
                '',
                Array.from({ length: totalPages }, (_, i) => ({
                  text: `Trang ${i + 1}`,
                  onPress: () => onPageChange(i + 1)
                })).concat([
                  { text: 'Hủy', style: 'cancel' }
                ])
              );
            }}
          >
            <Text style={[styles.totalPages, { color: colors.primary }]}>
              {totalPages}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.pageButton,
            currentPage === totalPages && styles.pageButtonDisabled
          ]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons 
            name="chevron-forward-outline" 
            size={20} 
            color={currentPage === totalPages ? colors.gray : colors.text} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.pageButton,
            currentPage === totalPages && styles.pageButtonDisabled
          ]}
          onPress={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <Ionicons 
            name="chevron-forward-outline" 
            size={20} 
            color={currentPage === totalPages ? colors.gray : colors.text} 
          />
          <Ionicons 
            name="chevron-forward-outline" 
            size={20} 
            color={currentPage === totalPages ? colors.gray : colors.text} 
            style={styles.secondIcon} 
          />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.paginationText, { color: colors.gray }]}>
        {`Tổng ${totalItems} mục`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  secondIcon: {
    marginLeft: -12,
  },
  pageNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  currentPage: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalPages: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  paginationText: {
    fontSize: 14,
  },
}); 