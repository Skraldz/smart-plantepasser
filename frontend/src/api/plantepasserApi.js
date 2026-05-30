import client from './client';

// create reusable API functions for making requests to the backend API related to plants, measurements, and commands. 
// These functions use the Axios client to send HTTP requests and return the response data.
export async function getPlants(sensorModuleId = 1) {
  const response = await client.get('/api/v1/plants', {
    params: { sensor_module_id: sensorModuleId },
  });

  return response.data;
}

export async function getPlantStatus(plantIdx, sensorModuleId = 1) {
  const response = await client.get(`/api/v1/plants/${plantIdx}/status`, {
    params: { sensor_module_id: sensorModuleId },
  });

  return response.data;
}

export async function getMeasurements(
  sensorModuleId = 1,
  fromHours = 24,
  toHours = 0
) {
  const response = await client.get('/api/v1/measurements', {
    params: {
      sensor_module_id: sensorModuleId,
      from_hours: fromHours,
      to_hours: toHours,
    },
  });

  return response.data;
}

export async function sendWaterCommand(plantIdx, durationSec = 5) {
  const response = await client.post('/api/v1/commands/water', {
    plant_idx: plantIdx,
    duration_sec: durationSec,
  });

  return response.data;
}

export async function sendRelayCommand(relayAction) {
  const response = await client.post('/api/v1/commands/relay', {
    relay_action: relayAction,
  });

  return response.data;
}

export async function createPlant(sensorModuleId = 1, plantData) {
  const response = await client.post('/api/v1/plants', plantData, {
    params: { sensor_module_id: sensorModuleId },
  });

  return response.data;
}

export async function updatePlant(plantIdx, sensorModuleId = 1, plantData) {
  const response = await client.put(`/api/v1/plants/${plantIdx}`, plantData, {
    params: { sensor_module_id: sensorModuleId },
  });

  return response.data;
}

export async function deletePlant(plantIdx, sensorModuleId = 1) {
  const response = await client.delete(`/api/v1/plants/${plantIdx}`, {
    params: { sensor_module_id: sensorModuleId },
  });

  return response.data;
}
export async function getLightSettings(sensorModuleId = 3) {
  const response = await client.get('/api/v1/light_settings', {
    params: { sensor_module_id: sensorModuleId },
  });

  return response.data;
}

export async function updateLightSettings(sensorModuleId = 3, settings) {
  const response = await client.put('/api/v1/light_settings', settings, {
    params: { sensor_module_id: sensorModuleId },
  });

  return response.data;
}