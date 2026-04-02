import type { ComponentType } from 'react';
import { Platform } from 'react-native';

import type { DateInputProps } from './DateInput.types';

const NativeModule = require('./DateInput.native') as {
  DateInput: ComponentType<DateInputProps>;
};
const WebModule = require('./DateInput.web') as {
  DateInput: ComponentType<DateInputProps>;
};

const DateInputImpl = Platform.OS === 'web' ? WebModule.DateInput : NativeModule.DateInput;

export function DateInput(props: DateInputProps) {
  return <DateInputImpl {...props} />;
}
