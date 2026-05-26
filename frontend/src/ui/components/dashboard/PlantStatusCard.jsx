function PlantStatusCard({ plant }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <h3 className="text-lg font-semibold text-white">{plant.name}</h3>

      <p className="mt-2 text-sm text-slate-400">
        Plant index: {plant.plant_idx}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Sensor module ID: {plant.sensor_module_id}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Soil moisture: {plant.statusData?.soil_moisture ?? 'No data'}%
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Temperature: {plant.statusData?.temperature ?? 'No data'}°C
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Humidity: {plant.statusData?.humidity ?? 'No data'}%
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Lux: {plant.statusData?.lux ?? 'No data'}
      </p>

      <p className="mt-1 text-sm text-emerald-400">
        Lamp:{' '}
        {plant.statusData?.lamp_on == null
          ? 'No data'
          : plant.statusData.lamp_on === 1
            ? 'On'
            : 'Off'}
      </p>
    </div>
  );
}

export default PlantStatusCard;