#pragma once

#define WIFI_SSID "WIFI_NAME"
#define WIFI_PASSWORD "WIFI_PASSWORD"

#define BACKEND_HEALTH_URL "https://plantapi.mandingo.dk/"
#define BACKEND_URL "https://plantapi.mandingo.dk/api/v1/measurements"
#define COMMANDS_URL "https://plantapi.mandingo.dk/api/v1/commands/pending"
#define SETTINGS_URL "https://plantapi.mandingo.dk/api/v1/settings?sensor_module_id=1"

#define DEVICE_SECRET "DEVICE_SECRET"

#define SD_CS_PIN 15

// Defaults - overskrives af backend settings ved opstart
#define SOIL_DRY_THRESHOLD 30
#define LUX_LOW_THRESHOLD 200
#define LIGHT_PERIOD_START 8
#define LIGHT_PERIOD_END 16
#define WATERING_DURATION 5