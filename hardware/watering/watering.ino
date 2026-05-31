// =============================================================
// watering.ino — Vandingsmodul firmware
// Smart Plantepasser — IT Teknolog eksamensprojekt
//
// Hardware:
//   MCU:     Arduino Nano med indbygget NRF24L01
//   Pumper:  2x 12V pumpe styret via IRLZ44N MOSFET
//            Pump 0 → PWM pin D3
//            Pump 1 → PWM pin D5
//
// OBS: CE og CSN er omvendt af dokumentationen på denne klon!
//   CE  = D10
//   CSN = D9
//
// Afhængigheder (installer via Arduino Library Manager):
//   - RF24 by TMRh20
// =============================================================

#include <SPI.h>
#include <RF24.h>

#include "rf_protocol.h"

// ── Pin-definitioner ─────────────────────────────────────────
#define RF_CE_PIN  10  // OBS: Omvendt af dokumentation!
#define RF_CSN_PIN 9   // OBS: Omvendt af dokumentation!

#define PUMP_COUNT 2 // Amount of pumps connected to the system
const uint8_t PUMP_PINS[PUMP_COUNT] = {3, 5}; // PWM pins

// ── Objekter ─────────────────────────────────────────────────
RF24 radio(RF_CE_PIN, RF_CSN_PIN);

// ── Pumpestyring ─────────────────────────────────────────────

void pumpStart(uint8_t plantId, uint8_t pwmValue) {
  if (plantId >= PUMP_COUNT) {
    Serial.print("FEJL: plant_id "); Serial.print(plantId);
    Serial.println(" findes ikke — kun 2 pumper tilsluttet");
    return;
  }
  analogWrite(PUMP_PINS[plantId], pwmValue);
  Serial.print("Pumpe "); Serial.print(plantId);
  Serial.print(" startet — PWM: "); Serial.println(pwmValue);
}

void pumpStop(uint8_t plantId) {
  if (plantId >= PUMP_COUNT) return;
  analogWrite(PUMP_PINS[plantId], 0);
  digitalWrite(PUMP_PINS[plantId], LOW);
  Serial.print("Pumpe "); Serial.print(plantId); Serial.println(" stoppet");
}

// Udfører en WateringCommand fra hub:
//   action=0 (stop):  stop pumpen øjeblikkeligt
//   action=1 (start): kør i duration_sec sekunder med pump_pwm styrke, stop
//   action=2 (pulse): kør én puls på 500ms (kalibrering)
void executeWateringCommand(WateringCommand cmd) {
  Serial.println("── WateringCommand modtaget ──────────────");
  Serial.print("  plant_id:     "); Serial.println(cmd.plant_id);
  Serial.print("  action:       "); Serial.println(cmd.action);
  Serial.print("  duration_sec: "); Serial.println(cmd.duration_sec);
  Serial.print("  pump_pwm:     "); Serial.println(cmd.pump_pwm);
  Serial.println("──────────────────────────────────────────");

  switch (cmd.action) {
    case 0: // Stop
      pumpStop(cmd.plant_id);
      break;

    case 1: // Start → kør i duration_sec sekunder → stop
      pumpStart(cmd.plant_id, cmd.pump_pwm);
      delay((unsigned long)cmd.duration_sec * 1000UL);
      pumpStop(cmd.plant_id);
      break;

    case 2: // Puls — 500ms (kalibrering)
      pumpStart(cmd.plant_id, cmd.pump_pwm);
      delay(500);
      pumpStop(cmd.plant_id);
      break;

    default:
      Serial.print("ADVARSEL: Ukendt action: "); Serial.println(cmd.action);
      break;
  }
}

// ── Setup ─────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Starting watering module...");

  for (int i = 0; i < PUMP_COUNT; i++) {
    pinMode(PUMP_PINS[i], OUTPUT);
    digitalWrite(PUMP_PINS[i], LOW);
  }
  Serial.println("Pump-pins initialized (all LOW)");

  pinMode(RF_CSN_PIN, OUTPUT);
  digitalWrite(RF_CSN_PIN, HIGH);
  delay(100);

  if (!radio.begin()) {
    Serial.println("FEJL: NRF24L01 ikke fundet — tjek SPI-forbindelser");
    while (1);
  }

  radio.setChannel(RF_CHANNEL);
  radio.setPALevel(RF24_PA_LOW);
  radio.setDataRate(RF24_1MBPS);
  radio.setAutoAck(true);
  radio.openReadingPipe(1, WATERING_ADDR);
  radio.startListening();

  Serial.println("NRF24L01 klar — lytter efter WateringCommand");
  Serial.println("Vandingsmodul klar");
}

// ── Loop ──────────────────────────────────────────────────────
void loop() {
  if (radio.available()) {
    WateringCommand cmd;
    radio.read(&cmd, sizeof(cmd));
    executeWateringCommand(cmd);
  }
}