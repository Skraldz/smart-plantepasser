// This file defines a React context and provider for managing clusters in the application. 
// It includes an initial set of clusters, state management for the list of clusters and the currently selected cluster, and a function to add new clusters. 
// The context is made available to child components through the ClusterProvider, and a custom hook useClusters is provided for easy access to the context values.
import { createContext, useContext, useState } from 'react'; // React functions for creating context, accessing context, and managing component state

const ClusterContext = createContext(); // Creating a new context for managing cluster-related data and actions in the application

const initialClusters = [ // Initial set of clusters with predefined properties such as id, name, description, sensor module ID, and status.
  {
    id: 'cluster-1',
    name: 'Greenhouse Cluster',
    description: 'Main prototype setup with one hub, lamp, watering, and up to 4 plants.',
    sensorModuleId: 1,
    status: 'Active',
  },
  {
    id: 'cluster-2',
    name: 'Kitchen Window Cluster',
    description: 'Concept cluster for a smaller home setup.',
    sensorModuleId: 2,
    status: 'Concept',
  },
  {
    id: 'cluster-3',
    name: 'Classroom Cluster',
    description: 'Concept cluster for a school demonstration setup.',
    sensorModuleId: 3,
    status: 'Concept',
  },
];

// The ClusterProvider component manages the state of clusters and provides functions to manipulate that state, such as adding new clusters.
export function ClusterProvider({ children }) { // The ClusterProvider component takes children as a prop, which represents the child components that will have access to the cluster context values.
  const [clusters, setClusters] = useState(initialClusters); // State for managing the list of clusters, initialized with the predefined initialClusters array
  const [selectedClusterId, setSelectedClusterId] = useState('cluster-1'); // State for managing the ID of the currently selected cluster, initialized to the ID of the first cluster in the initialClusters array

  // Determine the currently selected cluster based on the selectedClusterId, defaulting to the first cluster if not found
  const selectedCluster =
    clusters.find((cluster) => cluster.id === selectedClusterId) || clusters[0];

  // Function to add a new cluster to the state, takes a newCluster object as an argument and adds it to the existing list of clusters with a unique ID and default status of 'Concept'.
  function addCluster(newCluster) {
    const clusterToAdd = {
      id: `cluster-${Date.now()}`,
      status: 'Concept',
      ...newCluster,
    };

    // Updating the clusters state by adding the new cluster to the beginning of the existing clusters array, ensuring that the most recently added cluster appears first in the list.
    setClusters((currentClusters) => [clusterToAdd, ...currentClusters]);
  }

  // Providing the cluster-related values and functions to child components through the ClusterContext.Provider, 
  // allowing them to access the list of clusters, the currently selected cluster, the function to set the selected cluster ID, and the function to add new clusters.
  return (
    <ClusterContext.Provider
      value={{
        clusters,
        selectedCluster,
        selectedClusterId,
        setSelectedClusterId,
        addCluster,
      }}
    >
      {children}
    </ClusterContext.Provider>
  );
}

// Custom hook for accessing the cluster context values, allowing components to easily consume the cluster-related data and functions provided by the ClusterProvider.
export function useClusters() {
  return useContext(ClusterContext);
}