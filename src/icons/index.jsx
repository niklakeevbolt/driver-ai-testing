import AlertIcon from '../vendor/kalep-icons/Alert.js'
import ArrowBackIcon from '../vendor/kalep-icons/ArrowBack.js'
import ArrowBackwardIcon from '../vendor/kalep-icons/ArrowBackward.js'
import ArrowForwardIcon from '../vendor/kalep-icons/ArrowForward.js'
import AudioRecordingIcon from '../vendor/kalep-icons/AudioRecording.js'
import BurgerIcon from '../vendor/kalep-icons/Burger.js'
import BusinessIcon from '../vendor/kalep-icons/Business.js'
import CalendarIcon from '../vendor/kalep-icons/Calendar.js'
import CalendarOutlinedIcon from '../vendor/kalep-icons/CalendarOutlined.js'
import CallIcon from '../vendor/kalep-icons/Call.js'
import CardIcon from '../vendor/kalep-icons/Card.js'
import CashDriverIcon from '../vendor/kalep-icons/CashDriver.js'
import CashOutlinedIcon from '../vendor/kalep-icons/CashOutlined.js'
import CheckIcon from '../vendor/kalep-icons/Check.js'
import ChevronRightIcon from '../vendor/kalep-icons/ChevronRight.js'
import ClearIcon from '../vendor/kalep-icons/Clear.js'
import CoffeeBreakIcon from '../vendor/kalep-icons/CoffeeBreak.js'
import CommentIcon from '../vendor/kalep-icons/Comment.js'
import CompassIcon from '../vendor/kalep-icons/Compass.js'
import DoubleCheckIcon from '../vendor/kalep-icons/DoubleCheck.js'
import EditIcon from '../vendor/kalep-icons/Edit.js'
import FiltersIcon from '../vendor/kalep-icons/Filters.js'
import GiftOutlinedIcon from '../vendor/kalep-icons/GiftOutlined.js'
import HideIcon from '../vendor/kalep-icons/Hide.js'
import HomeIcon from '../vendor/kalep-icons/Home.js'
import InboxIcon from '../vendor/kalep-icons/Inbox.js'
import LightbulbIcon from '../vendor/kalep-icons/Lightbulb.js'
import LogOutIcon from '../vendor/kalep-icons/LogOut.js'
import MapIcon from '../vendor/kalep-icons/Map.js'
import MapDestinationIcon from '../vendor/kalep-icons/MapDestination.js'
import MinusIcon from '../vendor/kalep-icons/Minus.js'
import MoreAndroidIcon from '../vendor/kalep-icons/MoreAndroid.js'
import PackageIcon from '../vendor/kalep-icons/Package.js'
import PinAltIcon from '../vendor/kalep-icons/PinAlt.js'
import PlusIcon from '../vendor/kalep-icons/Plus.js'
import RouteIcon from '../vendor/kalep-icons/Route.js'
import SafetyShieldIcon from '../vendor/kalep-icons/SafetyShield.js'
import SearchIcon from '../vendor/kalep-icons/Search.js'
import SendIcon from '../vendor/kalep-icons/Send.js'
import SettingsIcon from '../vendor/kalep-icons/Settings.js'
import SettingsOutlinedIcon from '../vendor/kalep-icons/SettingsOutlined.js'
import ShareIosIcon from '../vendor/kalep-icons/ShareIos.js'
import StarIcon from '../vendor/kalep-icons/Star.js'
import StopIcon from '../vendor/kalep-icons/Stop.js'
import SupportIcon from '../vendor/kalep-icons/Support.js'
import SurgeIcon from '../vendor/kalep-icons/Surge.js'
import TimeIcon from '../vendor/kalep-icons/Time.js'
import TimeOutlinedIcon from '../vendor/kalep-icons/TimeOutlined.js'
import UserIcon from '../vendor/kalep-icons/User.js'
import UserAltIcon from '../vendor/kalep-icons/UserAlt.js'
import UserOutlinedIcon from '../vendor/kalep-icons/UserOutlined.js'
import VehicleIcon from '../vendor/kalep-icons/Vehicle.js'

