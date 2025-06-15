import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GolfCourseLogin from '../login';
import { getGolfCourseBySubdomain } from '@/lib/golf-course-mapping';
import { getSubdomainData } from '@/lib/subdomains';
import { rootDomain } from '@/lib/utils';

export async function generateMetadata({
  params
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const golfCourse = await getGolfCourseBySubdomain(subdomain);

  return {
    title: `Staff Login | ${golfCourse?.name || subdomain}.${rootDomain}`,
    description: `Staff login for ${golfCourse?.name || subdomain}`
  };
}

export default async function GolfCourseLoginPage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  
  // Check if subdomain exists in the subdomain system
  const subdomainData = await getSubdomainData(subdomain);
  if (!subdomainData) {
    notFound();
  }

  // Try to map subdomain to a golf course
  const golfCourse = await getGolfCourseBySubdomain(subdomain);

  return (
    <GolfCourseLogin
      subdomain={subdomain}
      golfCourseId={golfCourse?.id}
      golfCourseName={golfCourse?.name}
    />
  );
} 