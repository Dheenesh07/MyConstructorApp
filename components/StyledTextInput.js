import React from 'react';
import { TextInput } from 'react-native';

const StyledTextInput = ({ placeholderTextColor = '#999', ...props }) => {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  );
};

export default StyledTextInput;
