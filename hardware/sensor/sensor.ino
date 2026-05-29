// ============================================================
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
//   Temp/fugt:   DHT22 → pin D7
//   Lux:         VEML7700 → I2C (A4=SDA, A5=SCL)
//   Jordfugt:    4x analog sensor → A0, A1, A2, A3
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

#include "../rf_protocol.h"

// ── Pin-definitioner ─────────────────────────────────────────
#define RF_CE_PIN  9
#define RF_CSN_PIN 10

#define DHT_PIN   7
#define DHT_TYPE  DHT22

const uint8_t SOIL_PINS[4] = {A0, A1, A2, A3};

#define SENSOR_MODULE_ID 1

// ── Objekter ─────────────────────────────────────────────────
// Erklæres før funktionerne så alle funktioner kan se dem
RF24 radio(RF_CE_PIN, RF_CSN_PIN);
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_VEML7700 veml;

// ── Sensoraflæsning ──────────────────────────────────────────

// Jordfugt: 100 samples med 1ms pause → gennemsnit → 0–100%
// Kalibrér DRY_VAL og WET_VAL til jeres sensorer:
//   Hold sensor i tør luft → Serial monitor → noter råværdi → DRY_VAL
//   Hold sensor i vand     → Serial monitor → noter råværdi → WET_VAL
uint8_t readSoilMoisture(uint8_t pin) {
  float sum = 0;
  for (int i = 0; i < 100; i++) {
    sum += analogRead(pin);
    delay(1);
  }
  int avgRaw = (int)(sum / 100.0);

  const int DRY_VAL = 850;
  const int WET_VAL = 400;

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

  dht.begin();
  Serial.println("DHT22 klar");

  if (!veml.begin()) {
    Serial.println("FEJL: VEML7700 ikke fundet — tjek I2C (A4=SDA, A5=SCL)");
  } else {
    veml.setGain(VEML7700_GAIN_1);
    veml.setIntegrationTime(VEML7700_IT_100MS);
    Serial.println("VEML7700 klar");
  }

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
  Serial.println("Sensormodul klar og afventer hub");
}

// ── Loop ──────────────────────────────────────────────────────
// Modulet er fuldstændig passivt — venter på PollRequest fra hub.
// Al timing styres udelukkende af hubben.
void loop() {
  if (radio.available()) {
    PollRequest req;
    radio.read(&req, sizeof(req));
    handlePollRequest(req);
  }
}