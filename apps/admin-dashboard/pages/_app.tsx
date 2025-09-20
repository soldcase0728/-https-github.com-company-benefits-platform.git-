import '../src/styles/neural-dashboard-legacy.css';
import '../src/styles/tokens.css';
import type { AppProps } from 'next/app';
import { Layout } from '../src/components/layout/Layout';

export default function MyApp({ Component, pageProps, router }: AppProps & { router: any }) {
  // Only wrap admin routes with the Layout for now
  const useLayout = router.pathname.startsWith('/admin');
  if (useLayout) {
    return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    );
  }
  return <Component {...pageProps} />;
}
