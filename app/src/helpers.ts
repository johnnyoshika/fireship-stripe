import { auth } from './firebase';

const API = process.env.REACT_APP_API_URL;

/**
 * A helper function to fetch data from your API.
 */
export async function fetchFromAPI(
  endpointURL: string,
  opts?: { method?: string; body?: any },
) {
  const { method, body } = { method: 'POST', body: null, ...opts };

  const token = await auth.currentUser?.getIdToken();

  const res = await fetch(`${API}/${endpointURL}`, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}
