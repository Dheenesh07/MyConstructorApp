import AppNavigator from "./navigation/AppNavigator";
import VendorTest from "./VendorTest";
import AttendanceTest from "./AttendanceTest";
import 'react-native-gesture-handler';

// Set to 'vendor', 'attendance', or false for normal app
const TESTING_MODE = false;

export default function App() {
  if (TESTING_MODE === 'vendor') {
    return <VendorTest />;
  }
  if (TESTING_MODE === 'attendance') {
    return <AttendanceTest />;
  }
  return <AppNavigator />;
}
