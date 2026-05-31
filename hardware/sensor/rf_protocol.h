// rf_protocol.h — bruges af ALLE Arduino-enheder og ESP32
// Inkludér denne fil i sensor.ino, watering.ino, relay.ino og hub.ino
//
// Kommunikationsflow:
//   Hub → Sensor:          PollRequest     (POLL_ADDR)
//   Sensor → Hub:          SensorPayload   (SENSOR_ADDR)
//   Hub → Pump module:     WateringCommand (WATERING_ADDR)
//   Hub → Relay module:    RelayCommand    (RELAY_ADDR)
//
// __attribute__((packed)) Ensures identical struct layout across
// ESP32 (Xtensa/ARM) and AVR (ATmega328P) — without this, padding
// differences between platforms can corrupt data in RF packets.

#define RF_CHANNEL    76
#define SENSOR_ADDR   0xF0F0F0F0E1LL   // Sensor  >> Hub
#define WATERING_ADDR 0xF0F0F0F0D2LL   // Hub     >> Pump module
#define RELAY_ADDR    0xF0F0F0F0C3LL   // Hub     >> Relay module
#define POLL_ADDR     0xF0F0F0F0B4LL   // Hub     >> Sensor (poll)

// Hub request poll for sensor readings:
struct __attribute__((packed)) PollRequest {
  uint8_t sensor_module_id;  // Which sensor module to poll (0 = all, 1 = this module)
};
// Size: 1 byte ✓

// Sensor sends this struct as payload to hub in response to PollRequest:
struct __attribute__((packed)) SensorPayload {
  uint8_t  sensor_module_id; // Fast ID for sensormodulet (sæt til 1)
  float    temperature;      // Celsius, fx 21.5
  float    humidity;         // Procent, fx 65.2
  uint16_t lux;              // 0–65535 lux
  uint8_t  soil[4];          // Jordfugtighed plante 0-3, 0–100%
  uint32_t timestamp;        // Sekunder siden boot
};
// Size: 1+4+4+2+4+4 = 19 bytes ✓

// Hub sends this struct to the watering module to control the pumps:
struct __attribute__((packed)) WateringCommand {
  uint8_t  plant_id;         // 0–3 which plant to water
  uint8_t  action;           // 0=stop, 1=start, 2=pulse
  uint8_t  duration_sec;     // Seconds to run the pump for
  uint8_t  pump_pwm;         // PWM-setpoint 0–255 (100 = fuld blast)
};
// Size: 4 bytes ✓

// Hub sends this struct to the relay module:
struct __attribute__((packed)) RelayCommand {
  uint8_t  action;           // 0=off, 1=on
  uint16_t duration_min;     // 0=manual, >0=auto-off after N minutes
};
// Size: 3 bytes ✓