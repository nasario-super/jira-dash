import { useMemo } from 'react';
import { useAuth } from '../stores/authStore';
import { JiraApiService } from '../services/jiraApi';

export const useJiraApi = () => {
  const { credentials } = useAuth();

  const jiraApi = useMemo(() => {
    if (!credentials) {
      throw new Error('No Jira credentials available');
    }
    return new JiraApiService(credentials);
  }, [credentials]);

  return jiraApi;
};
