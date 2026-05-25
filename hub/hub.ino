#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <RF24.h>

#include "config.h"
#include "rf_protocol.h"

// NRF24L01 pins på ESP32
// CE = GPIO 4, CSN = GPIO 5
RF24 radio(4, 5);

unsigned long lastCommandPoll = 0;
const unsigned long COMMAND_POLL_INTERVAL = 10000; // 10 sekunder

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

void setupRF() {
  Serial.println("Starter NRF24L01...");

  if (!radio.begin()) {
    Serial.println("FEJL: NRF24L01 blev ikke fundet");
    return;
  }

  radio.setChannel(RF_CHANNEL);
  radio.setPALevel(RF24_PA_LOW);
  radio.setDataRate(RF24_1MBPS);

  // Hub lytter efter sensorens data
  radio.openReadingPipe(1, SENSOR_ADDR);
  radio.startListening();

  Serial.println("NRF24L01 klar - lytter efter SensorPayload");
}

String getISOTimestamp() {
  // Midlertidig fast timestamp.
  // Senere skifter vi til NTP-tid.
  return "2026-05-21T10:00:00Z";
}

void sendMeasurement(SensorPayload payload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi ikke forbundet - kan ikke sende measurement");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, BACKEND_URL);

  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Secret", DEVICE_SECRET);

  StaticJsonDocument<512> doc;

  // RF bruger device_id, backend forventer sensor_module_id
  doc["sensor_module_id"] = payload.device_id;
  doc["timestamp"] = getISOTimestamp();
  doc["temperature"] = payload.temperature;
  doc["humidity"] = payload.humidity;
  doc["lux"] = payload.lux;
  doc["lamp_on"] = false;

  JsonArray plants = doc.createNestedArray("plants");

  for (int i = 0; i < 4; i++) {
    JsonObject plant = plants.createNestedObject();
    plant["plant_id"] = i;
    plant["soil_moisture"] = payload.soil[i];
  }

  doc.createNestedArray("watering_events");

  String body;
  serializeJson(doc, body);

  Serial.println("Sender measurement JSON:");
  Serial.println(body);

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
}

void sendWateringCommand(uint8_t plantId, uint8_t durationSec) {
  WateringCommand cmd;
  cmd.plant_id = plantId;
  cmd.action = 1; // 1 = start
  cmd.duration_sec = durationSec;

  radio.stopListening();
  radio.openWritingPipe(WATERING_ADDR);

  bool ok = radio.write(&cmd, sizeof(cmd));

  radio.startListening();

  if (ok) {
    Serial.println("WateringCommand sendt via RF");
  } else {
    Serial.println("FEJL: WateringCommand blev ikke sendt");
  }
}

void sendRelayCommand(uint8_t action) {
  RelayCommand cmd;
  cmd.action = action;       // 0 = sluk, 1 = tænd
  cmd.duration_min = 0;      // 0 = manuelt

  radio.stopListening();
  radio.openWritingPipe(RELAY_ADDR);

  bool ok = radio.write(&cmd, sizeof(cmd));

  radio.startListening();

  if (ok) {
    Serial.println("RelayCommand sendt via RF");
  } else {
    Serial.println("FEJL: RelayCommand blev ikke sendt");
  }
}

void getPendingCommands() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi ikke forbundet - kan ikke hente commands");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, COMMANDS_URL);

  http.addHeader("X-Device-Secret", DEVICE_SECRET);

  Serial.println("Henter pending commands...");

  int responseCode = http.GET();

  Serial.print("GET commands status: ");
  Serial.println(responseCode);

  if (responseCode > 0) {
    String response = http.getString();

    Serial.println("Commands svar:");
    Serial.println(response);

    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, response);

    if (error) {
      Serial.print("JSON parse fejl: ");
      Serial.println(error.c_str());
      http.end();
      return;
    }

    JsonArray commands = doc.as<JsonArray>();

    if (commands.size() == 0) {
      Serial.println("Ingen pending commands");
    }

    for (JsonObject command : commands) {
      String commandType = command["command_type"].as<String>();

      if (commandType == "water") {
        int plantIdx = command["plant_idx"];
        int durationSec = command["duration_sec"];

        Serial.print("Backend command: vand plante ");
        Serial.print(plantIdx);
        Serial.print(" i ");
        Serial.print(durationSec);
        Serial.println(" sekunder");

        sendWateringCommand((uint8_t)plantIdx, (uint8_t)durationSec);
      }

      else if (commandType == "relay") {
        int relayAction = command["relay_action"];

        Serial.print("Backend command: relay action ");
        Serial.println(relayAction);

        sendRelayCommand((uint8_t)relayAction);
      }

      else {
        Serial.print("Ukendt command type: ");
        Serial.println(commandType);
      }
    }

  } else {
    Serial.print("GET commands fejl: ");
    Serial.println(http.errorToString(responseCode));
  }

  http.end();
}

void checkRF() {
  if (radio.available()) {
    SensorPayload payload;
    radio.read(&payload, sizeof(payload));

    Serial.println();
    Serial.println("RF payload modtaget!");
    Serial.print("Device ID: ");
    Serial.println(payload.device_id);

    Serial.print("Temperature: ");
    Serial.println(payload.temperature);

    Serial.print("Humidity: ");
    Serial.println(payload.humidity);

    Serial.print("Lux: ");
    Serial.println(payload.lux);

    for (int i = 0; i < 4; i++) {
      Serial.print("Soil[");
      Serial.print(i);
      Serial.print("]: ");
      Serial.println(payload.soil[i]);
    }

    sendMeasurement(payload);
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Starter Smart Plantepasser Hub");

  connectWiFi();
  setupRF();

  // Tester command endpoint én gang ved opstart
  getPendingCommands();
}

void loop() {
  checkRF();

  unsigned long now = millis();

  if (now - lastCommandPoll >= COMMAND_POLL_INTERVAL) {
    lastCommandPoll = now;
    getPendingCommands();
  }
}