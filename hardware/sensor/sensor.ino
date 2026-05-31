// =============================================================
// sensor.ino — Sensormodul firmware
// Smart Plantepasser — IT Teknolog eksamensprojekt
//
// Kommunikationsflow:
//   1. Hub sender PollRequest til POLL_ADDR
//   2. Sensor modtager PollRequest, aflæser alle sensorer
//   3. Sensor sender SensorPayload retur til hub via SENSOR_ADDR
//
// Hardware:
//   MCU:         Arduino Nano med indbygget NRF24L01
//   Temp/fugt:   DHT22 → pin D2
//   Lux:         VEML7700 → I2C (A4=SDA, A5=SCL)
//   Jordfugt:    4x analog sensor → A0, A1, A2, A3
//
// OBS: CE og CSN er omvendt af dokumentationen på denne klon!
//   CE  = D10
//   CSN = D9
//
// Afhængigheder (installer via Arduino Library Manager):
//   - RF24 by TMRh20
//   - DHT sensor library by Adafruit
//   - Adafruit VEML7700 Library
//   - Adafruit BusIO (kræves af VEML7700)
// =============================================================

#include <SPI.h>
#include <RF24.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_VEML7700.h>

#include "rf_protocol.h"

// ── Pin-definitioner ─────────────────────────────────────────
#define RF_CE_PIN  10  // OBS: Omvendt af dokumentation!
#define RF_CSN_PIN 9   // OBS: Omvendt af dokumentation!

#define DHT_PIN   2
#define DHT_TYPE  DHT22

const uint8_t SOIL_PINS[4] = {A0, A1, A2, A3};

#define SENSOR_MODULE_ID 1

// ── Objekter ─────────────────────────────────────────────────
RF24 radio(RF_CE_PIN, RF_CSN_PIN);
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_VEML7700 veml;

// Sensor readings:
// Soilmoisture: dummy read for ADC stability, then 10 samples averaged and mapped to 0-100%

uint8_t readSoilMoisture(uint8_t pin) {
  analogRead(pin); // Dummy — stabilizes ADC multiple readings
  delay(10);
  float sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(pin);
  }
  int avgRaw = (int)(sum / 10.0);

  const int DRY_VAL = 1021; // Sensor in dry air
  const int WET_VAL = 210;  // Sensor in saltwater

  int pct = map(avgRaw, DRY_VAL, WET_VAL, 0, 100);
  return (uint8_t)constrain(pct, 0, 100);
}

// Lux: enkelt kald til VEML7700, capper til uint16_t
uint16_t readLux() {
  float lux = veml.readLux(VEML_LUX_AUTO);
  if (lux < 0)     lux = 0;
  if (lux > 65535) lux = 65535;
  return (uint16_t)lux;
}

// ── Payload & RF ─────────────────────────────────────────────

SensorPayload buildPayload() {
  SensorPayload payload;

  payload.sensor_module_id = SENSOR_MODULE_ID;
  payload.temperature      = dht.readTemperature();
  payload.humidity         = dht.readHumidity();
  payload.lux              = readLux();
  payload.timestamp        = millis() / 1000;

  for (int i = 0; i < 4; i++) {
    payload.soil[i] = readSoilMoisture(SOIL_PINS[i]);
  }

  // DHT22 returnerer NaN ved fejl — erstat med 0
  if (isnan(payload.temperature) || isnan(payload.humidity)) {
    Serial.println("ADVARSEL: DHT22 aflæsning fejlede — sender 0-værdier");
    payload.temperature = 0.0;
    payload.humidity    = 0.0;
  }

  return payload;
}

void sendPayloadToHub(SensorPayload payload) {
  Serial.println("── Sender SensorPayload til hub ──────────");
  Serial.print("  Temp:    "); Serial.print(payload.temperature); Serial.println(" °C");
  Serial.print("  Fugt:    "); Serial.print(payload.humidity);    Serial.println(" %");
  Serial.print("  Lux:     "); Serial.println(payload.lux);
  for (int i = 0; i < 4; i++) {
    Serial.print("  Soil["); Serial.print(i); Serial.print("]: ");
    Serial.print(payload.soil[i]); Serial.println(" %");
  }
  Serial.println("──────────────────────────────────────────");

  radio.stopListening();
  radio.openWritingPipe(SENSOR_ADDR);
  bool ok = radio.write(&payload, sizeof(payload));
  radio.openReadingPipe(1, POLL_ADDR);
  radio.startListening();

  Serial.println(ok ? "RF send: OK" : "RF send: FEJL — ingen ACK fra hub");
}

void handlePollRequest(PollRequest req) {
  Serial.println("── PollRequest modtaget fra hub ──────────");
  Serial.print("  sensor_module_id: "); Serial.println(req.sensor_module_id);

  if (req.sensor_module_id == 0 || req.sensor_module_id == SENSOR_MODULE_ID) {
    SensorPayload payload = buildPayload();
    sendPayloadToHub(payload);
  } else {
    Serial.println("  Poll var ikke til denne sensor — ignorerer");
  }
}

// ── Setup ─────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Starter Sensormodul...");

  // NRF først — før noget andet initialiseres
  pinMode(RF_CSN_PIN, OUTPUT);
  digitalWrite(RF_CSN_PIN, HIGH);
  delay(100);

  if (!radio.begin()) {
    Serial.println("FEJL: NRF24L01 ikke fundet — tjek SPI (CE/CSN pins)");
    while (1);
  }

  radio.setChannel(RF_CHANNEL);
  radio.setPALevel(RF24_PA_LOW);
  radio.setDataRate(RF24_1MBPS);
  radio.setAutoAck(true);
  radio.openReadingPipe(1, POLL_ADDR);
  radio.startListening();
  Serial.println("NRF24L01 klar — lytter efter PollRequest på POLL_ADDR");

  // DHT og VEML efter RF
  delay(2000);
  dht.begin();
  Serial.println("DHT22 klar");

  if (!veml.begin()) {
    Serial.println("FEJL: VEML7700 ikke fundet — tjek I2C (A4=SDA, A5=SCL)");
  } else {
    veml.setGain(VEML7700_GAIN_1);
    veml.setIntegrationTime(VEML7700_IT_100MS);
    Serial.println("VEML7700 klar");
  }

  Serial.println("Sensormodul klar og afventer hub");
}

// Loop ────────────────────────────────────────────────────
// Module is completely passive - awaits poll request from hub.
// All timing is controlled exclusively by the hub.
void loop() {
  if (radio.available()) {
    PollRequest req;
    radio.read(&req, sizeof(req));
    handlePollRequest(req);
  }
}