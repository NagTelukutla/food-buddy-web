import LoadingSpinner from './LoadingSpinner';
import PageContainer from './PageContainer';

export default function RouteFallback() {
  return (
    <PageContainer>
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </PageContainer>
  );
}
