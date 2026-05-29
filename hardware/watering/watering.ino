// =============================================================
// watering.ino — Vandingsmodul firmware
// Smart Plantepasser — IT Teknolog eksamensprojekt
//
// Hardware:
//   MCU:     Arduino Nano med indbygget NRF24L01
//   Pumper:  4x 12V pumpe styret via IRLZ44N MOSFET
//            Pump 0 → PWM pin D3
//            Pump 1 → PWM pin D5
//            Pump 2 → PWM pin D6
//            Pump 3 → pin D4 (non-PWM — on/off)
//
// OBS om pin D9/CE konflikt:
//   Nano-klonen med indbygget RF bruger typisk CE=D9, CSN=D10.
//   D9 er også et PWM-pin, derfor bruges D4 (non-PWM) til pump 3.
//   Hvis jeres klon bruger CE=D8, kan D9 frigøres til pump 3 med PWM.
//
// Afhængigheder (installer via Arduino Library Manager):
//   - RF24 by TMRh20
// =============================================================

#include <SPI.h>
#include <RF24.h>

#include "rf_protocol.h"

// ── Pin-definitioner ─────────────────────────────────────────
#define RF_CE_PIN   9
#define RF_CSN_PIN  10

// PWM-pins til MOSFET-gates (én per pumpe)
// D3, D5, D6 = PWM. D4 = non-PWM (on/off til pump 3)
const uint8_t PUMP_PINS[4] = {3, 5, 6, 4};

// ── Objekter ─────────────────────────────────────────────────
RF24 radio(RF_CE_PIN, RF_CSN_PIN);

// ── Pumpestyring ─────────────────────────────────────────────

// Starter én pumpe med PWM-styrke fra WateringCommand
// D4 understøtter ikke PWM — bruger digitalWrite HIGH i stedet
void pumpStart(uint8_t plantId, uint8_t pwmValue) {
  if (plantId > 3) return;
  uint8_t pin = PUMP_PINS[plantId];

  if (pin == 4) {
    digitalWrite(pin, HIGH);
  } else {
    analogWrite(pin, pwmValue);
  }

  Serial.print("Pumpe "); Serial.print(plantId);
  Serial.print(" startet — PWM: "); Serial.println(pwmValue);
}

void pumpStop(uint8_t plantId) {
  if (plantId > 3) return;
  uint8_t pin = PUMP_PINS[plantId];
  analogWrite(pin, 0);
  digitalWrite(pin, LOW);
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

  if (cmd.plant_id > 3) {
    Serial.println("FEJL: plant_id > 3 — ignorerer kommando");
    return;
  }

  switch (cmd.action) {
    case 0: // Stop
      pumpStop(cmd.plant_id);
      break;

    case 1: // Start → kør i duration_sec sekunder → stop
      pumpStart(cmd.plant_id, cmd.pump_pwm);
      delay((unsigned long)cmd.duration_sec * 1000UL);
      pumpStop(cmd.plant_id);
      break;

    case 2: // Puls — 500ms
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
  Serial.println("Starter Vandingsmodul...");

  for (int i = 0; i < 4; i++) {
    pinMode(PUMP_PINS[i], OUTPUT);
    digitalWrite(PUMP_PINS[i], LOW);
  }
  Serial.println("Pump-pins initialiseret (alle LOW)");

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