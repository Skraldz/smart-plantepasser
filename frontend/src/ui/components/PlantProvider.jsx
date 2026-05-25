import { createContext, useContext, useEffect, useState } from 'react';
import {
  getPlants,
  getPlantStatus,
} from '../../api/plantepasserApi';

const PlantContext = createContext();

export function PlantProvider({ children }) {
  const [plants, setPlants] = useState([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [plantError, setPlantError] = useState('');

  useEffect(() => {
    async function loadPlants() {
      try {
        setIsLoadingPlants(true);
        setPlantError('');

        const data = await getPlants(1);

        const plantsWithStatus = await Promise.all(
          data.map(async (plant) => {
            try {
              const statusData = await getPlantStatus(
                plant.plant_idx,
                plant.sensor_module_id
              );

              return {
                ...plant,
                statusData,
              };
            } catch (err) {
              console.error(
                `Failed to load status for plant ${plant.name}`,
                err
              );

              return {
                ...plant,
                statusData: null,
              };
            }
          })
        );

        setPlants(plantsWithStatus);
      } catch (err) {
        console.error(err);
        setPlantError('Could not load plants.');
      } finally {
        setIsLoadingPlants(false);
      }
    }

    loadPlants();
  }, []);

  function addPlant(newPlant) {
    setPlants((currentPlants) => [newPlant, ...currentPlants]);
  }

  function deletePlant(id) {
    setPlants((currentPlants) =>
      currentPlants.filter((plant) => plant.id !== id)
    );
  }

  return (
    <PlantContext.Provider
      value={{
        plants,
        setPlants,
        addPlant,
        deletePlant,
        isLoadingPlants,
        plantError,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
}

export function usePlants() {
  return useContext(PlantContext);
}