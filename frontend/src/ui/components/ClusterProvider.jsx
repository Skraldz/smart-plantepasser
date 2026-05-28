import { createContext, useContext, useState } from 'react';

const ClusterContext = createContext();

const initialClusters = [
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

export function ClusterProvider({ children }) {
  const [clusters, setClusters] = useState(initialClusters);
  const [selectedClusterId, setSelectedClusterId] = useState('cluster-1');

  const selectedCluster =
    clusters.find((cluster) => cluster.id === selectedClusterId) || clusters[0];

  function addCluster(newCluster) {
    const clusterToAdd = {
      id: `cluster-${Date.now()}`,
      status: 'Concept',
      ...newCluster,
    };

    setClusters((currentClusters) => [clusterToAdd, ...currentClusters]);
  }

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

export function useClusters() {
  return useContext(ClusterContext);
}