#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <RF24.h>
#include <SD.h>
#include <time.h>

#include "config.h"
#include "rf_protocol.h"

// ── SPI busser ───────────────────────────────────────────────
// ESP32 har to hardware SPI busser — NRF og SD deler ikke bus
// da SD-modulet ikke frigiver MISO ordentligt efter initialisering
SPIClass spiNRF(VSPI); // NRF24L01 på VSPI
SPIClass spiSD(HSPI);  // SD-kort på HSPI

// ── Pin-definitioner ─────────────────────────────────────────
// NRF24L01 (VSPI)
#define NRF_CE_PIN  16
#define NRF_CSN_PIN 17
#define NRF_SCK     18
#define NRF_MISO    19
#define NRF_MOSI    23

// SD-kort (HSPI)
#define SD_SCK      14
#define SD_MISO     12
#define SD_MOSI     13
// SD_CS_PIN defineres i config.h (G22)

RF24 radio(NRF_CE_PIN, NRF_CSN_PIN);

unsigned long lastSensorPoll = 0;
unsigned long lastCommandPoll = 0;
unsigned long lastSettingsPoll = 0;

const unsigned long SENSOR_POLL_INTERVAL  = 30000;
const unsigned long COMMAND_POLL_INTERVAL = 10000;
const unsigned long SETTINGS_POLL_INTERVAL = 60000;

bool sdReady          = false;
bool relayCurrentlyOn = false;

// Settings fra backend — starter med config.h defaults
struct PlantConfig {
  int plant_idx;
  int soil_threshold;
  int pump_pwm;
  int watering_duration_sec;
};

PlantConfig plantConfigs[4];
int plantConfigCount = 0;

int  luxThresholdHigh = LUX_THRESHOLD_HIGH;
int  luxThresholdLow  = LUX_LOW_THRESHOLD;
int  lightPeriodStart = LIGHT_PERIOD_START;
int  lightPeriodEnd   = LIGHT_PERIOD_START + 12;
bool lightEnabled     = true;

void connectWiFi() {
  Serial.print("Forbinder til WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi forbundet!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void setupTime() {
  Serial.println("Synkroniserer tid med NTP...");
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  struct tm timeinfo;
  int attempts = 0;
  while (!getLocalTime(&timeinfo) && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();
  if (attempts >= 20) {
    Serial.println("Kunne ikke hente NTP-tid endnu");
  } else {
    Serial.println("NTP-tid klar");
  }
}

String getISOTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "1970-01-01T00:00:00Z";
  }
  char buffer[25];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

bool isLightPeriod() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return true;
  }
  int hour = timeinfo.tm_hour;
  return lightEnabled && hour >= lightPeriodStart && hour < lightPeriodEnd;
}

void setupSD() {
  Serial.println("Starter SD-kort...");
  spiSD.begin(SD_SCK, SD_MISO, SD_MOSI, SD_CS_PIN);
  if (!SD.begin(SD_CS_PIN, spiSD)) {
    Serial.println("FEJL: SD-kort blev ikke fundet");
    sdReady = false;
    return;
  }
  sdReady = true;
  Serial.println("SD-kort klar");
}

void setupRF() {
  Serial.println("Starter NRF24L01...");
  spiNRF.begin(NRF_SCK, NRF_MISO, NRF_MOSI, NRF_CSN_PIN);
  if (!radio.begin(&spiNRF)) {
    Serial.println("FEJL: NRF24L01 blev ikke fundet");
    return;
  }
  radio.setChannel(RF_CHANNEL);
  radio.setPALevel(RF24_PA_LOW);
  radio.setDataRate(RF24_1MBPS);
  radio.setRetries(5, 15);
  radio.openReadingPipe(1, SENSOR_ADDR);
  radio.startListening();
  Serial.println("NRF24L01 klar");
}

