import { createContext, useContext, useState } from 'react';

const PlantContext = createContext();

const initialPlants = [
  {
    id: 1,
    name: 'Monstera Deliciosa',
    species: 'Monstera Deliciosa',
    location: 'Living room',
    moisture: '72%',
    light: 'Good',
    status: 'Healthy',
  },
  {
    id: 2,
    name: 'Ficus Elastica',
    species: 'Ficus Elastica',
    location: 'Office',
    moisture: '59%',
    light: 'Medium',
    status: 'Needs attention',
  },
  {
    id: 3,
    name: 'Calathea Orbifolia',
    species: 'Calathea Orbifolia',
    location: 'Bedroom',
    moisture: '81%',
    light: 'High',
    status: 'Healthy',
  },
  {
    id: 4,
    name: 'Snake Plant',
    species: 'Snake Plant',
    location: 'Hallway',
    moisture: '44%',
    light: 'Low',
    status: 'Stable',
  },
  {
    id: 5,
    name: 'Peace Lily',
    species: 'Peace Lily',
    location: 'Kitchen',
    moisture: '66%',
    light: 'Medium',
    status: 'Healthy',
  },
  {
    id: 6,
    name: 'Aloe Vera',
    species: 'Aloe Vera',
    location: 'Window',
    moisture: '38%',
    light: 'High',
    status: 'Stable',
  },
];

export function PlantProvider({ children }) {
  const [plants, setPlants] = useState(initialPlants);

  function addPlant(newPlant) {
    const plantToAdd = {
      id: Date.now(),
      moisture: 'New',
      light: 'Unknown',
      status: 'Monitoring',
      ...newPlant,
    };

    setPlants((currentPlants) => [plantToAdd, ...currentPlants]);
  }

  function deletePlant(id) {
    setPlants((currentPlants) =>
      currentPlants.filter((plant) => plant.id !== id)
    );
  }

  return (
    <PlantContext.Provider value={{ plants, addPlant, deletePlant }}>
      {children}
    </PlantContext.Provider>
  );
}

export function usePlants() {
  return useContext(PlantContext);
}