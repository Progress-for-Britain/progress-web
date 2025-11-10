import React, { memo, useMemo } from 'react';
import { View, Text, TextInput } from 'react-native';
import { getVolunteerFormStyles } from '../../util/volunteerFormStyles';
import { getColors, getCommonStyles } from '../../util/commonStyles';
import { useTheme } from '../../util/theme-context';
import useResponsive from '../../util/useResponsive';

interface PersonalInfoFieldsProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    constituency: string;
  };
  onUpdateField: (field: string, value: string) => void;
}

export const PersonalInfoFields = memo(({ formData, onUpdateField }: PersonalInfoFieldsProps) => {
  const { isDark } = useTheme();
  const { isMobile, width } = useResponsive();
  const colors = getColors(isDark);
  const commonStyles = getCommonStyles(isDark, isMobile, width);
  const styles = getVolunteerFormStyles(colors, isMobile, width);

  // Memoize field configurations to prevent recreation
  const fieldConfigs = useMemo(() => [
    { 
      key: 'firstName', 
      label: 'First Name *', 
      placeholder: 'Enter your first name',
      autoCapitalize: 'words' as const,
      keyboardType: 'default' as const
    },
    { 
      key: 'lastName', 
      label: 'Last Name *', 
      placeholder: 'Enter your last name',
      autoCapitalize: 'words' as const,
      keyboardType: 'default' as const
    },
    { 
      key: 'email', 
      label: 'Email Address *', 
      placeholder: 'Enter your email address',
      autoCapitalize: 'none' as const,
      keyboardType: 'email-address' as const,
      fullWidth: true
    },
    { 
      key: 'phone', 
      label: 'Phone Number', 
      placeholder: '07XXX XXXXXX',
      keyboardType: 'phone-pad' as const
    },
    { 
      key: 'constituency', 
      label: 'Constituency *', 
      placeholder: 'e.g. Manchester Central',
      autoCapitalize: 'words' as const,
      keyboardType: 'default' as const
    },
  ], []);

  const renderField = (config: typeof fieldConfigs[0]) => (
    <View 
      key={config.key} 
      style={config.fullWidth ? { marginBottom: 20 } : commonStyles.formField}
    >
      <Text style={styles.inputLabel}>
        {config.label}
      </Text>
      <TextInput
        value={formData[config.key as keyof typeof formData]}
        onChangeText={(value) => onUpdateField(config.key, value)}
        placeholder={config.placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={config.keyboardType}
        autoCapitalize={config.autoCapitalize}
        style={styles.textInput}
      />
    </View>
  );

  return (
    <>
      {/* Name fields in a row */}
      <View style={[commonStyles.formRow, { marginBottom: 24 }]}>
        {fieldConfigs.slice(0, 2).map(renderField)}
      </View>
      
      {/* Email full width */}
      <View style={{ marginBottom: 24 }}>
        {renderField(fieldConfigs[2])}
      </View>
      
      {/* Phone and Constituency in a row */}
      <View style={[commonStyles.formRowLarge, { marginBottom: 8 }]}>
        {fieldConfigs.slice(3, 5).map(renderField)}
      </View>
    </>
  );
});

PersonalInfoFields.displayName = 'PersonalInfoFields';