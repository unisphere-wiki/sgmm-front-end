import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setGraphData, setLoading } from '../../store/slices/graphSlice';
import nodeServiceFactory from '../../services/nodeServiceFactory';

const GraphLoader = () => {
  const dispatch = useDispatch();
  const nodeService = nodeServiceFactory.getService();

  useEffect(() => {
    const loadGraphData = async () => {
      try {
        dispatch(setLoading(true));
        const graphData = await nodeService.getNodes();
        dispatch(setGraphData(graphData));
      } catch (error) {
        console.error('Error loading graph data:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadGraphData();
  }, [dispatch]);

  return null;
};

export default GraphLoader; 