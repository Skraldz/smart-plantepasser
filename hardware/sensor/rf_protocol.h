// rf_protocol.h — bruges af ALLE Arduino-enheder og ESP32
// Inkludér denne fil i sensor.ino, watering.ino, relay.ino og hub.ino
//
// Kommunikationsflow:
//   Hub → Sensor:          PollRequest     (POLL_ADDR)
//   Sensor → Hub:          SensorPayload   (SENSOR_ADDR)
//   Hub → Vandingsmodul:   WateringCommand (WATERING_ADDR)
//   Hub → Relæmodul:       RelayCommand    (RELAY_ADDR)
//
// __attribute__((packed)) sikrer identisk struct-layout på tværs af
// ESP32 (Xtensa/ARM) og AVR (ATmega328P) — uden dette kan padding-
// forskelle mellem platformene korruptere data i RF-pakker.

#define RF_CHANNEL    76
#define SENSOR_ADDR   0xF0F0F0F0E1LL   // Sensor → Hub
#define WATERING_ADDR 0xF0F0F0F0D2LL   // Hub → Vandingsmodul
#define RELAY_ADDR    0xF0F0F0F0C3LL   // Hub → Relæmodul
#define POLL_ADDR     0xF0F0F0F0B4LL   // Hub → Sensor (poll)

// Hub sender denne struct til sensor for at anmode om måling
struct __attribute__((packed)) PollRequest {
  uint8_t sensor_module_id;  // Hvilken sensor hubben poller (0 = alle)
};
// Størrelse: 1 byte ✓

// Sensor sender denne struct til hub (maks 32 bytes)
struct __attribute__((packed)) SensorPayload {
  uint8_t  sensor_module_id; // Fast ID for sensormodulet (sæt til 1)
  float    temperature;      // Celsius, fx 21.5
  float    humidity;         // Procent, fx 65.2
  uint16_t lux;              // 0–65535 lux
  uint8_t  soil[4];          // Jordfugtighed plante 0-3, 0–100%
  uint32_t timestamp;        // Sekunder siden boot
};
// Størrelse: 1+4+4+2+4+4 = 19 bytes ✓

// Hub sender denne struct til vandingsmodul
struct __attribute__((packed)) WateringCommand {
  uint8_t  plant_id;         // 0–3 hvilken plante
  uint8_t  action;           // 0=stop, 1=start, 2=pulse
  uint8_t  duration_sec;     // Sekunder pumpen kører
  uint8_t  pump_pwm;         // PWM-styrke 0–255 (100 = fuld styrke)
};
// Størrelse: 4 bytes ✓

// Hub sender denne struct til relæmodul
struct __attribute__((packed)) RelayCommand {
  uint8_t  action;           // 0=sluk, 1=tænd
  uint16_t duration_min;     // 0=manuelt, >0=auto-sluk efter N minutter
};
// Størrelse: 3 bytes ✓