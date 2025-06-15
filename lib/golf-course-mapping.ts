import { prisma } from '@/lib/db';

export interface GolfCourseMapping {
  id: number;
  name: string;
  subdomain: string;
}

// For now, we'll use a simple mapping based on golf course names
// In a production system, you might want to store this mapping in the database
export async function getGolfCourseBySubdomain(subdomain: string): Promise<GolfCourseMapping | null> {
  try {
    // First, try to find a golf course with a name that matches the subdomain
    // This is a simple approach - you might want to implement a more sophisticated mapping
    const golfCourse = await prisma.golfCourse.findFirst({
      where: {
        OR: [
          // Try exact match with subdomain
          { name: { contains: subdomain, mode: 'insensitive' } },
          // Try to match if subdomain is a simplified version of the name
          { name: { contains: subdomain.replace(/[-_]/g, ' '), mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true
      }
    });

    if (golfCourse) {
      return {
        id: golfCourse.id,
        name: golfCourse.name,
        subdomain
      };
    }

    return null;
  } catch (error) {
    console.error('Error mapping subdomain to golf course:', error);
    return null;
  }
}

// Alternative approach: Create a dedicated mapping table
// You could create a SubdomainMapping model in your Prisma schema like this:
/*
model SubdomainMapping {
  id           Int        @id @default(autoincrement())
  subdomain    String     @unique
  golfCourseId Int
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  GolfCourse   GolfCourse @relation(fields: [golfCourseId], references: [id])
}
*/

// Then use this function instead:
export async function getGolfCourseBySubdomainMapping(subdomain: string): Promise<GolfCourseMapping | null> {
  try {
    // This would require the SubdomainMapping model
    // const mapping = await prisma.subdomainMapping.findUnique({
    //   where: { subdomain },
    //   include: {
    //     GolfCourse: {
    //       select: {
    //         id: true,
    //         name: true
    //       }
    //     }
    //   }
    // });

    // if (mapping && mapping.isActive) {
    //   return {
    //     id: mapping.GolfCourse.id,
    //     name: mapping.GolfCourse.name,
    //     subdomain
    //   };
    // }

    return null;
  } catch (error) {
    console.error('Error getting golf course mapping:', error);
    return null;
  }
}

// Get all golf courses for admin purposes
export async function getAllGolfCourses() {
  try {
    const golfCourses = await prisma.golfCourse.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        phone: true,
        website: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    return golfCourses;
  } catch (error) {
    console.error('Error getting golf courses:', error);
    return [];
  }
} 