import { Redirect } from 'expo-router';

/** Progress now lives on Profile; old links keep working. */
export default function ProgressRedirect() {
  return <Redirect href="/profile" />;
}