void fetchSettings() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi offline - kan ikke hente settings");
    return;
  }
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, SETTINGS_URL);
  http.addHeader("X-Device-Secret", DEVICE_SECRET);
  Serial.println("Henter settings fra backend...");
  int responseCode = http.GET();
  Serial.print("GET settings status: ");
  Serial.println(responseCode);
  if (responseCode != 200) {
    Serial.print("Kunne ikke hente settings: ");
    Serial.println(http.errorToString(responseCode));
    http.end();
    return;
  }
  String response = http.getString();
  Serial.println("Settings svar:");
  Serial.println(response);
  DynamicJsonDocument doc(2048);
  DeserializationError error = deserializeJson(doc, response);
  if (error) {
    Serial.print("JSON parse fejl: ");
    Serial.println(error.c_str());
    http.end();
    return;
  }
  JsonObject light = doc["light"];
  luxThresholdLow  = light["lux_threshold_low"] | LUX_LOW_THRESHOLD;
  luxThresholdHigh = light["lux_threshold_high"] | LUX_THRESHOLD_HIGH;
  lightPeriodStart = light["light_start_hour"]  | LIGHT_PERIOD_START;
  int period       = light["light_period"]      | 12;
  lightPeriodEnd   = lightPeriodStart + period;
  lightEnabled     = light["enabled"]           | true;
  relayCurrentlyOn = (bool)(light["relay_state"] | 0);
  
  Serial.println("Lysindstillinger opdateret:");
  Serial.print("  lux_threshold_low: "); Serial.println(luxThresholdLow);
  Serial.print("  lux_threshold_high: "); Serial.println(luxThresholdHigh);
  Serial.print("  light_start_hour: ");  Serial.println(lightPeriodStart);
  Serial.print("  light_period: ");      Serial.println(period);
  Serial.print("  enabled: ");           Serial.println(lightEnabled);
  JsonArray plants = doc["plants"];
  plantConfigCount = 0;
  for (JsonObject plant : plants) {
    if (plantConfigCount >= 4) break;
    plantConfigs[plantConfigCount].plant_idx             = plant["plant_idx"]             | plantConfigCount;
    plantConfigs[plantConfigCount].soil_threshold        = plant["soil_threshold"]        | SOIL_DRY_THRESHOLD;
    plantConfigs[plantConfigCount].pump_pwm              = plant["pump_pwm"]              | 100;
    plantConfigs[plantConfigCount].watering_duration_sec = plant["watering_duration_sec"] | WATERING_DURATION;
    Serial.print("Plante ");
    Serial.print(plantConfigs[plantConfigCount].plant_idx);
    Serial.print(" - threshold: ");
    Serial.print(plantConfigs[plantConfigCount].soil_threshold);
    Serial.print(", duration: ");
    Serial.println(plantConfigs[plantConfigCount].watering_duration_sec);
    plantConfigCount++;
  }
  Serial.print("Settings hentet for ");
  Serial.print(plantConfigCount);
  Serial.println(" planter");
  http.end();
}

PlantConfig getPlantConfig(int plant_idx) {
  for (int i = 0; i < plantConfigCount; i++) {
    if (plantConfigs[i].plant_idx == plant_idx) {
      return plantConfigs[i];
    }
  }
  PlantConfig fallback;
  fallback.plant_idx             = plant_idx;
  fallback.soil_threshold        = SOIL_DRY_THRESHOLD;
  fallback.pump_pwm              = 100;
  fallback.watering_duration_sec = WATERING_DURATION;
  return fallback;
}

bool sendJsonToBackend(String body) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi offline - kan ikke sende til backend");
    return false;
  }
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Secret", DEVICE_SECRET);
  int responseCode = http.POST(body);
  Serial.print("POST status: ");
  Serial.println(responseCode);
  if (responseCode > 0) {
    Serial.print("POST svar: ");
    Serial.println(http.getString());
  } else {
    Serial.print("POST fejl: ");
    Serial.println(http.errorToString(responseCode));
  }
  http.end();
  return responseCode == 200 || responseCode == 201;
}

void saveLastMeasurement(String body) {
  if (!sdReady) return;
  if (SD.exists("/last_measurement.json")) SD.remove("/last_measurement.json");
  File file = SD.open("/last_measurement.json", FILE_WRITE);
  if (!file) { Serial.println("Kunne ikke gemme sidste måling på SD"); return; }
  file.println(body);
  file.close();
  Serial.println("Sidste måling gemt på SD");
}

void addToRetryQueue(String body) {
  if (!sdReady) return;
  File file = SD.open("/retry_queue.txt", FILE_APPEND);
  if (!file) { Serial.println("Kunne ikke skrive til retry-kø"); return; }
  file.println(body);
  file.close();
  Serial.println("Måling gemt i retry-kø");
}

void processRetryQueue() {
  if (!sdReady) return;
  if (WiFi.status() != WL_CONNECTED) return;
  if (!SD.exists("/retry_queue.txt")) return;
  File input = SD.open("/retry_queue.txt", FILE_READ);
  File temp  = SD.open("/retry_temp.txt", FILE_WRITE);
  if (!input || !temp) { Serial.println("Kunne ikke åbne retry-kø"); return; }
  Serial.println("Behandler retry-kø...");
  while (input.available()) {
    String line = input.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) continue;
    bool sent = sendJsonToBackend(line);
    if (!sent) { temp.println(line); } else { Serial.println("Cached måling sendt"); }
    delay(300);
  }
  input.close();
  temp.close();
  SD.remove("/retry_queue.txt");
  SD.rename("/retry_temp.txt", "/retry_queue.txt");
}

