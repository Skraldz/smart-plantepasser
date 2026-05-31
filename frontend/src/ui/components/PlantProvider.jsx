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

  // Function to refresh the list of plants, fetching data from the API and updating the state accordingly
  async function refreshPlants() {
    try {
      setIsLoadingPlants(true); // Set loading state to true while fetching plant data
      setPlantError(''); // Clear any existing error messages before fetching new data

      const data = await getPlants(1); // Fetch the list of plants for the specified sensor module ID (in this case, 1)

      // For each plant in the fetched data, make an additional API call to get its status and combine the status data with the plant data, 
      // resulting in an array of plants with their corresponding status information.
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
            console.error(`Failed to load status for plant ${plant.name}`, err);

            return {
              ...plant,
              statusData: null,
            };
          }
        })
      );

    // Update the plants state with the fetched plant data, including their status information, allowing components that consume this context to access the most up-to-date plant information.
      setPlants(plantsWithStatus);
    } catch (err) {
      console.error(err);
      setPlantError('Could not load plants.');
    } finally {
      setIsLoadingPlants(false); // Set loading state to false after fetching plant data
    }
  }
// Use the useEffect hook to call the refreshPlants function when the component mounts, ensuring that the plant data is loaded and available for child components that consume this context.
  useEffect(() => {
    refreshPlants();
  }, []);

  // Function to add a new plant to the state, takes a newPlant object as an argument and adds it to the existing list of plants.
  function addPlant(newPlant) {
    setPlants((currentPlants) => [newPlant, ...currentPlants]);
  }

  // Function to delete a plant from the state, takes a plant ID as an argument and removes the corresponding plant from the list.
  function deletePlant(id) {
    setPlants((currentPlants) =>
      currentPlants.filter((plant) => plant.id !== id)
    );
  }

  //  The PlantProvider component provides the plant-related values and functions to child components through the PlantContext.Provider, 
  // allowing them to access the list of plants, the function to set the plants state, the function to add new plants, 
  // the function to delete plants, the function to refresh the plant data, and the loading and error states related to plant data fetching.
  return (
    <PlantContext.Provider
      value={{
        plants,
        setPlants,
        addPlant,
        deletePlant,
        refreshPlants,
        isLoadingPlants,
        plantError,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
}
// Custom hook for accessing the plant context values, allowing components to easily consume the plant-related data and functions provided by the PlantProvider.
export function usePlants() {
  return useContext(PlantContext);
}