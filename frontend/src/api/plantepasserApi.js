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