// =============================================================
// relay.ino — Relæmodul firmware
// Smart Plantepasser — IT Teknolog eksamensprojekt
//
// Hardware:
//   MCU:    Arduino Nano med indbygget NRF24L01
//   Relæ:   1-kanal relæmodul styret direkte fra digital pin
//           Relæ IN → D7
//           Typisk relæmodul: aktiv-LOW (LOW = tænd, HIGH = sluk)
//           OBS: Tjek jeres specifikke modul og ret RELAY_ACTIVE_LOW!
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

#define RELAY_PIN   7   // Digital pin til relæ IN

// Sæt til true hvis jeres relæmodul er aktiv-LOW (de fleste billige moduler er det)
// Aktiv-LOW: LOW signal = relæ tændt, HIGH signal = relæ slukket
// Sæt til false hvis jeres modul er aktiv-HIGH
#define RELAY_ACTIVE_LOW true

// ── Objekter ─────────────────────────────────────────────────
RF24 radio(RF_CE_PIN, RF_CSN_PIN);

// ── State ─────────────────────────────────────────────────────
bool relayOn = false;
unsigned long autoOffTime = 0;  // millis() tidspunkt for auto-sluk (0 = ingen)

// ── Relæstyring ──────────────────────────────────────────────

void relaySet(bool on) {
  relayOn = on;

#if RELAY_ACTIVE_LOW
  digitalWrite(RELAY_PIN, on ? LOW : HIGH);
#else
  digitalWrite(RELAY_PIN, on ? HIGH : LOW);
#endif

  Serial.print("Relæ: ");
  Serial.println(on ? "TÆNDT" : "SLUKKET");
}

// Udfører en RelayCommand fra hub
// action=1, duration_min=0:  tænd manuelt (slukkes kun af ny kommando)
// action=1, duration_min>0:  tænd i N minutter, sluk derefter automatisk
// action=0:                  sluk øjeblikkeligt (annullerer også auto-sluk)
void executeRelayCommand(RelayCommand cmd) {
  Serial.println("── RelayCommand modtaget ─────────────────");
  Serial.print("  action:       "); Serial.println(cmd.action);
  Serial.print("  duration_min: "); Serial.println(cmd.duration_min);
  Serial.println("──────────────────────────────────────────");

  if (cmd.action == 1) {
    // Tænd relæ
    relaySet(true);

    if (cmd.duration_min > 0) {
      // Auto-sluk efter N minutter
      autoOffTime = millis() + ((unsigned long)cmd.duration_min * 60000UL);
      Serial.print("Auto-sluk om ");
      Serial.print(cmd.duration_min);
      Serial.println(" minutter");
    } else {
      // Manuelt — ingen auto-sluk
      autoOffTime = 0;
      Serial.println("Manuel tilstand — slukkes kun af ny kommando");
    }

  } else if (cmd.action == 0) {
    // Sluk relæ og annullér evt. auto-sluk
    relaySet(false);
    autoOffTime = 0;

  } else {
    Serial.print("ADVARSEL: Ukendt action: ");
    Serial.println(cmd.action);
  }
}

// ── Setup ─────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Starter Relæmodul...");

  // Relæ-pin — sørg for at relæet er slukket ved opstart
  pinMode(RELAY_PIN, OUTPUT);
#if RELAY_ACTIVE_LOW
  digitalWrite(RELAY_PIN, HIGH); // HIGH = slukket ved aktiv-LOW
#else
  digitalWrite(RELAY_PIN, LOW);  // LOW = slukket ved aktiv-HIGH
#endif
  Serial.println("Relæ-pin initialiseret (slukket)");

  // NRF24L01
  if (!radio.begin()) {
    Serial.println("FEJL: NRF24L01 ikke fundet — tjek SPI-forbindelser");
    while (1);
  }

  radio.setChannel(RF_CHANNEL);
  radio.setPALevel(RF24_PA_LOW);
  radio.setDataRate(RF24_1MBPS);
  radio.setAutoAck(true);

  // Lytter på relæ-adressen — hub sender RelayCommand hertil
  radio.openReadingPipe(1, RELAY_ADDR);
  radio.startListening();

  Serial.println("NRF24L01 klar — lytter efter RelayCommand");
  Serial.println("Relæmodul klar");
}

// ── Loop ──────────────────────────────────────────────────────
void loop() {
  // Tjek for indkommende RF-kommando fra hub
  if (radio.available()) {
    RelayCommand cmd;
    radio.read(&cmd, sizeof(cmd));
    executeRelayCommand(cmd);
  }

  // Auto-sluk: tjek om timeren er udløbet
  if (relayOn && autoOffTime > 0 && millis() >= autoOffTime) {
    Serial.println("Auto-sluk timer udløbet — slukker relæ");
    relaySet(false);
    autoOffTime = 0;
  }
}