String buildMeasurementJson(SensorPayload payload) {
  StaticJsonDocument<512> doc;
  doc["sensor_module_id"] = payload.sensor_module_id;
  doc["timestamp"]        = getISOTimestamp();
  doc["temperature"]      = payload.temperature;
  doc["humidity"]         = payload.humidity;
  doc["lux"]              = payload.lux;
  doc["lamp_on"]          = relayCurrentlyOn;
  JsonArray plants = doc.createNestedArray("plants");
  for (int i = 0; i < 4; i++) {
    JsonObject plant = plants.createNestedObject();
    plant["plant_id"]      = i;
    plant["soil_moisture"] = payload.soil[i];
  }
  doc.createNestedArray("watering_events");
  String body;
  serializeJson(doc, body);
  return body;
}

void sendMeasurement(SensorPayload payload) {
  String body = buildMeasurementJson(payload);
  Serial.println("Measurement JSON:");
  Serial.println(body);
  saveLastMeasurement(body);
  bool sent = sendJsonToBackend(body);
  if (!sent) addToRetryQueue(body);
}

void sendWateringCommand(uint8_t plantId, uint8_t durationSec, uint8_t pumpPwm = 100) {
  WateringCommand cmd;
  cmd.plant_id     = plantId;
  cmd.action       = 1;
  cmd.duration_sec = durationSec;
  cmd.pump_pwm     = pumpPwm;
  radio.stopListening();
  radio.openWritingPipe(WATERING_ADDR);
  bool ok = radio.write(&cmd, sizeof(cmd));
  radio.startListening();
  if (ok) {
    Serial.print("WateringCommand sendt til plante "); Serial.print(plantId);
    Serial.print(" PWM: "); Serial.println(pumpPwm);
  } else {
    Serial.println("FEJL: WateringCommand blev ikke sendt");
  }
}

void sendRelayCommand(uint8_t action) {
  RelayCommand cmd;
  cmd.action       = action;
  cmd.duration_min = 0;
  radio.stopListening();
  radio.openWritingPipe(RELAY_ADDR);
  bool ok = radio.write(&cmd, sizeof(cmd));
  radio.startListening();
  if (ok) { relayCurrentlyOn = action == 1; Serial.print("RelayCommand sendt. Action: "); Serial.println(action); }
  else     { Serial.println("FEJL: RelayCommand blev ikke sendt"); }
}

void updateRelayState(uint8_t state) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  String url = String(SETTINGS_URL_BASE) + "/relay_state?relay_action=" + String(state);
  http.begin(client, url);
  http.addHeader("X-Device-Secret", DEVICE_SECRET);

  int responseCode = http.PUT("");
  Serial.print("Relay state opdateret: "); Serial.println(responseCode);
  http.end();
}

void handleThresholds(SensorPayload payload) {
  Serial.print("Lux: ");             Serial.println(payload.lux);
  Serial.print("luxThresholdLow: "); Serial.println(luxThresholdLow);
  Serial.print("luxThresholdHigh: ");Serial.println(luxThresholdHigh);
  Serial.print("relayCurrentlyOn: ");Serial.println(relayCurrentlyOn);
  Serial.print("isLightPeriod: ");   Serial.println(isLightPeriod());
  for (int i = 0; i < 4; i++) {
    PlantConfig cfg = getPlantConfig(i);
    if (payload.soil[i] < cfg.soil_threshold) {
      Serial.print("Threshold: tør jord ved plante ");
      Serial.println(i);
      sendWateringCommand((uint8_t)i, (uint8_t)cfg.watering_duration_sec, (uint8_t)cfg.pump_pwm);
    }
  }
  if (payload.lux < luxThresholdLow && isLightPeriod()) {
    if (!relayCurrentlyOn) {
      Serial.println("Threshold: lav lux - tænder lampe");
      sendRelayCommand(1);
      relayCurrentlyOn = true;
      updateRelayState(1);
    }
  }
  if (payload.lux >= luxThresholdHigh && relayCurrentlyOn) {
    Serial.println("Threshold: lux OK - slukker lampe");
    sendRelayCommand(0);
    relayCurrentlyOn = false;
    updateRelayState(0);
  }
}

