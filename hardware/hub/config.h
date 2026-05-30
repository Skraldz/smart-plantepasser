#pragma once

#define WIFI_SSID "test"
#define WIFI_PASSWORD "test"

#define BACKEND_HEALTH_URL "https://plantapi.mandingo.dk/"
#define BACKEND_URL "https://plantapi.mandingo.dk/api/v1/measurements"
#define COMMANDS_URL "https://plantapi.mandingo.dk/api/v1/commands/pending"
#define SETTINGS_URL "https://plantapi.mandingo.dk/api/v1/settings?sensor_module_id=1"

#define DEVICE_SECRET "spis_mere_ost"

#define SD_CS_PIN 22

// Defaults - overskrives af backend settings ved opstart
#define SOIL_DRY_THRESHOLD 30
#define LUX_LOW_THRESHOLD 200
#define LUX_THRESHOLD_HIGH 2000
#define LIGHT_PERIOD_START 8
#define LIGHT_PERIOD_END 16
#define WATERING_DURATION 5