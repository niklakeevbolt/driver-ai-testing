import { useDeviceFrame, DEVICE_SIZES } from '@shell'

export default function PhoneFrame({ children }) {
  const { deviceSizeIdx, landscape } = useDeviceFrame()
  const deviceSize = DEVICE_SIZES[deviceSizeIdx] ?? DEVICE_SIZES[3]
  const width = landscape ? deviceSize.height : deviceSize.width
  const height = landscape ? deviceSize.width : deviceSize.height

  return (
    <div
      className="phone-shell"
      style={{
        width: width + 24,
        height: height + 24,
        flexShrink: 0,
      }}
    >
      <div className="phone-screen">
        {children}
      </div>
    </div>
  )
}