/** React 19 passes ref as a prop; never forward it to SVG DOM nodes. */
function wrapKalepIcon(VendorIcon) {
  function KalepIcon({ size, ref: _ref, ...props }) {
    return VendorIcon({ size, ...props })
  }
  KalepIcon.displayName = VendorIcon.name || 'KalepIcon'
  return KalepIcon
}

export const Alert = wrapKalepIcon(AlertIcon)
export const ArrowBack = wrapKalepIcon(ArrowBackIcon)
export const ArrowBackward = wrapKalepIcon(ArrowBackwardIcon)
export const ArrowForward = wrapKalepIcon(ArrowForwardIcon)
export const AudioRecording = wrapKalepIcon(AudioRecordingIcon)
export const Burger = wrapKalepIcon(BurgerIcon)
export const Business = wrapKalepIcon(BusinessIcon)
export const Calendar = wrapKalepIcon(CalendarIcon)
export const CalendarOutlined = wrapKalepIcon(CalendarOutlinedIcon)
export const Call = wrapKalepIcon(CallIcon)
export const Card = wrapKalepIcon(CardIcon)
export const CashDriver = wrapKalepIcon(CashDriverIcon)
export const CashOutlined = wrapKalepIcon(CashOutlinedIcon)
export const Check = wrapKalepIcon(CheckIcon)
export const ChevronRight = wrapKalepIcon(ChevronRightIcon)
export const Clear = wrapKalepIcon(ClearIcon)
export const CoffeeBreak = wrapKalepIcon(CoffeeBreakIcon)
export const Comment = wrapKalepIcon(CommentIcon)
export const Compass = wrapKalepIcon(CompassIcon)
export const DoubleCheck = wrapKalepIcon(DoubleCheckIcon)
export const Edit = wrapKalepIcon(EditIcon)
export const Filters = wrapKalepIcon(FiltersIcon)
export const GiftOutlined = wrapKalepIcon(GiftOutlinedIcon)
export const Hide = wrapKalepIcon(HideIcon)
export const Home = wrapKalepIcon(HomeIcon)
export const Inbox = wrapKalepIcon(InboxIcon)
export const Lightbulb = wrapKalepIcon(LightbulbIcon)
export const LogOut = wrapKalepIcon(LogOutIcon)
export const Map = wrapKalepIcon(MapIcon)
export const MapDestination = wrapKalepIcon(MapDestinationIcon)
export const Minus = wrapKalepIcon(MinusIcon)
export const MoreAndroid = wrapKalepIcon(MoreAndroidIcon)
export const Package = wrapKalepIcon(PackageIcon)
export const PinAlt = wrapKalepIcon(PinAltIcon)
export const Plus = wrapKalepIcon(PlusIcon)
export const Route = wrapKalepIcon(RouteIcon)
export const SafetyShield = wrapKalepIcon(SafetyShieldIcon)
export const Search = wrapKalepIcon(SearchIcon)
export const Send = wrapKalepIcon(SendIcon)
export const Settings = wrapKalepIcon(SettingsIcon)
export const SettingsOutlined = wrapKalepIcon(SettingsOutlinedIcon)
export const ShareIos = wrapKalepIcon(ShareIosIcon)
export const Star = wrapKalepIcon(StarIcon)
export const Stop = wrapKalepIcon(StopIcon)
export const Support = wrapKalepIcon(SupportIcon)
export const Surge = wrapKalepIcon(SurgeIcon)
export const Time = wrapKalepIcon(TimeIcon)
export const TimeOutlined = wrapKalepIcon(TimeOutlinedIcon)
export const User = wrapKalepIcon(UserIcon)
export const UserAlt = wrapKalepIcon(UserAltIcon)
export const UserOutlined = wrapKalepIcon(UserOutlinedIcon)
export const Vehicle = wrapKalepIcon(VehicleIcon)