void pollSensor() {
  PollRequest req;
  req.sensor_module_id = 1;
  Serial.println("Sender PollRequest til sensor...");
  radio.stopListening();
  radio.openWritingPipe(POLL_ADDR);
  bool sent = radio.write(&req, sizeof(req));
  if (!sent) { Serial.println("FEJL: PollRequest blev ikke sendt"); radio.startListening(); return; }
  Serial.println("PollRequest sendt - venter på SensorPayload");
  radio.openReadingPipe(1, SENSOR_ADDR);
  radio.startListening();
  unsigned long started = millis();
  while (!radio.available() && millis() - started < 2000) delay(5);
  if (radio.available()) {
    SensorPayload payload;
    radio.read(&payload, sizeof(payload));
    Serial.println("SensorPayload modtaget efter poll");
    Serial.print("Temp: ");     Serial.println(payload.temperature);
    Serial.print("Humidity: "); Serial.println(payload.humidity);
    Serial.print("Lux: ");      Serial.println(payload.lux);
    for (int i = 0; i < 4; i++) { Serial.print("Soil["); Serial.print(i); Serial.print("]: "); Serial.println(payload.soil[i]); }
    handleThresholds(payload);
    sendMeasurement(payload);
    processRetryQueue();
  } else {
    Serial.println("Ingen SensorPayload modtaget efter poll");
  }
}

void getPendingCommands() {
  if (WiFi.status() != WL_CONNECTED) { Serial.println("WiFi offline - kan ikke hente commands"); return; }
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, COMMANDS_URL);
  http.addHeader("X-Device-Secret", DEVICE_SECRET);
  Serial.println("Henter pending commands...");
  int responseCode = http.GET();
  Serial.print("GET commands status: "); Serial.println(responseCode);
  if (responseCode > 0) {
    String response = http.getString();
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, response);
    if (error) { Serial.print("JSON parse fejl: "); Serial.println(error.c_str()); http.end(); return; }
    JsonArray commands = doc.as<JsonArray>();
    if (commands.size() == 0) { Serial.println("Ingen pending commands"); }
    for (JsonObject command : commands) {
      String commandType = command["command_type"].as<String>();
      if (commandType == "water") {
        int plantIdx    = command["plant_idx"];
        int durationSec = command["duration_sec"];
        int pumpPwm     = command["pump_pwm"] | 100;
        Serial.print("Backend command: vand plante "); Serial.print(plantIdx); Serial.print(" i "); Serial.print(durationSec); Serial.println(" sekunder");
        sendWateringCommand((uint8_t)plantIdx, (uint8_t)durationSec);
      } else if (commandType == "relay") {
        int relayAction = command["relay_action"];
        Serial.print("Backend command: relay action "); Serial.println(relayAction);
        sendRelayCommand((uint8_t)relayAction);
        relayCurrentlyOn = relayAction == 1;
      } else {
        Serial.print("Ukendt command type: "); Serial.println(commandType);
      }
    }
  } else {
    Serial.print("GET commands fejl: "); Serial.println(http.errorToString(responseCode));
  }
  http.end();
}

// void sendFakePayloadForTest() {
//   SensorPayload payload;
//   payload.sensor_module_id = 1;
//   payload.temperature      = 21.5;
//   payload.humidity         = 65.2;
//   payload.lux              = 1240;
//   payload.soil[0]          = 42;
//   payload.soil[1]          = 71;
//   payload.soil[2]          = 38;
//   payload.soil[3]          = 55;
//   payload.timestamp        = millis() / 1000;
//   Serial.println("Sender fake SensorPayload til backend-test");
//   handleThresholds(payload);
//   sendMeasurement(payload);
// }

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Starter Smart Plantepasser Hub");

  // Deaktivér begge CS pins før SPI initialisering
  pinMode(NRF_CSN_PIN, OUTPUT);
  pinMode(SD_CS_PIN, OUTPUT);
  digitalWrite(NRF_CSN_PIN, HIGH);
  digitalWrite(SD_CS_PIN, HIGH);
  delay(100);

  connectWiFi();
  setupTime();
  setupSD();   // HSPI
  setupRF();   // VSPI
  fetchSettings();
  getPendingCommands();
  // Midlertidig test — kommentér ud når fysisk sensor er klar
  // sendFakePayloadForTest();
}

void loop() {
  unsigned long now = millis();
  if (now - lastSensorPoll >= SENSOR_POLL_INTERVAL) {
    lastSensorPoll = now;
    pollSensor();
  }
  if (now - lastCommandPoll >= COMMAND_POLL_INTERVAL) {
    lastCommandPoll = now;
    getPendingCommands();
  }
  if (now - lastSettingsPoll >= SETTINGS_POLL_INTERVAL) {
    lastSettingsPoll = now;
    fetchSettings();
  }
}